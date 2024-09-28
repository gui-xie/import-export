use calamine::{open_workbook_from_rs, Reader, Xlsx};
use rust_xlsxwriter::*;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

mod excel_data;
mod excel_info;

pub use excel_data::ExcelColumnData;
pub use excel_data::ExcelData;
pub use excel_data::ExcelRowData;
pub use excel_info::ExcelColumnInfo;
pub use excel_info::ExcelInfo;

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

fn create_template_workbook(info: &ExcelInfo) -> Result<Workbook, XlsxError> {
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    worksheet.set_name(info.sheet_name.as_str())?;
    for (i, column) in info.columns.iter().enumerate() {
        worksheet.write_string(0, i as u16, column.name.as_str())?;
        if let Some(width) = column.width {
            worksheet.set_column_width(i as u16, width)?;
        }
        if let Some(note) = column.note.as_ref() {
            let note = Note::new(note.clone()).add_author_prefix(false);
            worksheet.insert_note(0, i as u16, &note)?;
        }
    }
    Ok(workbook)
}

fn get_columns_index<'a>(
    columns: &'a [ExcelColumnInfo],
    range: &'a calamine::Range<calamine::Data>,
) -> Vec<(usize, String)> {
    let mut result = Vec::new();
    for (i, value) in range[0].iter().enumerate() {
        let column = columns.iter().find(|c| c.name == value.to_string());
        if let Some(column) = column {
            result.push((i, column.key.clone()));
        }
    }
    result
}

fn get_rows_data<'a>(
    columns: &'a Vec<(usize, String)>,
    range: &'a calamine::Range<calamine::Data>,
) -> Vec<ExcelRowData> {
    range
        .rows()
        .skip(1)
        .map(|r| ExcelRowData {
            columns: columns
                .iter()
                .map(|(i, key)| ExcelColumnData {
                    key: key.clone(),
                    value: r.get(*i).unwrap_or(&calamine::Data::Empty).to_string(),
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
    let range = workbook.worksheet_range(info.sheet_name.as_str())?;
    let columns: Vec<(usize, String)> = get_columns_index(&info.columns, &range);

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
    let mut worksheet = workbook.worksheet_from_name(&info.sheet_name)?;
    let mut data_len = 0;
    for (row_idx, row) in data.rows.iter().enumerate() {
        data_len += 1;
        for (col_idx, column) in row.columns.iter().enumerate() {
            if column.value.is_empty() {
                continue;
            }
            let cell_row = (row_idx + 1) as u32;
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

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    #[test]
    fn test_get_data() {
        let columns = vec![
            excel_info::ExcelColumnInfo::new("name".to_string(), "Name".to_string(), None),
            excel_info::ExcelColumnInfo::new("age".to_string(), "Age".to_string(), None),
        ];
        let info =
            excel_info::ExcelInfo::new("TestWorkbook".to_string(), "sheet1".to_string(), columns);

        let excel_bytes: &[u8] = include_bytes!("./user-test.xlsx");

        let result = import_data(info, excel_bytes);

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.rows.len(), 2);
        assert_eq!(result.rows[0].columns.len(), 2);
        assert_eq!(result.rows[0].columns[0].key, "name");
        assert_eq!(result.rows[0].columns[0].value, "senlin");
        assert_eq!(result.rows[0].columns[1].key, "age");
        assert_eq!(result.rows[0].columns[1].value, "3");
    }
}
