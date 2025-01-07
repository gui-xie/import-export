use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct ExcelInfo {
    pub name: String,
    pub sheet_name: String,
    pub columns: Vec<ExcelColumnInfo>,
    pub author: String,
    pub create_time: String,
    pub title: Option<String>,
    pub default_row_height: Option<f64>,
    pub title_height: Option<f64>,
    pub title_color: Option<String>,
    pub title_text_color: Option<String>,
    pub title_text_bold: Option<bool>,
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
            title: None,
            default_row_height: None,
            title_height: None,
            title_color: None,
            title_text_color: None,
            title_text_bold: None,
        }
    }

    #[wasm_bindgen(js_name = withTitle)]
    pub fn with_title(mut self, title: String) -> Self {
        self.title = Some(title);
        self
    }

    #[wasm_bindgen(js_name = withDefaultRowHeight)]
    pub fn with_default_row_height(mut self, row_height: f64) -> Self {
        self.default_row_height = Some(row_height);
        self
    }

    #[wasm_bindgen(js_name = withTitleHeight)]
    pub fn with_title_height(mut self, title_height: f64) -> Self {
        self.title_height = Some(title_height);
        self
    }

    #[wasm_bindgen(js_name = withTitleColor)]
    pub fn with_title_color(mut self, title_color: String) -> Self {
        self.title_color = Some(title_color);
        self
    }

    #[wasm_bindgen(js_name = withTitleTextColor)]
    pub fn with_title_text_color(mut self, title_text_color: String) -> Self {
        self.title_text_color = Some(title_text_color);
        self
    }

    #[wasm_bindgen(js_name = withTitleTextBold)]
    pub fn with_title_text_bold(mut self, title_text_bold: bool) -> Self {
        self.title_text_bold = Some(title_text_bold);
        self
    }

    pub fn get_header_row_index(&self) -> usize {
        if self.title.is_some() {
            1
        } else {
            0
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
    pub color: Option<String>,
    pub text_color: Option<String>,
    pub text_bold: bool,
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
            color: None,
            text_color: None,
            text_bold: true,
        }
    }

    #[wasm_bindgen(js_name = withNote)]
    pub fn with_note(mut self, note: String) -> Self {
        self.note = Some(note);
        self
    }

    #[wasm_bindgen(js_name = withDataType)]
    pub fn with_data_type(mut self, data_type: ExcelDataType) -> Self {
        self.data_type = data_type;
        self
    }

    #[wasm_bindgen(js_name = withAllowedValues)]
    pub fn with_allowed_values(mut self, allowed_values: Vec<String>) -> Self {
        self.allowed_values = Some(allowed_values);
        self
    }

    #[wasm_bindgen(js_name = withWidth)]
    pub fn with_width(mut self, width: f64) -> Self {
        self.width = Some(width);
        self
    }

    #[wasm_bindgen(js_name = withColor)]
    pub fn with_color(mut self, color: String) -> Self {
        self.color = Some(color);
        self
    }

    #[wasm_bindgen(js_name = withTextColor)]
    pub fn with_text_color(mut self, text_color: String) -> Self {
        self.text_color = Some(text_color);
        self
    }

    #[wasm_bindgen(js_name = withTextBold)]
    pub fn with_text_bold(mut self, text_bold: bool) -> Self {
        self.text_bold = text_bold;
        self
    }

    pub fn get_data_type(&self) -> String {
        match self.data_type {
            ExcelDataType::Text => "text".to_string(),
            ExcelDataType::Number => "number".to_string(),
        }
    }
}
