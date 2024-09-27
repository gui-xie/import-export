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
    let workbook = create_template_buffer(&info);
    if let Err(e) = workbook {
        return Err(JsValue::from_str(&format!("{}", e)));
    }
    Ok(workbook.unwrap())
}

#[wasm_bindgen(js_name = importData)]
pub fn import_data(info: ExcelInfo, excel_bytes: &[u8]) -> Result<ExcelData, JsValue> {
    let data = import_data_buffer(info, excel_bytes);
    if let Err(e) = data {
        return Err(JsValue::from_str(&format!("{}", e)));
    }
    Ok(data.unwrap())
}

#[wasm_bindgen(js_name = exportData)]
pub fn export_data(info: ExcelInfo, data: ExcelData) -> Result<Vec<u8>, JsValue> {
    let buffer = export_data_buffer(&info, &data);
    if let Err(e) = buffer {
        return Err(JsValue::from_str(&format!("{}", e)));
    }
    Ok(buffer.unwrap())
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

fn import_data_buffer(
    info: ExcelInfo,
    excel_bytes: &[u8],
) -> Result<ExcelData, Box<dyn std::error::Error>> {
    let cursor = Cursor::new(excel_bytes);
    let mut workbook: Xlsx<_> = open_workbook_from_rs(cursor)?;
    let mut excel_data = ExcelData { rows: Vec::new() };
    let range = workbook.worksheet_range(info.sheet_name.as_str())?;

    let columns: Vec<(usize, String)> = range
        .rows()
        .next()
        .ok_or("No rows")? // Converts None to an error
        .iter()
        .enumerate()
        .filter_map(|(col, value)| {
            let column_name = value.to_string();
            info.columns
                .iter()
                .find(|c| c.name == column_name)
                .map(|column_info| (col, column_info.key.clone()))
        })
        .collect();

    excel_data.rows = range
        .rows()
        .skip(1)
        .map(|r| ExcelRowData {
            columns: r
                .iter()
                .enumerate()
                .filter_map(|(i, value)| {
                    let column = columns.iter().find(|c| c.0 == i);
                    if let Some((_, key)) = column {
                        Some(ExcelColumnData {
                            key: key.clone(),
                            value: value.to_string(),
                        })
                    } else {
                        None
                    }
                })
                .collect(),
        })
        .collect();

    Ok(excel_data)
}

fn export_data_buffer(info: &ExcelInfo, data: &ExcelData) -> Result<Vec<u8>, XlsxError> {
    let mut workbook = create_template_workbook(&info)?;
    let worksheet = workbook.worksheet_from_name(&info.sheet_name)?;
    for (i, row) in data.rows.iter().enumerate() {
        for (j, column) in row.columns.iter().enumerate() {
            worksheet.write_string((i + 1) as u32, j as u16, column.value.as_str())?;
        }
    }
    Ok(workbook.save_to_buffer()?)
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
        let info = ExcelInfo {
            name: "TestWorkbook".to_string(),
            sheet_name: "sheet1".to_string(),
            columns,
        };

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
