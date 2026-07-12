use calamine::{open_workbook_from_rs, Data, Reader, Xlsx};
use excel_structs::excel_info::ExcelCellFormat;
use js_sys::{Object, Reflect};
use rust_xlsxwriter::*;
use std::collections::HashMap;
use std::fmt;
use std::future::Future;
use std::io::Cursor;
use std::pin::Pin;
use std::sync::LazyLock;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;
use wasm_bindgen_futures::JsFuture;

mod excel_structs;
#[cfg(test)]
mod tests;

pub use excel_structs::dynamic_excel_data::DynamicExcelData;
pub use excel_structs::excel_column_data::ExcelColumnData;
pub use excel_structs::excel_data::ExcelData;
pub use excel_structs::excel_info::ExcelColumnInfo;
pub use excel_structs::excel_info::ExcelInfo;
pub use excel_structs::excel_row_data::ExcelRowData;

const SECONDS_IN_A_DAY: f64 = 86400.0;
const EXCEL_BASE_DATE: i64 = 25569; // Number of days from 1899-12-30 to 1970-01-01

#[derive(Debug)]
struct StructuredWasmError {
    message: String,
    code: &'static str,
    params: Vec<(String, String)>,
}

impl StructuredWasmError {
    fn new(message: String, code: &'static str, params: &[(&str, String)]) -> Self {
        Self {
            message,
            code,
            params: params
                .iter()
                .map(|(key, value)| ((*key).to_string(), value.clone()))
                .collect(),
        }
    }
}

impl fmt::Display for StructuredWasmError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.message)
    }
}

impl std::error::Error for StructuredWasmError {}

fn create_structured_error(
    message: impl AsRef<str>,
    code: &'static str,
    params: &[(&str, String)],
) -> StructuredWasmError {
    StructuredWasmError::new(message.as_ref().to_string(), code, params)
}

fn structured_error_to_js(error: &StructuredWasmError) -> JsValue {
    let js_error = js_sys::Error::new(&error.message);
    let js_value: JsValue = js_error.into();
    let params = Object::new();

    for (key, value) in &error.params {
        let _ = Reflect::set(&params, &JsValue::from_str(key), &JsValue::from_str(value));
    }

    let _ = Reflect::set(
        &js_value,
        &JsValue::from_str("name"),
        &JsValue::from_str("ImportExportWasmError"),
    );
    let _ = Reflect::set(
        &js_value,
        &JsValue::from_str("code"),
        &JsValue::from_str(error.code),
    );
    let _ = Reflect::set(&js_value, &JsValue::from_str("params"), &params);
    js_value
}

