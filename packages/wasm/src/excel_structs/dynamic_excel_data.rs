use super::excel_row_data::ExcelRowData;
use std::fmt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct DynamicExcelData {
    pub sheet_name: String,
    pub headers: Vec<String>,
    pub rows: Vec<ExcelRowData>,
}

#[wasm_bindgen]
impl DynamicExcelData {
    #[wasm_bindgen(constructor)]
    pub fn new(
        sheet_name: String,
        headers: Vec<String>,
        rows: Vec<ExcelRowData>,
    ) -> DynamicExcelData {
        DynamicExcelData {
            sheet_name,
            headers,
            rows,
        }
    }
}

impl fmt::Debug for DynamicExcelData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        writeln!(f, "sheet: {}", self.sheet_name)?;
        writeln!(f, "headers: {:?}", self.headers)?;
        for row in self.rows.iter() {
            writeln!(f, "  {:?}", row)?;
        }
        Ok(())
    }
}
