use calamine::{open_workbook_from_rs, Data, Reader, Xlsx};
use excel_info::ExcelCellFormat;
use rust_xlsxwriter::*;
use std::collections::HashMap;
use std::io::Cursor;
use std::sync::LazyLock;
use wasm_bindgen::prelude::*;

mod excel_data;
mod excel_info;
mod tests;

pub use excel_data::ExcelColumnData;
pub use excel_data::ExcelData;
pub use excel_data::ExcelRowData;
pub use excel_info::ExcelColumnInfo;
pub use excel_info::ExcelInfo;

const SECONDS_IN_A_DAY: f64 = 86400.0;
const EXCEL_BASE_DATE: i64 = 25569; // Number of days from 1899-12-30 to 1970-01-01
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
pub fn create_template(info: ExcelInfo) -> Result<Vec<u8>, JsError> {
    create_template_buffer(&info).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen(js_name = importData)]
pub fn import_data(info: ExcelInfo, excel_bytes: &[u8]) -> Result<ExcelData, JsError> {
    import_data_buffer(info, excel_bytes).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen(js_name = exportData)]
pub fn export_data(info: ExcelInfo, data: ExcelData) -> Result<Vec<u8>, JsError> {
    export_data_buffer(&info, &data).map_err(|e| JsError::new(&e.to_string()))
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
    column_positions
        .iter()
        .enumerate()
        .for_each(|(_, position)| {
            let column = info.columns.iter().find(|c| c.key == position.key).unwrap();
            let f = column.format.as_ref().map(|f| get_cell_format(f));
            if position.is_single_cell() {
                worksheet
                    .write_string(position.y1, position.x1, &column.name)
                    .unwrap();
                worksheet
                    .set_cell_format(
                        position.y1,
                        position.x1,
                        f.as_ref().unwrap_or(&DEFAULT_HEADER_FORMAT),
                    )
                    .unwrap();
            } else {
                worksheet
                    .merge_range(
                        position.y1,
                        position.x1,
                        position.y2,
                        position.x2,
                        &column.name,
                        f.as_ref().unwrap_or(&DEFAULT_HEADER_FORMAT),
                    )
                    .unwrap();
            }
            if position.is_leaf {
                worksheet
                    .set_column_width(position.x1, column.width)
                    .unwrap();
            }
        });
    if info.is_header_freeze {
        worksheet.set_freeze_panes(
            column_positions.iter().max_by_key(|p| p.y2).unwrap().y2 + 1,
            0,
        )?;
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
    range
        .rows()
        .skip(header_max_y)
        .map(|r| ExcelRowData {
            columns: leaf_columns
                .iter()
                .map(|(key, x1, data_type)| {
                    let cell = r.get(*x1).unwrap_or(&Data::Empty);
                    ExcelColumnData {
                        key: key.clone(),
                        value: format_value(cell, data_type),
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

fn format_value(data: &Data, data_type: &String) -> String {
    match data {
        Data::Empty => "".to_string(),
        Data::String(s) => s.clone(),
        Data::Float(f) => {
            if data_type.eq_ignore_ascii_case("date") {
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

fn import_data_buffer(
    info: ExcelInfo,
    excel_bytes: &[u8],
) -> Result<ExcelData, Box<dyn std::error::Error>> {
    let cursor = Cursor::new(excel_bytes);
    let mut workbook: Xlsx<_> = open_workbook_from_rs(cursor)?;
    let mut excel_data = ExcelData { rows: Vec::new() };
    let range = workbook.worksheet_range(info.sheet_name.as_str())?;
    let column_positions = get_column_positions(&info);
    excel_data.rows = get_rows_data(&column_positions, &range);

    Ok(excel_data)
}

fn export_data_buffer(
    info: &ExcelInfo,
    data: &ExcelData,
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let (mut workbook, column_positions) = create_template_workbook(&info)?;
    let column_positions_map: HashMap<String, (&ExcelColumnPosition, &ExcelColumnInfo)> =
        HashMap::from_iter(column_positions.iter().map(|c| {
            (
                c.key.clone(),
                (c, info.columns.iter().find(|ci| ci.key == c.key).unwrap()),
            )
        }));

    let y_min = column_positions.iter().map(|p| p.y2).max().unwrap_or(0) + 1;
    let mut y = y_min;
    let mut worksheet = workbook.worksheet_from_name(&info.sheet_name)?;
    let root_group_keys = column_positions_map
        .iter()
        .filter(|(_, (_, info))| info.is_root_group())
        .map(|(key, _)| key)
        .collect::<Vec<&String>>();

    for (_, row) in data.rows.iter().enumerate() {
        let mut data_with_children = Vec::new();
        let mut data_without_children = Vec::new();
        for column_data in row.columns.iter() {
            if root_group_keys.contains(&&column_data.key) {
                data_with_children.push(column_data);
            } else {
                data_without_children.push(column_data);
            }
        }

        let next_y = write_children_row(worksheet, data_with_children, y, &column_positions_map)?;
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
                    write_single_cell(worksheet, pos.x1, y2, &column_data.value, &column)?;
                }
            }
        }
        y = next_y;
    }
    column_positions_map
        .iter()
        .enumerate()
        .for_each(|(_, (_, (pos, info)))| {
            if info.allowed_values.len() == 0 || !pos.is_leaf {
                return;
            }
            add_data_validation(&mut worksheet, info, pos.x1, y_min, y).unwrap();
        });

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

fn write_single_cell(
    worksheet: &mut Worksheet,
    x: u16,
    y: u32,
    value: &String,
    column: &ExcelColumnInfo,
) -> Result<(), Box<dyn std::error::Error>> {
    let data_type = &column.data_type;
    let mut is_date_type = false;
    if data_type.eq_ignore_ascii_case("number") {
        worksheet.write_number(y, x, value.parse::<f64>()?)?;
    } else if data_type.eq_ignore_ascii_case("date") {
        let date_time = ExcelDateTime::parse_from_str(value)?;
        worksheet.write_datetime(y, x, date_time)?;
        is_date_type = true;
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

fn write_children_row(
    worksheet: &mut Worksheet,
    row: Vec<&ExcelColumnData>,
    y: u32,
    column_positions_map: &HashMap<String, (&ExcelColumnPosition, &ExcelColumnInfo)>,
) -> Result<u32, Box<dyn std::error::Error>> {
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
                )?;
            }
            let last_row = t_y - 1;

            if t_y > current_y {
                current_y = last_row;
            }
            if let Some((pos, column)) = column_positions_map.get(&column_data.key) {
                if !column.is_root_group() {
                    println!(
                        "last_row: {:?}, y :{:?}, x1: {:?}, value: {:?}, key: {:?}",
                        last_row, y, pos.x1, &column_data.value, column.key
                    );
                    if y == last_row {
                        write_single_cell(worksheet, pos.x1, y, &column_data.value, &column)?;
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
            write_single_cell(worksheet, pos.x1, y, &column_data.value, &column)?;
        }
    }
    Ok(current_y + 1)
}

fn write_range_cell(
    worksheet: &mut Worksheet,
    x1: u16,
    x2: u16,
    y1: u32,
    y2: u32,
    value: &String,
    column: &ExcelColumnInfo,
) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(f) = get_column_value_format(&value, column) {
        worksheet.merge_range(y1, x1, y2, x2, &value.as_str(), &f)?;
    } else {
        worksheet.merge_range(y1, x1, y2, x2, &value.as_str(), &DEFAULT_FORMAT)?;
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

fn get_column_value_format(value: &String, column: &ExcelColumnInfo) -> Option<Format> {
    let f = column.get_value_format(value);
    if f.is_none() {
        return None;
    }
    let f = f.unwrap();
    Some(get_cell_format(&f))
}

fn get_parent_times(
    leaf_columns: &Vec<&ExcelColumnInfo>,
    parent_map: &HashMap<String, String>,
) -> HashMap<String, u16> {
    let mut parent_times: HashMap<String, u16> = HashMap::new();
    for column in leaf_columns.iter() {
        let mut p: &String = &column.parent;
        while parent_map.contains_key(p) {
            if parent_times.contains_key(p) {
                let count = parent_times.get_mut(p).unwrap();
                *count += 1;
            } else {
                parent_times.insert(p.clone(), 1);
            }
            p = parent_map.get(p).unwrap();
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
    leaf_columns: &'a Vec<&ExcelColumnInfo>,
    parent_map: &'a HashMap<String, String>,
) -> HashMap<&'a String, u32> {
    let mut result = HashMap::new();
    for column in leaf_columns.iter() {
        let mut parents = Vec::new();
        let mut parent = &column.parent;
        parents.push((&column.key, 0));

        while parent_map.contains_key(parent) {
            for (_, count) in parents.iter_mut() {
                *count += 1;
            }
            parents.push((parent, 0));
            parent = &parent_map[parent];
        }
        result.extend(parents);
    }
    result
}
