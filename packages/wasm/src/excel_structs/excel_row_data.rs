use std::fmt;

use wasm_bindgen::prelude::*;

use super::excel_column_data::ExcelColumnData;

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelRowData {
    pub columns: Vec<ExcelColumnData>,
}

impl ExcelRowData {
    pub fn get_row_len(&self) -> u32 {
        let mut row_len = 1;
        for (_, column_data) in self.columns.iter().enumerate() {
            let len = column_data.get_children_len();
            if len > row_len {
                row_len += len;
            }
        }
        row_len as u32
    }
}

#[wasm_bindgen]
impl ExcelRowData {
    #[wasm_bindgen(constructor)]
    pub fn new(columns: Vec<ExcelColumnData>) -> ExcelRowData {
        ExcelRowData { columns }
    }
}

impl fmt::Debug for ExcelRowData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for (_, column_data) in self.columns.iter().enumerate() {
            write!(f, "{:?},", column_data)?
        }
        Ok(())
    }
}