fn error_to_js_value(error: &(dyn std::error::Error + 'static)) -> JsValue {
    if let Some(structured_error) = error.downcast_ref::<StructuredWasmError>() {
        return structured_error_to_js(structured_error);
    }
    JsError::new(&error.to_string()).into()
}

static DEFAULT_FORMAT: LazyLock<Format> = LazyLock::new(|| {
    Format::new()
        .set_align(FormatAlign::VerticalCenter)
        .set_text_wrap()
});

static DEFAULT_DATE_FORMAT: LazyLock<Format> = LazyLock::new(|| {
    Format::new()
        .set_align(FormatAlign::VerticalCenter)
        .set_num_format("yyyy-mm-dd")
        .set_text_wrap()
});

static DEFAULT_HEADER_FORMAT: LazyLock<Format> = LazyLock::new(|| {
    Format::new()
        .set_align(FormatAlign::VerticalCenter)
        .set_align(FormatAlign::Center)
        .set_bold()
        .set_text_wrap()
});

#[wasm_bindgen(js_name= createTemplate)]
pub fn create_template(info: ExcelInfo) -> Result<Vec<u8>, JsValue> {
    create_template_buffer(&info).map_err(|e| error_to_js_value(e.as_ref()))
}

#[wasm_bindgen(js_name = importData)]
pub fn import_data(info: ExcelInfo, excel_bytes: &[u8]) -> Result<ExcelData, JsValue> {
    import_data_buffer(info, excel_bytes).map_err(|e| error_to_js_value(e.as_ref()))
}

#[wasm_bindgen(js_name = importDynamicData)]
pub fn import_dynamic_data(
    sheet_name: Option<String>,
    header_row: Option<u32>,
    excel_bytes: &[u8],
) -> Result<DynamicExcelData, JsValue> {
    import_dynamic_data_buffer(sheet_name, header_row, excel_bytes)
        .map_err(|e| error_to_js_value(e.as_ref()))
}

#[wasm_bindgen(js_name = exportData)]
pub fn export_data(info: ExcelInfo, data: ExcelData) -> js_sys::Promise {
    let future = async move {
        match export_data_buffer(&info, &data).await {
            Ok(buffer) => {
                let uint8array = js_sys::Uint8Array::from(&buffer[..]);
                Ok(uint8array.into())
            }
            Err(e) => Err(error_to_js_value(e.as_ref())),
        }
    };
    future_to_promise(future)
}

#[cfg(feature = "benchmarks")]
#[doc(hidden)]
pub fn benchmark_import_data(
    info: ExcelInfo,
    excel_bytes: &[u8],
) -> Result<ExcelData, Box<dyn std::error::Error>> {
    import_data_buffer(info, excel_bytes)
}

#[cfg(feature = "benchmarks")]
#[doc(hidden)]
pub async fn benchmark_export_data(
    info: ExcelInfo,
    data: ExcelData,
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    export_data_buffer(&info, &data).await
}

fn create_template_workbook(
    info: &ExcelInfo,
) -> Result<(Workbook, Vec<ExcelColumnPosition>), Box<dyn std::error::Error>> {
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    if let Some(default_row_height) = info.default_row_height {
        worksheet.set_default_row_height(default_row_height);
    }
    let column_positions = get_column_positions(&info);
    let max_column_x = column_positions.iter().map(|p| p.x2).max().unwrap_or(0);
    if let Some(title) = info.title.as_ref() {
        if let Some(title_format) = &info.title_format {
            let f = get_cell_format(title_format);
            worksheet.merge_range(info.dy, info.dx, info.dy, max_column_x, title.as_str(), &f)?;
        } else {
            worksheet.merge_range(
                info.dy,
                info.dx,
                info.dy,
                max_column_x,
                title.as_str(),
                &DEFAULT_HEADER_FORMAT,
            )?;
        }
        if let Some(title_height) = info.title_height {
            worksheet.set_row_height(info.dy, title_height)?;
        }
    }
    for position in &column_positions {
        let column = find_column(info, &position.key)?;
        let f = column.format.as_ref().map(get_cell_format);
        if position.is_single_cell() {
            worksheet.write_string(position.y1, position.x1, &column.name)?;
            worksheet.set_cell_format(
                position.y1,
                position.x1,
                f.as_ref().unwrap_or(&DEFAULT_HEADER_FORMAT),
            )?;
        } else {
            worksheet.merge_range(
                position.y1,
                position.x1,
                position.y2,
                position.x2,
                &column.name,
                f.as_ref().unwrap_or(&DEFAULT_HEADER_FORMAT),
            )?;
        }
        if let Some(note) = column.note.as_ref() {
            let note = Note::new(note.clone()).set_author(info.author.clone());
            worksheet.insert_note(position.y1, position.x1, &note)?;
        }
        if position.is_leaf {
            worksheet.set_column_width(position.x1, column.width)?;
        }
        if let Some(header_row_height) = info.header_row_height {
            worksheet.set_row_height(position.y1, header_row_height)?;
        }
    }

    if info.is_header_freeze {
        let freeze_row = column_positions
            .iter()
            .map(|position| position.y2 + 1)
            .max()
            .unwrap_or(info.dy + u32::from(info.title.is_some()));
        worksheet.set_freeze_panes(freeze_row, 0)?;
    }

    worksheet.set_name(info.sheet_name.as_str())?;
    let create_time =
        ExcelDateTime::parse_from_str(&info.create_time).map_err(|e| XlsxError::from(e))?;

    let properties = DocProperties::new()
        .set_title(info.name.clone())
        .set_author(info.author.clone().as_str())
        .set_creation_datetime(&create_time);

    workbook.set_properties(&properties);
    Ok((workbook, column_positions))
}

fn get_rows_data<'a>(
    columns: &'a Vec<ExcelColumnPosition>,
    range: &'a calamine::Range<calamine::Data>,
) -> Vec<ExcelRowData> {
    let header_max_y = columns.iter().map(|c| c.y2).max().unwrap_or(0) as usize + 1;
    let leaf_columns = columns
        .iter()
        .filter(|c| c.is_leaf)
        .map(|c| (c.key.clone(), c.x1 as usize, c.data_type.clone()))
        .collect::<Vec<(String, usize, String)>>();
    let Some((range_start_y, _)) = range.start() else {
        return Vec::new();
    };
    let Some((range_end_y, _)) = range.end() else {
        return Vec::new();
    };
    let first_data_row = std::cmp::max(header_max_y as u32, range_start_y);
    if first_data_row > range_end_y {
        return Vec::new();
    }

    (first_data_row..=range_end_y)
        .map(|row_index| ExcelRowData {
            columns: leaf_columns
                .iter()
                .map(|(key, x1, data_type)| {
                    let value = range
                        .get_value((row_index, *x1 as u32))
                        .map(|cell| format_value(cell, data_type))
                        .unwrap_or_default();
                    ExcelColumnData {
                        key: key.clone(),
                        value,
                        children: Vec::new(),
                    }
                })
                .collect(),
        })
        .collect()
}

