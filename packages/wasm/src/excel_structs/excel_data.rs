use super::excel_row_data::ExcelRowData;
use std::fmt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelData {
    pub rows: Vec<ExcelRowData>,
}

#[wasm_bindgen]
impl ExcelData {
    #[wasm_bindgen(constructor)]
    pub fn new(rows: Vec<ExcelRowData>) -> ExcelData {
        ExcelData { rows }
    }
}

impl fmt::Debug for ExcelData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        writeln!(f, "data")?;
        for (_, column_data) in self.rows.iter().enumerate() {
            writeln!(f, "  {:?}", column_data)?
        }
        Ok(())
    }
}
