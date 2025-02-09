use std::fmt;
use wasm_bindgen::prelude::*;
use super::excel_row_data::ExcelRowData;

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelColumnData {
    pub key: String,
    pub value: String,
    pub children: Vec<ExcelRowData>,
}

impl ExcelColumnData {
    pub fn new<T: Into<String>>(key: T, value: T) -> Self {
        ExcelColumnData {
            key: key.into(),
            value: value.into(),
            children: Vec::new(),
        }
    }

    pub fn get_children_len(&self) -> usize {
        let mut result = 0;
        for row in self.children.iter() {
            let mut row_len = 1;
            for column in row.columns.iter() {
                row_len += column.get_children_len();
            }
            result += row_len;
        }
        result
    }
}

#[wasm_bindgen]
impl ExcelColumnData {
    #[wasm_bindgen(constructor)]
    pub fn bind_new(key: String, value: String) -> ExcelColumnData {
        ExcelColumnData::new(key, value)
    }

    #[wasm_bindgen(js_name = newGroup)]
    pub fn new_group(group_name: String, value: String, children: Vec<ExcelRowData>) -> Self {
        ExcelColumnData {
            key: group_name.into(),
            value: value.into(),
            children,
        }
    }

    #[wasm_bindgen(js_name = newRootGroup)]
    pub fn new_root_group(group_name: String, children: Vec<ExcelRowData>) -> Self {
        ExcelColumnData::new_group(group_name, "".into(), children)
    }

    #[wasm_bindgen(js_name = withChildren)]
    pub fn with_children(mut self, children: Vec<ExcelRowData>) -> Self {
        self.children = children;
        self
    }
}

impl fmt::Debug for ExcelColumnData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.key, self.value)?;
        Ok(())
    }
}