fn excel_to_date_string(excel_date: f64) -> String {
    let days_since_epoch = excel_date - EXCEL_BASE_DATE as f64;
    let seconds_since_epoch = days_since_epoch * SECONDS_IN_A_DAY;
    let date_time = chrono::DateTime::from_timestamp(seconds_since_epoch as i64, 0);
    match date_time {
        Some(dt) => dt.format("%Y-%m-%d %H:%M:%S").to_string(),
        None => "".to_string(),
    }
}

fn format_cell_value(data: &Data, treat_float_as_date: bool) -> String {
    match data {
        Data::Empty => "".to_string(),
        Data::String(s) => s.clone(),
        Data::Float(f) => {
            if treat_float_as_date {
                excel_to_date_string(*f)
            } else {
                f.to_string()
            }
        }
        Data::Int(i) => i.to_string(),
        Data::Bool(b) => b.to_string(),
        Data::DateTime(dt) => excel_to_date_string(dt.as_f64()),
        _ => data.to_string(),
    }
}

fn format_value(data: &Data, data_type: &str) -> String {
    format_cell_value(data, data_type.eq_ignore_ascii_case("date"))
}

fn format_dynamic_value(data: &Data) -> String {
    format_cell_value(data, false)
}

fn format_header_value(data: Option<&Data>) -> String {
    match data {
        Some(Data::Empty) => "".to_string(),
        Some(Data::String(s)) => s.trim().to_string(),
        Some(value) => value.to_string().trim().to_string(),
        None => "".to_string(),
    }
}

fn get_excel_column_name(column_index: u16) -> String {
    let mut column_number = column_index as usize + 1;
    let mut letters = Vec::new();
    while column_number > 0 {
        let remainder = (column_number - 1) % 26;
        letters.push((b'A' + remainder as u8) as char);
        column_number = (column_number - 1) / 26;
    }
    letters.into_iter().rev().collect()
}

fn get_excel_cell_ref(x: u16, y: u32) -> String {
    format!("{}{}", get_excel_column_name(x), y + 1)
}

fn validate_headers(
    info: &ExcelInfo,
    range: &calamine::Range<Data>,
    column_positions: &[ExcelColumnPosition],
    actual_sheet_name: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    for position in column_positions.iter() {
        let expected_header = info
            .columns
            .iter()
            .find(|column| column.key == position.key)
            .map(|column| column.name.as_str())
            .ok_or_else(|| {
                create_structured_error(
                    &format!("Column key missing: {}", position.key),
                    "COLUMN_KEY_MISSING",
                    &[("columnKey", position.key.clone())],
                )
            })?;
        let actual_header = format_header_value(range.get_value((position.y1, position.x1 as u32)));
        if actual_header != expected_header.trim() {
            let cell_ref = get_excel_cell_ref(position.x1, position.y1);
            return Err(create_structured_error(
                &format!(
                    "Header mismatch at {} in sheet '{}': expected '{}', got '{}'",
                    cell_ref,
                    actual_sheet_name,
                    expected_header.trim(),
                    actual_header
                ),
                "HEADER_MISMATCH",
                &[
                    ("cell", cell_ref),
                    ("sheetName", actual_sheet_name.to_string()),
                    ("expected", expected_header.to_string()),
                    ("actual", actual_header),
                ],
            )
            .into());
        }
    }
    Ok(())
}

