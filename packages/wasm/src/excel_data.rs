use wasm_bindgen::prelude::*;

const ROOT_DATA_KEY: &str = "root";

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Debug)]
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

    pub fn new_group(group_name: String, value: String, children: Vec<ExcelRowData>) -> Self {
        ExcelColumnData {
            key: group_name.into(),
            value: value.into(),
            children,
        }
    }

    pub fn new_root_group(group_name: String, children: Vec<ExcelRowData>) -> Self {
        ExcelColumnData::new_group(group_name, "".into(), children)
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

    #[wasm_bindgen(js_name = newRoot)]
    pub fn new_root(children: Vec<ExcelRowData>) -> ExcelColumnData {
        ExcelColumnData {
            key: ROOT_DATA_KEY.into(),
            value: "".into(),
            children,
        }
    }

    #[wasm_bindgen(js_name=withChildren)]
    pub fn with_children(mut self, children: Vec<ExcelRowData>) -> Self {
        self.children = children;
        self
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Debug)]
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

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Debug)]
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
