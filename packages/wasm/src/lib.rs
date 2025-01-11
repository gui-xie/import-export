use calamine::{open_workbook_from_rs, Data, Reader, Xlsx};
use rust_xlsxwriter::*;
use std::collections::HashMap;
use std::collections::HashSet;
use std::io::Cursor;
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

#[wasm_bindgen(js_name= createTemplate)]
pub fn create_template(info: ExcelInfo) -> Result<Vec<u8>, JsValue> {
    create_template_buffer(&info).map_err(|e| JsValue::from_str(&format!("{}", e)))
}

#[wasm_bindgen(js_name = importData)]
pub fn import_data(info: ExcelInfo, excel_bytes: &[u8]) -> Result<ExcelData, JsValue> {
    import_data_buffer(info, excel_bytes).map_err(|e| JsValue::from_str(&format!("{}", e)))
}

#[wasm_bindgen(js_name = exportData)]
pub fn export_data(info: ExcelInfo, data: ExcelData) -> Result<Vec<u8>, JsValue> {
    export_data_buffer(&info, &data).map_err(|e| JsValue::from_str(&format!("{}", e)))
}

fn parse_color(color_str: &str) -> Option<Color> {
    let color_str = color_str.trim_start_matches('#');
    if color_str.len() == 6 {
        if let Ok(rgb) = u32::from_str_radix(color_str, 16) {
            return Some(Color::RGB(rgb));
        } else {
            return None;
        }
    }
    None
}

fn get_column_header_format(column: &ExcelColumnInfo) -> Format {
    let mut f: Format = Format::new();
    if let Some(color) = column.color.as_ref() {
        if let Some(c) = parse_color(color.as_str()) {
            f = f.set_background_color(c);
        }
    }
    if let Some(text_color) = column.text_color.as_ref() {
        if let Some(c) = parse_color(text_color.as_str()) {
            f = f.set_font_color(c);
        }
    }
    if column.text_bold {
        f = f.set_bold();
    }

    f = f
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter);
    f
}

fn create_template_workbook(
    info: &ExcelInfo,
) -> Result<(Workbook, Vec<ExcelColumnPosition>), XlsxError> {
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    if let Some(default_row_height) = info.default_row_height {
        worksheet.set_default_row_height(default_row_height);
    }
    let column_positions = get_column_positions(&info);
    let max_column_x = column_positions.iter().map(|p| p.x2).max().unwrap_or(0);
    if let Some(title) = info.title.as_ref() {
        let f = Format::new()
            .set_bold()
            .set_align(FormatAlign::Center)
            .set_align(FormatAlign::VerticalCenter);
        worksheet.merge_range(info.dy, info.dx, info.dy, max_column_x, title.as_str(), &f)?;
        if let Some(title_height) = info.title_height {
            worksheet.set_row_height(0, title_height)?;
        }
    }
    column_positions
        .iter()
        .enumerate()
        .for_each(|(_, position)| {
            let column = info.columns.iter().find(|c| c.key == position.key).unwrap();
            if position.is_single_cell() {
                worksheet
                    .write_string(position.y1 as u32, position.x1 as u16, column.name.as_str())
                    .unwrap();
                worksheet
                    .set_cell_format(
                        position.y1 as u32,
                        position.x1 as u16,
                        &get_column_header_format(column),
                    )
                    .unwrap();
            } else {
                worksheet
                    .merge_range(
                        position.y1 as u32,
                        position.x1 as u16,
                        position.y2 as u32,
                        position.x2 as u16,
                        column.name.as_str(),
                        &get_column_header_format(column),
                    )
                    .unwrap();
            }
            if position.is_leaf {
                worksheet
                    .set_column_width(position.x1, column.width)
                    .unwrap();
            }
        });
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
    let mut y = column_positions.iter().map(|p| p.y2).max().unwrap_or(0);
    let mut worksheet = workbook.worksheet_from_name(&info.sheet_name)?;
    let mut data_len = 0;
    for (_, row) in data.rows.iter().enumerate() {
        y += 1;
        for (_, column_data) in row.columns.iter().enumerate() {
            if column_data.value.is_empty() {
                continue;
            }
            let (pos, info) = column_positions_map.get(&column_data.key).unwrap();
            if pos.data_type.eq_ignore_ascii_case("number") {
                worksheet.write_number(y, pos.x1, column_data.value.parse::<f64>()?)?;
            } else if pos.data_type.eq_ignore_ascii_case("date") {
                let date_time = ExcelDateTime::parse_from_str(&column_data.value)?;
                worksheet.write_datetime(y, pos.x1, date_time)?;
                worksheet.set_cell_format(
                    y,
                    pos.x1,
                    &Format::new().set_num_format(&info.date_format),
                )?;
            } else {
                worksheet.write_string(y, pos.x1, column_data.value.as_str())?;
            }
        }
        data_len += 1;
    }

    column_positions_map
        .iter()
        .enumerate()
        .for_each(|(_, (_, (pos, info)))| {
            if info.allowed_values.len() == 0 || !pos.is_leaf {
                return;
            }
            add_data_validation(&mut worksheet, info, pos.x1, data_len).unwrap();
        });

    Ok(workbook.save_to_buffer()?)
}

fn add_data_validation(
    worksheet: &mut Worksheet,
    column: &ExcelColumnInfo,
    column_index: u16,
    last_row: u32,
) -> Result<(), Box<dyn std::error::Error>> {
    let data_validation = DataValidation::new().allow_list_strings(&column.allowed_values)?;
    worksheet.add_data_validation(1, column_index, last_row, column_index, &data_validation)?;
    Ok(())
}

fn create_template_buffer(info: &ExcelInfo) -> Result<Vec<u8>, XlsxError> {
    let (mut workbook, _) = create_template_workbook(&info)?;
    let buffer = workbook.save_to_buffer()?;
    Ok(buffer)
}

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

fn get_parent_map(info: &ExcelInfo) -> HashMap<String, String> {
    let mut parent_keys = HashSet::new();
    for column in info.columns.iter() {
        if column.has_parent() {
            parent_keys.insert(column.parent.clone());
        }
    }
    let mut parent_map = HashMap::new();
    for column in info.columns.iter() {
        if parent_keys.contains(&column.key) {
            parent_map.insert(column.key.clone(), column.parent.clone());
        }
    }
    parent_map
}

fn get_column_positions(info: &ExcelInfo) -> Vec<ExcelColumnPosition> {
    let parent_map = get_parent_map(&info);
    let leaf_columns = info
        .columns
        .iter()
        .filter(|c| !parent_map.contains_key(&c.key))
        .collect::<Vec<&ExcelColumnInfo>>();
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
