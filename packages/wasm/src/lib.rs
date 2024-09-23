use calamine::{open_workbook_from_rs, Reader, Xlsx};
use rust_xlsxwriter::Workbook;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

mod excel_data;
mod excel_info;

pub use excel_data::ExcelColumnData;
pub use excel_data::ExcelData;
pub use excel_data::ExcelRowData;
pub use excel_info::ExcelColumnInfo;
pub use excel_info::ExcelInfo;

fn create_template_workbook(info: &ExcelInfo) -> Workbook {
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    worksheet
        .set_name(info.sheet_name.as_str())
        .expect("Cannot set worksheet name");
    for (i, column) in info.columns.iter().enumerate() {
        worksheet
            .write_string(0, i as u16, column.name.as_str())
            .expect("Cannot write to worksheet");
    }
    workbook
}

#[wasm_bindgen(js_name= createTemplate)]
pub fn create_template(info: ExcelInfo) -> Vec<u8> {
    create_template_workbook(&info)
        .save_to_buffer()
        .expect("Cannot save workbook")
}

#[wasm_bindgen(js_name = importData)]
pub fn import_data(info: ExcelInfo, excel_bytes: &[u8]) -> ExcelData {
    let cursor = Cursor::new(excel_bytes);
    let mut workbook: Xlsx<_> = open_workbook_from_rs(cursor).expect("Cannot open workbook");

    let mut excel_data = ExcelData { rows: Vec::new() };

    if let Ok(range) = workbook.worksheet_range(info.sheet_name.as_str()) {
        let mut columns: Vec<(usize, String)> = Vec::new();
        for (col, value) in range.rows().next().unwrap().iter().enumerate() {
            let column_name = value.to_string();
            if let Some(column_info) = info.columns.iter().find(|c| c.name == column_name) {
                columns.push((col, column_info.key.clone()));
            }
        }

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
    }

    excel_data
}

#[wasm_bindgen(js_name = exportData)]
pub fn export_data(info: ExcelInfo, data: ExcelData) -> Vec<u8> {
    let mut workbook = create_template_workbook(&info);
    let worksheet = workbook.worksheet_from_name(&info.sheet_name).expect("Cannot get worksheet");
    for (i, row) in data.rows.iter().enumerate() {
        for (j, column) in row.columns.iter().enumerate() {
            worksheet
                .write_string((i + 1) as u32, j as u16, column.value.as_str())
                .expect("Cannot write to worksheet");
        }
    }
    workbook
        .save_to_buffer()
        .expect("Cannot save workbook")
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
            ExcelColumnInfo {
                key: "name".to_string(),
                name: "Name".to_string(),
            },
            ExcelColumnInfo {
                key: "age".to_string(),
                name: "Age".to_string(),
            },
        ];
        let info = ExcelInfo {
            name: "TestWorkbook".to_string(),
            sheet_name: "sheet1".to_string(),
            columns,
        };

        let excel_bytes: &[u8] = include_bytes!("./user-test.xlsx");

        let result = import_data(info, excel_bytes);

        assert_eq!(result.rows.len(), 2);
        assert_eq!(result.rows[0].columns.len(), 2);
        assert_eq!(result.rows[0].columns[0].key, "name");
        assert_eq!(result.rows[0].columns[0].value, "senlin");
        assert_eq!(result.rows[0].columns[1].key, "age");
        assert_eq!(result.rows[0].columns[1].value, "3");
    }
}
