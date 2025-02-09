use std::collections::{HashMap, HashSet};

use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct ExcelInfo {
    pub name: String,
    pub sheet_name: String,
    pub columns: Vec<ExcelColumnInfo>,
    pub author: String,
    pub create_time: String,
    pub title: Option<String>,
    pub title_format: Option<ExcelCellFormat>,
    pub title_height: Option<f64>,
    pub default_row_height: Option<f64>,
    pub dx: u16,
    pub dy: u32,
    pub is_header_freeze: bool,
}

impl ExcelInfo {
    pub fn new<T: Into<String>>(
        name: T,
        sheet_name: T,
        columns: Vec<ExcelColumnInfo>,
        author: T,
        create_time: T,
    ) -> Self {
        ExcelInfo::check_columns(&columns);
        ExcelInfo {
            name: name.into(),
            sheet_name: sheet_name.into(),
            columns,
            author: author.into(),
            create_time: create_time.into(),
            title: None,
            default_row_height: None,
            title_height: None,
            title_format: None,
            dx: 0,
            dy: 0,
            is_header_freeze: false,
        }
    }

    pub fn with_title<T: Into<String>>(mut self, title: T) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn get_parent_map(&self) -> HashMap<String, String> {
        let mut parent_keys = HashSet::new();
        for column in self.columns.iter() {
            if column.has_parent() {
                parent_keys.insert(column.parent.clone());
            }
        }
        let mut parent_map = HashMap::new();
        for column in self.columns.iter() {
            if parent_keys.contains(&column.key) {
                parent_map.insert(column.key.clone(), column.parent.clone());
            }
        }
        parent_map
    }

    pub fn get_leaf_columns(&self) -> Vec<&ExcelColumnInfo> {
        let parent_map = self.get_parent_map();
        let mut leaf_columns = Vec::new();
        for column in self.columns.iter() {
            if !parent_map.contains_key(&column.key) {
                leaf_columns.push(column);
            }
        }
        leaf_columns
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
}

#[wasm_bindgen]
impl ExcelInfo {
    #[wasm_bindgen(constructor)]
    pub fn bind_new(
        name: String,
        sheet_name: String,
        columns: Vec<ExcelColumnInfo>,
        author: String,
        create_time: String,
    ) -> Self {
        ExcelInfo::new(name, sheet_name, columns, author, create_time)
    }

