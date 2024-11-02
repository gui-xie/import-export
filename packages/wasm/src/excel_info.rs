use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct ExcelInfo {
    pub name: String,
    pub sheet_name: String,
    pub columns: Vec<ExcelColumnInfo>,
    pub author: String,
    pub create_time: String,
}

#[wasm_bindgen]
impl ExcelInfo {
    #[wasm_bindgen(constructor)]
    pub fn new(
        name: String,
        sheet_name: String,
        columns: Vec<ExcelColumnInfo>,
        author: String,
        create_time: String,
    ) -> ExcelInfo {
        ExcelInfo {
            name,
            sheet_name,
            columns,
            author,
            create_time,
        }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelColumnInfo {
    pub key: String,
    pub name: String,
    pub width: Option<f64>,
    pub note: Option<String>,
    pub data_type: ExcelDataType,
    pub allowed_values: Option<Vec<String>>,
}

#[wasm_bindgen]
#[derive(Clone, PartialEq)]
pub enum ExcelDataType {
    Text,
    Number,
}

#[wasm_bindgen]
impl ExcelColumnInfo {
    #[wasm_bindgen(constructor)]
    pub fn new(key: String, name: String, width: Option<f64>) -> ExcelColumnInfo {
        ExcelColumnInfo {
            key,
            name,
            width,
            note: None,
            data_type: ExcelDataType::Text,
            allowed_values: None,
        }
    }

    #[wasm_bindgen(js_name = setNote)]
    pub fn set_note(&mut self, note: String) {
        self.note = Some(note);
    }

    #[wasm_bindgen(js_name = setDataType)]
    pub fn set_data_type(&mut self, data_type: ExcelDataType) {
        self.data_type = data_type;
    }

    #[wasm_bindgen(js_name = setAllowedValues)]
    pub fn set_allowed_values(&mut self, allowed_values: Vec<String>) {
        self.allowed_values = Some(allowed_values);
    }
}
