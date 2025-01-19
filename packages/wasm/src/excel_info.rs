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
    pub title_font_size: Option<f64>,
    pub title_background_color: Option<String>,
    pub title_bold: bool,
    pub dx: u16,
    pub dy: u32,
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
        ExcelInfo::check_columns(&columns);
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
            title_font_size: None,
            title_background_color: None,
            title_bold: true,
            dx: 0,
            dy: 0,
        }
    }

    fn check_columns(columns: &Vec<ExcelColumnInfo>) {
        let mut processed_columns = Vec::new();
        for column in columns.iter() {
            if column.has_parent() {
                let mut flag = false;
                while let Some(p) = processed_columns.pop() {
                    if p == column.parent {
                        flag = true;
                        processed_columns.push(p);
                        break;
                    }
                }
                if !flag {
                    panic!(
                        "Check Error: Parent column {} not found for column {}",
                        column.parent, column.key
                    );
                }
            }
            processed_columns.push(column.key.clone());
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

    #[wasm_bindgen(js_name = withTitleBackgroundColor)]
    pub fn with_title_background_color(mut self, title_background_color: String) -> Self {
        self.title_background_color = Some(title_background_color);
        self
    }

    #[wasm_bindgen(js_name = withTitleBold)]
    pub fn with_title_bold(mut self, title_bold: bool) -> Self {
        self.title_bold = title_bold;
        self
    }

    #[wasm_bindgen(js_name = withTitleFontSize)]
    pub fn with_title_font_size(mut self, title_font_size: f64) -> Self {
        self.title_font_size = Some(title_font_size);
        self
    }

    #[wasm_bindgen(js_name = withOffset)]
    pub fn with_offset(mut self, dx: u16, dy: u32) -> Self {
        self.dx = dx;
        self.dy = dy;
        self
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ValueFormat {
    pub value: String,
    pub rule: String,
    pub color: String,
    pub bold: bool,
    pub italic: bool,
    pub underline: bool,
    pub strikethrough: bool,
    pub font_size: f64,
    pub background_color: String,
    pub align: String,
    pub align_vertical: String,
}

#[wasm_bindgen]
impl ValueFormat {
    #[wasm_bindgen(constructor)]
    pub fn new(rule: String) -> ValueFormat {
        ValueFormat {
            value: "".into(),
            rule,
            color: "black".into(),
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            font_size: 11.0,
            background_color: "white".into(),
            align: "left".into(),
            align_vertical: "center".into(),
        }
    }

    #[wasm_bindgen(js_name = withValue)]
    pub fn with_value(mut self, value: String) -> Self {
        self.value = value;
        self
    }

    #[wasm_bindgen(js_name = withColor)]
    pub fn with_color(mut self, color: String) -> Self {
        self.color = color;
        self
    }

    #[wasm_bindgen(js_name = withBold)]
    pub fn with_bold(mut self, bold: bool) -> Self {
        self.bold = bold;
        self
    }

    #[wasm_bindgen(js_name = withItalic)]
    pub fn with_italic(mut self, italic: bool) -> Self {
        self.italic = italic;
        self
    }

    #[wasm_bindgen(js_name = withUnderline)]
    pub fn with_underline(mut self, underline: bool) -> Self {
        self.underline = underline;
        self
    }

    #[wasm_bindgen(js_name = withStrikethrough)]
    pub fn with_strikethrough(mut self, strikethrough: bool) -> Self {
        self.strikethrough = strikethrough;
        self
    }

    #[wasm_bindgen(js_name = withFontSize)]
    pub fn with_font_size(mut self, font_size: f64) -> Self {
        self.font_size = font_size;
        self
    }

    #[wasm_bindgen(js_name = withBackgroundColor)]
    pub fn with_background_color(mut self, background_color: String) -> Self {
        self.background_color = background_color;
        self
    }

    #[wasm_bindgen(js_name = withAlign)]
    pub fn with_align(mut self, align: String) -> Self {
        self.align = align;
        self
    }

    #[wasm_bindgen(js_name = withAlignVertical)]
    pub fn with_align_vertical(mut self, align_vertical: String) -> Self {
        self.align_vertical = align_vertical;
        self
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelColumnInfo {
    pub key: String,
    pub name: String,
    pub width: f64,
    pub note: Option<String>,
    pub data_type: String,
    pub allowed_values: Vec<String>,
    pub background_color: Option<String>,
    pub color: Option<String>,
    pub bold: bool,
    pub parent: String,
    pub date_format: String,
    pub font_size: f64,
    pub value_format: Vec<ValueFormat>,
}

#[wasm_bindgen]
impl ExcelColumnInfo {
    #[wasm_bindgen(constructor)]
    pub fn new(key: String, name: String) -> ExcelColumnInfo {
        ExcelColumnInfo {
            key,
            name,
            width: 10.0,
            note: None,
            data_type: "text".into(),
            allowed_values: Vec::new(),
            background_color: None,
            color: None,
            bold: true,
            parent: "".into(),
            date_format: "yyyy-mm-dd".into(),
            value_format: Vec::new(),
            font_size: 11.0,
        }
    }

    #[wasm_bindgen(js_name = withNote)]
    pub fn with_note(mut self, note: String) -> Self {
        self.note = Some(note);
        self
    }

    #[wasm_bindgen(js_name = withDataType)]
    pub fn with_data_type(mut self, data_type: String) -> Self {
        self.data_type = data_type;
        self
    }

    #[wasm_bindgen(js_name = withAllowedValues)]
    pub fn with_allowed_values(mut self, allowed_values: Vec<String>) -> Self {
        self.allowed_values = allowed_values;
        self
    }

    #[wasm_bindgen(js_name = withWidth)]
    pub fn with_width(mut self, width: f64) -> Self {
        self.width = width;
        self
    }

    #[wasm_bindgen(js_name = withBackgroundColor)]
    pub fn with_background_color(mut self, background_color: String) -> Self {
        self.background_color = Some(background_color);
        self
    }

    #[wasm_bindgen(js_name = withColor)]
    pub fn with_color(mut self, color: String) -> Self {
        self.color = Some(color);
        self
    }

    #[wasm_bindgen(js_name = withBold)]
    pub fn with_text_bold(mut self, bold: bool) -> Self {
        self.bold = bold;
        self
    }

    #[wasm_bindgen(js_name = withParent)]
    pub fn with_parent(mut self, parent: String) -> Self {
        self.parent = parent;
        self
    }

    #[wasm_bindgen(js_name = withDateFormat)]
    pub fn with_date_format(mut self, date_format: String) -> Self {
        self.date_format = date_format;
        self
    }

    #[wasm_bindgen(js_name = withFontSize)]
    pub fn with_font_size(mut self, font_size: f64) -> Self {
        self.font_size = font_size;
        self
    }

    #[wasm_bindgen(js_name = withValueFormat)]
    pub fn with_value_format(mut self, value_format: Vec<ValueFormat>) -> Self {
        self.value_format = value_format;
        self
    }
}

impl ExcelColumnInfo {
    pub fn has_parent(&self) -> bool {
        !self.parent.is_empty()
    }

    pub fn get_value_format<'a>(&'a self, value: &'a String) -> Option<&'a ValueFormat> {
        let mut result = None;
        for vf in self.value_format.iter() {
            if vf.rule == "eq" {
                if vf.value == *value {
                    result = Some(vf);
                    break;
                }
            }
            if vf.rule == "default" {
                result = Some(vf);
            }
        }
        result
    }
}
