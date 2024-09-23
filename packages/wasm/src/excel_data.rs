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

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelRowData {
    pub columns: Vec<ExcelColumnData>,
}

#[wasm_bindgen]
impl ExcelRowData {
    #[wasm_bindgen(constructor)]
    pub fn new(columns: Vec<ExcelColumnData>) -> ExcelRowData {
        ExcelRowData { columns }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelColumnData {
    pub key: String,
    pub value: String,
}

#[wasm_bindgen]
impl ExcelColumnData {
    #[wasm_bindgen(constructor)]
    pub fn new(key: String, value: String) -> ExcelColumnData {
        ExcelColumnData { key, value }
    }
}