fn resolve_sheet_name(
    workbook: &Xlsx<Cursor<&[u8]>>,
    requested_sheet_name: Option<&str>,
) -> Result<String, Box<dyn std::error::Error>> {
    if let Some(sheet_name) = requested_sheet_name
        .map(|value| value.trim())
        .filter(|value| !value.is_empty())
    {
        if workbook
            .sheet_names()
            .iter()
            .any(|candidate| candidate == sheet_name)
        {
            return Ok(sheet_name.to_string());
        }
    }

    workbook.sheet_names().first().cloned().ok_or_else(|| {
        create_structured_error(
            "Workbook contains no worksheets",
            "WORKBOOK_NO_WORKSHEETS",
            &[],
        )
        .into()
    })
}

fn resolve_dynamic_header_row(
    range: &calamine::Range<Data>,
    header_row: Option<u32>,
) -> Result<u32, Box<dyn std::error::Error>> {
    let Some((range_start_y, range_start_x)) = range.start() else {
        return Err(
            create_structured_error("Worksheet contains no cells", "WORKSHEET_EMPTY", &[]).into(),
        );
    };
    let Some((range_end_y, range_end_x)) = range.end() else {
        return Err(
            create_structured_error("Worksheet contains no cells", "WORKSHEET_EMPTY", &[]).into(),
        );
    };

    if let Some(header_row) = header_row {
        if header_row == 0 {
            return Err(create_structured_error(
                "Dynamic import option 'headerRow' must be greater than or equal to 1",
                "DYNAMIC_HEADER_ROW_MIN",
                &[],
            )
            .into());
        }
        let zero_based_row = header_row - 1;
        if zero_based_row < range_start_y || zero_based_row > range_end_y {
            return Err(create_structured_error(
                &format!(
                    "Dynamic import option 'headerRow' must point to a row within the used range. Received {}.",
                    header_row
                ),
                "DYNAMIC_HEADER_ROW_RANGE",
                &[("headerRow", header_row.to_string())],
            )
            .into());
        }
        return Ok(zero_based_row);
    }

    for row_index in range_start_y..=range_end_y {
        let has_header = (range_start_x..=range_end_x).any(|column_index| {
            !format_header_value(range.get_value((row_index, column_index))).is_empty()
        });
        if has_header {
            return Ok(row_index);
        }
    }

    Err(create_structured_error(
        "Dynamic import could not find a non-empty header row in the worksheet",
        "DYNAMIC_HEADER_ROW_NOT_FOUND",
        &[],
    )
    .into())
}

fn get_dynamic_headers(
    range: &calamine::Range<Data>,
    header_row: u32,
) -> Result<Vec<(String, u32)>, Box<dyn std::error::Error>> {
    let Some((_, range_start_x)) = range.start() else {
        return Err(
            create_structured_error("Worksheet contains no cells", "WORKSHEET_EMPTY", &[]).into(),
        );
    };
    let Some((_, range_end_x)) = range.end() else {
        return Err(
            create_structured_error("Worksheet contains no cells", "WORKSHEET_EMPTY", &[]).into(),
        );
    };

    let mut seen_headers = std::collections::HashSet::new();
    let mut headers = Vec::new();

    for column_index in range_start_x..=range_end_x {
        let header = format_header_value(range.get_value((header_row, column_index)));
        if header.is_empty() {
            let cell_ref = get_excel_cell_ref(column_index as u16, header_row);
            return Err(create_structured_error(
                &format!(
                    "Dynamic import requires non-empty header names. Found an empty header at {}.",
                    cell_ref
                ),
                "DYNAMIC_HEADER_EMPTY",
                &[("cell", cell_ref)],
            )
            .into());
        }
        if !seen_headers.insert(header.clone()) {
            let cell_ref = get_excel_cell_ref(column_index as u16, header_row);
            return Err(create_structured_error(
                &format!(
                    "Dynamic import requires unique header names. Duplicate header '{}' found at {}.",
                    header, cell_ref
                ),
                "DYNAMIC_HEADER_DUPLICATE",
                &[("header", header), ("cell", cell_ref)],
            )
            .into());
        }
        headers.push((header, column_index));
    }

    Ok(headers)
}