    #[wasm_bindgen(js_name = withTitle)]
    pub fn bind_with_title(self, title: String) -> Self {
        self.with_title(title)
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

    #[wasm_bindgen(js_name= withTitleFormat)]
    pub fn with_title_format(mut self, title_format: ExcelCellFormat) -> Self {
        self.title_format = Some(title_format);
        self
    }

    #[wasm_bindgen(js_name = withOffset)]
    pub fn with_offset(mut self, dx: u16, dy: u32) -> Self {
        self.dx = dx;
        self.dy = dy;
        self
    }

    #[wasm_bindgen(js_name = withIsHeaderFreeze)]
    pub fn with_is_header_freeze(mut self, is_header_freeze: bool) -> Self {
        self.is_header_freeze = is_header_freeze;
        self
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelCellFormat {
    pub rule: String,
    pub value: String,
    pub color: String,
    pub bold: bool,
    pub italic: bool,
    pub underline: bool,
    pub strikethrough: bool,
    pub font_size: f64,
    pub background_color: String,
    pub align: String,
    pub align_vertical: String,
    pub date_format: Option<String>,
    pub border_color: Option<String>,
}

#[wasm_bindgen]
impl ExcelCellFormat {
    #[wasm_bindgen(constructor)]
    pub fn new() -> ExcelCellFormat {
        ExcelCellFormat {
            rule: "default".into(),
            value: "".into(),
            color: "black".into(),
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            font_size: 11.0,
            background_color: "white".into(),
            align: "left".into(),
            align_vertical: "bottom".into(),
            date_format: None,
            border_color: None,
        }
    }

    #[wasm_bindgen(js_name = withRule)]
    pub fn with_rule(mut self, rule: String) -> Self {
        self.rule = rule;
        self
    }

    #[wasm_bindgen(js_name = withValue)]
    pub fn with_value(mut self, value: String) -> Self {
        self.value = value;
        self
    }

    #[wasm_bindgen(js_name = withColor)]
    pub fn bind_with_color(self, color: String) -> Self {
        self.with_color(color)
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
    pub fn bind_with_align(self, align: String) -> Self {
        self.with_align(align)
    }

    #[wasm_bindgen(js_name = withAlignVertical)]
    pub fn bind_with_align_vertical(self, align_vertical: String) -> Self {
        self.with_align_vertical(align_vertical)
    }

    #[wasm_bindgen(js_name = withDateFormat)]
    pub fn with_date_format(mut self, date_format: String) -> Self {
        self.date_format = Some(date_format);
        self
    }

    #[wasm_bindgen(js_name = withBorderColor)]
    pub fn bind_with_border_color(self, border_color: String) -> Self {
        self.with_border_color(border_color)
    }
}

impl ExcelCellFormat {
    pub fn with_color<T: Into<String>>(mut self, color: T) -> Self {
        self.color = color.into();
        self
    }

    pub fn with_align<T: Into<String>>(mut self, align: T) -> Self {
        self.align = align.into();
        self
    }

    pub fn with_align_vertical<T: Into<String>>(mut self, align_vertical: T) -> Self {
        self.align_vertical = align_vertical.into();
        self
    }

    pub fn with_border_color<T: Into<String>>(mut self, border_color: T) -> Self {
        self.border_color = Some(border_color.into());
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
    pub parent: String,
    pub format: Option<ExcelCellFormat>,
    pub value_format: Vec<ExcelCellFormat>,
    pub data_group: String,
    pub data_group_parent: String,
}

#[wasm_bindgen]
impl ExcelColumnInfo {
    #[wasm_bindgen(constructor)]
    pub fn bind_new(key: String, name: String) -> ExcelColumnInfo {
        ExcelColumnInfo::new(key, name)
    }

    #[wasm_bindgen(js_name = withNote)]
    pub fn with_note(mut self, note: String) -> Self {
        self.note = Some(note);
        self
    }

    #[wasm_bindgen(js_name = withDataType)]
    pub fn bind_with_data_type(self, data_type: String) -> Self {
        self.with_data_type(data_type)
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

    #[wasm_bindgen(js_name = withFormat)]
    pub fn with_format(mut self, format: ExcelCellFormat) -> Self {
        self.format = Some(format);
        self
    }

    #[wasm_bindgen(js_name = withParent)]
    pub fn bind_with_parent(self, parent: String) -> Self {
        self.with_parent(parent)
    }

    #[wasm_bindgen(js_name = withValueFormat)]
    pub fn with_value_format(mut self, value_format: Vec<ExcelCellFormat>) -> Self {
        self.value_format = value_format;
        self
    }

    #[wasm_bindgen(js_name = withDataGroup)]
    pub fn bind_with_data_group(self, group: String) -> Self {
        self.with_data_group(group)
    }

    #[wasm_bindgen(js_name = withDataGroupParent)]
    pub fn bind_with_data_group_parent(self, group_parent: String) -> Self {
        self.with_data_group_parent(group_parent)
    }
}

impl ExcelColumnInfo {
    pub fn new<T: Into<String>>(key: T, name: T) -> Self {
        ExcelColumnInfo {
            key: key.into(),
            name: name.into(),
            width: 10.0,
            note: None,
            data_type: "text".into(),
            allowed_values: Vec::new(),
            parent: "".into(),
            format: None,
            value_format: Vec::new(),
            data_group: "".into(),
            data_group_parent: "".into(),
        }
    }

    pub fn with_parent<T: Into<String>>(mut self, parent: T) -> Self {
        self.parent = parent.into();
        self
    }

    pub fn with_data_type<T: Into<String>>(mut self, data_type: T) -> Self {
        self.data_type = data_type.into();
        self
    }

    pub fn with_data_group<T: Into<String>>(mut self, data_group: T) -> Self {
        self.data_group = data_group.into();
        self
    }

    pub fn with_data_group_parent<T: Into<String>>(mut self, data_group_parent: T) -> Self {
        self.data_group_parent = data_group_parent.into();
        self
    }

    pub fn is_root_group(&self) -> bool {
        !self.data_group.is_empty() && self.data_group_parent.is_empty()
    }

    pub fn has_parent(&self) -> bool {
        !self.parent.is_empty()
    }

    pub fn get_value_format<'a>(&'a self, value: &'a String) -> Option<&'a ExcelCellFormat> {
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
