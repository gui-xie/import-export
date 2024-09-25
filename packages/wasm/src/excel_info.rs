use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct ExcelInfo {
    pub name: String,
    pub sheet_name: String,
    pub columns: Vec<ExcelColumnInfo>,
}

#[wasm_bindgen]
impl ExcelInfo {
    #[wasm_bindgen(constructor)]
    pub fn new(name: String, sheet_name: String, columns: Vec<ExcelColumnInfo>) -> ExcelInfo {
        ExcelInfo {
            name,
            sheet_name,
            columns,
        }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelColumnInfo {
    pub key: String,
    pub name: String,
    pub width: Option<f64>,
}

#[wasm_bindgen]
impl ExcelColumnInfo {
    #[wasm_bindgen(constructor)]
    pub fn new(key: String, name: String, width: Option<f64>) -> ExcelColumnInfo {
        ExcelColumnInfo { key, name, width }
    }
}