fn get_dynamic_rows_data(
    range: &calamine::Range<Data>,
    header_row: u32,
    headers: &[(String, u32)],
) -> Vec<ExcelRowData> {
    if range.start().is_none() {
        return Vec::new();
    }
    let Some((range_end_y, _)) = range.end() else {
        return Vec::new();
    };
    let first_data_row = header_row + 1;
    if first_data_row > range_end_y {
        return Vec::new();
    }

    (first_data_row..=range_end_y)
        .map(|row_index| ExcelRowData {
            columns: headers
                .iter()
                .map(|(header, column_index)| {
                    let value = range
                        .get_value((row_index, *column_index))
                        .map(format_dynamic_value)
                        .unwrap_or_default();
                    ExcelColumnData {
                        key: header.clone(),
                        value,
                        children: Vec::new(),
                    }
                })
                .collect(),
        })
        .collect()
}

fn import_data_buffer(
    info: ExcelInfo,
    excel_bytes: &[u8],
) -> Result<ExcelData, Box<dyn std::error::Error>> {
    let cursor = Cursor::new(excel_bytes);
    let mut workbook: Xlsx<_> = open_workbook_from_rs(cursor)?;
    let mut excel_data = ExcelData { rows: Vec::new() };
    let sheet_name = resolve_sheet_name(&workbook, None)?;
    let range = workbook.worksheet_range(sheet_name.as_str())?;
    let column_positions = get_column_positions(&info);
    validate_headers(&info, &range, &column_positions, sheet_name.as_str())?;
    excel_data.rows = get_rows_data(&column_positions, &range);
    Ok(excel_data)
}

fn import_dynamic_data_buffer(
    sheet_name: Option<String>,
    header_row: Option<u32>,
    excel_bytes: &[u8],
) -> Result<DynamicExcelData, Box<dyn std::error::Error>> {
    let cursor = Cursor::new(excel_bytes);
    let mut workbook: Xlsx<_> = open_workbook_from_rs(cursor)?;
    let sheet_name = resolve_sheet_name(&workbook, sheet_name.as_deref())?;
    let range = workbook.worksheet_range(sheet_name.as_str())?;
    let header_row = resolve_dynamic_header_row(&range, header_row)?;
    let headers = get_dynamic_headers(&range, header_row)?;
    let rows = get_dynamic_rows_data(&range, header_row, &headers);

    Ok(DynamicExcelData {
        sheet_name,
        headers: headers.into_iter().map(|(header, _)| header).collect(),
        rows,
    })
}

async fn export_data_buffer(
    info: &ExcelInfo,
    data: &ExcelData,
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let (mut workbook, column_positions) = create_template_workbook(&info)?;
    let mut column_positions_map: HashMap<String, (&ExcelColumnPosition, &ExcelColumnInfo)> =
        HashMap::new();
    for column_position in &column_positions {
        let column = find_column(info, &column_position.key)?;
        column_positions_map.insert(column_position.key.clone(), (column_position, column));
    }

    let y_min = column_positions.iter().map(|p| p.y2).max().unwrap_or(0) + 1;
    let mut y = y_min;
    let mut worksheet = workbook.worksheet_from_name(&info.sheet_name)?;
    let root_group_keys = column_positions_map
        .iter()
        .filter(|(_, (_, info))| info.is_root_group())
        .map(|(key, _)| key)
        .collect::<Vec<&String>>();

    let total_rows = data.rows.len();

    for (row_index, row) in data.rows.iter().enumerate() {
        if let Some(callback) = &info.progress_callback {
            let progress = (row_index as f64) / (total_rows as f64);
            let _ = callback.call1(
                &wasm_bindgen::JsValue::NULL,
                &wasm_bindgen::JsValue::from_f64(progress),
            );
        }

        let mut data_with_children = Vec::new();
        let mut data_without_children = Vec::new();
        for column_data in row.columns.iter() {
            if root_group_keys.contains(&&column_data.key) {
                data_with_children.push(column_data);
            } else {
                data_without_children.push(column_data);
            }
        }

        let next_y = write_children_row(
            worksheet,
            data_with_children,
            y,
            &column_positions_map,
            &info,
        )
        .await?; // Add .await here
        let y2 = next_y - 1;
        let has_children = y2 > y;

        for (_, column_data) in data_without_children.iter().enumerate() {
            if let Some((pos, column)) = column_positions_map.get(&column_data.key) {
                if has_children {
                    write_range_cell(
                        worksheet,
                        pos.x1,
                        pos.x2,
                        y,
                        y2,
                        &column_data.value,
                        &column,
                    )?;
                } else {
                    write_single_cell(worksheet, pos.x1, y2, &column_data.value, &column, &info)
                        .await?; // Add .await here
                }
            }
        }
        y = next_y;
    }

    if let Some(callback) = &info.progress_callback {
        let _ = callback.call1(
            &wasm_bindgen::JsValue::NULL,
            &wasm_bindgen::JsValue::from_f64(1.0),
        );
    }

    for (_, (pos, info)) in &column_positions_map {
        if info.allowed_values.is_empty() || !pos.is_leaf {
            continue;
        }
        add_data_validation(&mut worksheet, info, pos.x1, y_min, y)?;
    }

    Ok(workbook.save_to_buffer()?)
}

