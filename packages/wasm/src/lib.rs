use calamine::{open_workbook_from_rs, Data, Reader, Xlsx};
use excel_info::ExcelDataType;
use rust_xlsxwriter::*;
use std::collections::HashMap;
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

fn create_template_workbook(info: &ExcelInfo) -> Result<Workbook, XlsxError> {
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    if let Some(default_row_height) = info.default_row_height {
        worksheet.set_default_row_height(default_row_height);
    }
    let header_index = info.get_header_row_index() as u32;
    let columns_len = info.columns.len() as u16;
    if let Some(title) = info.title.as_ref() {
        let f = Format::new()
            .set_bold()
            .set_align(FormatAlign::Center)
            .set_align(FormatAlign::VerticalCenter);
        worksheet.merge_range(0, 0, 0, columns_len - 1, title.as_str(), &f)?;
        if let Some(title_height) = info.title_height {
            worksheet.set_row_height(0, title_height)?;
        }
    }
    worksheet.set_name(info.sheet_name.as_str())?;
    let header_len = info.get_header_row_len() as u32;
    let mut t_groups: HashMap<usize, (String, u16)> = HashMap::new();
    for (i, column) in info.columns.iter().enumerate() {
        let column_index = i as u16;
        let groups = column.get_column_groups();
        if let Some(width) = column.width {
            worksheet.set_column_width(column_index, width)?;
        }
        let f = get_column_header_format(column);
        let group_len = groups.len() as u32;
        let last_header_row = header_index + header_len - 2;
        if group_len == 0 {
            worksheet.merge_range(
                header_index,
                column_index,
                last_header_row,
                column_index,
                &column.name,
                &f,
            )?;
        } else {
            let mut header_row = header_index;
            for (j, group) in groups.iter().enumerate() {
                if !t_groups.contains_key(&j) {
                    t_groups.entry(j).or_insert((group.clone(), column_index));
                } else {
                    let (group_name, group_column_index) = t_groups.get(&j).unwrap();
                    if group_name != group {
                        worksheet.merge_range(
                            header_row,
                            *group_column_index,
                            header_index + j as u32,
                            *group_column_index,
                            group_name,
                            &f,
                        )?;
                        t_groups.clear();
                        t_groups.insert(j, (group.clone(), column_index));
                    }
                }

                worksheet.write_string(header_row, column_index, group)?;
                worksheet.set_cell_format(header_row, column_index, &f)?;
                header_row += 1;
            }
            let left_row_len = last_header_row - header_row;
            if left_row_len > 1 {
                worksheet.merge_range(
                    header_row,
                    column_index,
                    header_index + group_len,
                    column_index,
                    &column.name,
                    &f,
                )?;
            } else {
                worksheet.write_string(header_row, column_index, &column.name)?;
                worksheet.set_cell_format(header_row, column_index, &f)?;
            }
        }
        if let Some(note) = column.note.as_ref() {
            let note = Note::new(note.clone()).set_author(info.author.clone());
            worksheet.insert_note(header_index, column_index, &note)?;
        }
    }

    let create_time =
        ExcelDateTime::parse_from_str(&info.create_time).map_err(|e| XlsxError::from(e))?;

    let properties = DocProperties::new()
        .set_title(info.name.clone())
        .set_author(info.author.clone().as_str())
        .set_creation_datetime(&create_time);

    workbook.set_properties(&properties);
    Ok(workbook)
}

fn get_columns_index<'a>(
    columns: &'a [ExcelColumnInfo],
    range: &'a calamine::Range<calamine::Data>,
) -> Vec<(usize, String, ExcelDataType)> {
    let mut result = Vec::new();
    for (i, value) in range[0].iter().enumerate() {
        let column = columns.iter().find(|c| c.name == value.to_string());
        if let Some(column) = column {
            result.push((i, column.key.clone(), column.data_type.clone()));
        }
    }
    result
}

fn get_rows_data<'a>(
    columns: &'a Vec<(usize, String, ExcelDataType)>,
    range: &'a calamine::Range<calamine::Data>,
) -> Vec<ExcelRowData> {
    range
        .rows()
        .skip(1)
        .map(|r| ExcelRowData {
            columns: columns
                .iter()
                .map(|(i, key, data_type)| {
                    let cell = r.get(*i).unwrap_or(&Data::Empty);
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

fn format_value(data: &Data, data_type: &ExcelDataType) -> String {
    match data {
        Data::Empty => "".to_string(),
        Data::String(s) => s.clone(),
        Data::Float(f) => {
            if *data_type == ExcelDataType::Date {
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
    let columns = get_columns_index(&info.columns, &range);

    excel_data.rows = get_rows_data(&columns, &range);

    Ok(excel_data)
}

fn export_data_buffer(
    info: &ExcelInfo,
    data: &ExcelData,
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let mut workbook = create_template_workbook(&info)?;
    let is_number_column = info
        .columns
        .iter()
        .map(|c| c.data_type == excel_info::ExcelDataType::Number)
        .collect::<Vec<bool>>();
    let data_row_index = info.get_header_row_index() + info.get_header_row_len() - 1;
    let mut worksheet = workbook.worksheet_from_name(&info.sheet_name)?;
    let mut data_len = 0;
    for (row_idx, row) in data.rows.iter().enumerate() {
        data_len += 1;
        for (col_idx, column) in row.columns.iter().enumerate() {
            if column.value.is_empty() {
                continue;
            }
            let cell_row = (row_idx + data_row_index) as u32;
            let cell_col = col_idx as u16;
            if is_number_column[col_idx] {
                worksheet.write_number(cell_row, cell_col, column.value.parse::<f64>()?)?;
            } else {
                worksheet.write_string(cell_row, cell_col, column.value.as_str())?;
            }
        }
    }

    info.columns.iter().enumerate().for_each(|(i, column)| {
        add_data_validation(&mut worksheet, column, i as u16, data_len).unwrap();
    });

    Ok(workbook.save_to_buffer()?)
}

fn add_data_validation(
    worksheet: &mut Worksheet,
    column: &ExcelColumnInfo,
    column_index: u16,
    last_row: u32,
) -> Result<(), Box<dyn std::error::Error>> {
    let allowed_values = column.allowed_values.as_ref();
    if allowed_values.is_none() {
        return Ok(());
    }
    let allowed_values = allowed_values.unwrap();
    let data_validation = DataValidation::new().allow_list_strings(allowed_values)?;
    worksheet.add_data_validation(1, column_index, last_row, column_index, &data_validation)?;
    Ok(())
}

fn create_template_buffer(info: &ExcelInfo) -> Result<Vec<u8>, XlsxError> {
    let mut workbook = create_template_workbook(&info)?;
    let buffer = workbook.save_to_buffer()?;
    Ok(buffer)
}