fn add_data_validation(
    worksheet: &mut Worksheet,
    column: &ExcelColumnInfo,
    column_index: u16,
    first_row: u32,
    last_row: u32,
) -> Result<(), Box<dyn std::error::Error>> {
    let data_validation = DataValidation::new().allow_list_strings(&column.allowed_values)?;
    worksheet.add_data_validation(
        first_row,
        column_index,
        last_row,
        column_index,
        &data_validation,
    )?;
    Ok(())
}

fn create_template_buffer(info: &ExcelInfo) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let (mut workbook, _) = create_template_workbook(&info)?;
    let buffer = workbook.save_to_buffer()?;
    Ok(buffer)
}

#[derive(Debug)]
pub struct ExcelColumnPosition {
    pub x1: u16,
    pub y1: u32,
    pub x2: u16,
    pub y2: u32,
    pub key: String,
    pub data_type: String,
    pub is_leaf: bool,
}

impl ExcelColumnPosition {
    pub fn is_single_cell(&self) -> bool {
        self.x1 == self.x2 && self.y1 == self.y2
    }
}

fn validate_image_data(image_data: &[u8], url: &str) -> Result<Image, Box<dyn std::error::Error>> {
    if image_data.is_empty() {
        return Err(create_structured_error(
            &format!("Image data is empty for URL: {}", url),
            "IMAGE_FETCHER_EMPTY_DATA",
            &[("url", url.to_string())],
        )
        .into());
    }
    let image = Image::new_from_buffer(image_data).map_err(|e| {
        create_structured_error(
            &format!("Failed to parse image from URL {}: {}", url, e.to_string()),
            "IMAGE_PARSE_FAILED",
            &[("url", url.to_string()), ("reason", e.to_string())],
        )
    })?;
    Ok(image)
}

async fn write_single_cell(
    worksheet: &mut Worksheet,
    x: u16,
    y: u32,
    value: &str,
    column: &ExcelColumnInfo,
    info: &ExcelInfo,
) -> Result<(), Box<dyn std::error::Error>> {
    let data_type = &column.data_type;
    let trimmed_value = value.trim();
    let mut is_date_type = false;
    if data_type.eq_ignore_ascii_case("image") {
        if let Some(fetcher) = &info.image_fetcher {
            let values: Vec<&str> = value.split(",").collect();
            for v in values.iter() {
                let url_value = JsValue::from_str(v);
                let result = fetcher.call1(&JsValue::NULL, &url_value).map_err(|e| {
                    create_structured_error(
                        &format!("Failed to call image fetcher: {:?}", e),
                        "IMAGE_FETCHER_CALL_FAILED",
                        &[("reason", format!("{:?}", e))],
                    )
                })?;
                let promise = js_sys::Promise::resolve(&result);
                let result = JsFuture::from(promise).await.map_err(|e| {
                    create_structured_error(
                        &format!("Failed to wait for image fetcher promise: {:?}", e),
                        "IMAGE_FETCHER_WAIT_FAILED",
                        &[("reason", format!("{:?}", e))],
                    )
                })?;

                if result.is_object() {
                    let image_data: Vec<u8> = js_sys::Uint8Array::new(&result).to_vec();
                    let image = validate_image_data(&image_data, v)?;

                    worksheet.insert_image_fit_to_cell(y, x, &image, true)?;
                    return Ok(());
                } else {
                    return Err(create_structured_error(
                        &format!("Image fetcher returned invalid data for URL: {}", v),
                        "IMAGE_FETCHER_INVALID_DATA",
                        &[("url", v.to_string())],
                    )
                    .into());
                }
            }
        } else {
            return Err(create_structured_error(
                "Image fetcher is not defined",
                "IMAGE_FETCHER_REQUIRED",
                &[],
            )
            .into());
        }
    } else if data_type.eq_ignore_ascii_case("number") {
        if trimmed_value.is_empty() {
            worksheet.write_string(y, x, "")?;
        } else {
            let parsed_number = trimmed_value.parse::<f64>().map_err(|error| {
                create_structured_error(
                    &format!("Invalid number value '{}'", value),
                    "EXPORT_NUMBER_VALUE_INVALID",
                    &[
                        ("value", value.to_string()),
                        ("columnKey", column.key.clone()),
                        ("reason", error.to_string()),
                    ],
                )
            })?;
            worksheet.write_number(y, x, parsed_number)?;
        }
    } else if data_type.eq_ignore_ascii_case("date") {
        if trimmed_value.is_empty() {
            worksheet.write_string(y, x, "")?;
        } else {
            let date_time = ExcelDateTime::parse_from_str(trimmed_value).map_err(|error| {
                create_structured_error(
                    &format!("Invalid date value '{}'", value),
                    "EXPORT_DATE_VALUE_INVALID",
                    &[
                        ("value", value.to_string()),
                        ("columnKey", column.key.clone()),
                        ("reason", error.to_string()),
                    ],
                )
            })?;
            worksheet.write_datetime(y, x, date_time)?;
            is_date_type = true;
        }
    } else {
        worksheet.write_string(y, x, value)?;
    }
    if let Some(f) = get_column_value_format(value, &column) {
        worksheet.set_cell_format(y, x, &f)?;
    } else {
        worksheet.set_cell_format(
            y,
            x,
            if is_date_type {
                &DEFAULT_DATE_FORMAT
            } else {
                &DEFAULT_FORMAT
            },
        )?;
    }
    Ok(())
}

fn write_children_row<'a>(
    worksheet: &'a mut Worksheet,
    row: Vec<&'a ExcelColumnData>,
    y: u32,
    column_positions_map: &'a HashMap<String, (&'a ExcelColumnPosition, &'a ExcelColumnInfo)>,
    info: &'a ExcelInfo,
) -> Pin<Box<dyn Future<Output = Result<u32, Box<dyn std::error::Error>>> + 'a>> {
    Box::pin(async move {
        let mut current_y = y;
        let mut t_y = y;
        for (_, column_data) in row.iter().enumerate() {
            if !column_data.children.is_empty() {
                for d in column_data.children.iter() {
                    t_y = write_children_row(
                        worksheet,
                        d.columns.iter().collect(),
                        t_y,
                        column_positions_map,
                        &info,
                    )
                    .await?;
                }
                let last_row = t_y - 1;

                if t_y > current_y {
                    current_y = last_row;
                }
                if let Some((pos, column)) = column_positions_map.get(&column_data.key) {
                    if !column.is_root_group() {
                        if y == last_row {
                            write_single_cell(
                                worksheet,
                                pos.x1,
                                y,
                                &column_data.value,
                                &column,
                                info,
                            )
                            .await?;
                        } else {
                            write_range_cell(
                                worksheet,
                                pos.x1,
                                pos.x2,
                                y,
                                last_row,
                                &column_data.value,
                                &column,
                            )?;
                        }
                    }
                }
                t_y = y;
                continue;
            }
            if let Some((pos, column)) = column_positions_map.get(&column_data.key) {
                write_single_cell(worksheet, pos.x1, y, &column_data.value, &column, &info).await?;
            }
        }
        Ok(current_y + 1)
    })
}

fn write_range_cell(
    worksheet: &mut Worksheet,
    x1: u16,
    x2: u16,
    y1: u32,
    y2: u32,
    value: &str,
    column: &ExcelColumnInfo,
) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(f) = get_column_value_format(value, column) {
        worksheet.merge_range(y1, x1, y2, x2, value, &f)?;
    } else {
        worksheet.merge_range(y1, x1, y2, x2, value, &DEFAULT_FORMAT)?;
    }
    Ok(())
}

fn get_cell_format(value_format: &ExcelCellFormat) -> Format {
    let mut result = Format::new();
    result = result.set_font_size(value_format.font_size);
    result = result.set_background_color(Color::from(value_format.background_color.as_str()));
    result = result.set_font_color(Color::from(value_format.color.as_str()));
    if value_format.bold {
        result = result.set_bold();
    }
    if value_format.italic {
        result = result.set_italic();
    }
    if value_format.strikethrough {
        result = result.set_font_strikethrough();
    }
    if value_format.underline {
        result = result.set_underline(FormatUnderline::Single);
    }
    if value_format.align.eq_ignore_ascii_case("center") {
        result = result.set_align(FormatAlign::Center);
    } else if value_format.align.eq_ignore_ascii_case("right") {
        result = result.set_align(FormatAlign::Right);
    } else if value_format.align.eq_ignore_ascii_case("left") {
        result = result.set_align(FormatAlign::Left);
    }
    if value_format.align_vertical.eq_ignore_ascii_case("center") {
        result = result.set_align(FormatAlign::VerticalCenter);
    } else if value_format.align_vertical.eq_ignore_ascii_case("top") {
        result = result.set_align(FormatAlign::Top);
    } else if value_format.align_vertical.eq_ignore_ascii_case("bottom") {
        result = result.set_align(FormatAlign::Bottom);
    }
    if let Some(df) = &value_format.date_format {
        result = result.set_num_format(df.as_str());
    }
    if let Some(border_color) = &value_format.border_color {
        let c = Color::from(border_color.as_str());
        result = result.set_border(FormatBorder::Thin);
        result = result.set_border_color(c);
    }
    if let Some(date_format) = &value_format.date_format {
        result = result.set_num_format(date_format.as_str());
    }
    result = result.set_text_wrap();
    result
}

fn get_column_value_format(value: &str, column: &ExcelColumnInfo) -> Option<Format> {
    column.get_value_format(value).map(get_cell_format)
}

fn get_parent_times(
    leaf_columns: &[&ExcelColumnInfo],
    parent_map: &HashMap<String, String>,
) -> HashMap<String, u16> {
    let mut parent_times: HashMap<String, u16> = HashMap::new();
    for column in leaf_columns.iter() {
        let mut p: &String = &column.parent;
        while let Some(parent) = parent_map.get(p) {
            *parent_times.entry(p.clone()).or_insert(0) += 1;
            p = parent;
        }
    }
    parent_times
}

fn get_column_positions(info: &ExcelInfo) -> Vec<ExcelColumnPosition> {
    let parent_map = info.get_parent_map();
    let leaf_columns = info.get_leaf_columns();
    let levels = get_levels(&leaf_columns, &parent_map);
    let parent_counts = get_parent_times(&leaf_columns, &parent_map);

    let mut positions: Vec<ExcelColumnPosition> = Vec::new();
    let dx = info.dx;
    let dy = info.dy + if info.title.is_some() { 1 } else { 0 };
    let max_level = levels.values().max().unwrap_or(&0);
    let mut x = 0;
    for column in info.columns.iter() {
        let level = levels.get(&column.key).unwrap_or(&0);
        let count = parent_counts.get(&column.key).unwrap_or(&1);
        let is_leaf = !parent_map.contains_key(&column.key);
        let position = ExcelColumnPosition {
            x1: x,
            y1: *level,
            x2: x + count - 1,
            y2: if is_leaf { *max_level } else { *level },
            key: column.key.clone(),
            is_leaf,
            data_type: column.data_type.clone(),
        };
        positions.push(position);
        if is_leaf {
            x += 1;
        }
    }
    for position in positions.iter_mut() {
        position.y1 += dy;
        position.y2 += dy;
        position.x1 += dx;
        position.x2 += dx;
    }
    positions
}

fn get_levels<'a>(
    leaf_columns: &'a [&'a ExcelColumnInfo],
    parent_map: &'a HashMap<String, String>,
) -> HashMap<&'a String, u32> {
    let mut result = HashMap::new();
    for column in leaf_columns.iter() {
        let mut parents = Vec::new();
        let mut parent = &column.parent;
        parents.push((&column.key, 0));

        while let Some(next_parent) = parent_map.get(parent) {
            for (_, count) in parents.iter_mut() {
                *count += 1;
            }
            parents.push((parent, 0));
            parent = next_parent;
        }
        result.extend(parents);
    }
    result
}

fn find_column<'a>(
    info: &'a ExcelInfo,
    key: &str,
) -> Result<&'a ExcelColumnInfo, Box<dyn std::error::Error>> {
    info.columns
        .iter()
        .find(|column| column.key == key)
        .ok_or_else(|| {
            create_structured_error(
                &format!("Column key missing: {}", key),
                "COLUMN_KEY_MISSING",
                &[("columnKey", key.to_string())],
            )
            .into()
        })
}
