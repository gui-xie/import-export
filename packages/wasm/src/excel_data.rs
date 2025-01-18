use std::fmt;
use wasm_bindgen::prelude::*;

const ROOT_DATA_KEY: &str = "root";

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelColumnData {
    pub key: String,
    pub value: String,
    pub children: Vec<ExcelRowData>,
}

impl ExcelColumnData {
    pub fn root() -> ExcelColumnData {
        ExcelColumnData {
            key: ROOT_DATA_KEY.into(),
            value: "".into(),
            children: Vec::new(),
        }
    }

    pub fn is_root(&self) -> bool {
        self.key == ROOT_DATA_KEY
    }

    fn fmt_with_indent(&self, f: &mut fmt::Formatter<'_>, indent: usize) -> fmt::Result {
        let indent_str = "  ".repeat(indent);
        writeln!(f, "{}- ExcelColumnData:", indent_str,)?;
        writeln!(f, "{}  key: {}", indent_str, self.key)?;
        writeln!(f, "{}  value: {}", indent_str, self.value)
    }

    pub fn with_children(mut self, children: Vec<ExcelRowData>) -> Self {
        self.children = children;
        self
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

impl fmt::Debug for ExcelColumnData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.fmt_with_indent(f, 0)
    }
}

#[wasm_bindgen]
impl ExcelColumnData {
    #[wasm_bindgen(constructor)]
    pub fn new(key: String, value: String) -> ExcelColumnData {
        ExcelColumnData {
            key,
            value,
            children: Vec::new(),
        }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelRowData {
    pub columns: Vec<ExcelColumnData>,
}

impl ExcelRowData {
    fn fmt_with_indent(&self, f: &mut fmt::Formatter<'_>, indent: usize) -> fmt::Result {
        let indent_str = "  ".repeat(indent);
        writeln!(f, "{}- ExcelRowData:", indent_str)?;
        for column in &self.columns {
            column.fmt_with_indent(f, indent + 1)?;
        }
        Ok(())
    }

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

impl fmt::Debug for ExcelRowData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.fmt_with_indent(f, 0)
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
#[derive(Clone)]
pub struct ExcelData {
    pub rows: Vec<ExcelRowData>,
}

impl ExcelData {
    fn fmt_with_indent(&self, f: &mut fmt::Formatter<'_>, indent: usize) -> fmt::Result {
        let indent_str = "  ".repeat(indent);
        writeln!(f, "{}ExcelData:", indent_str)?;
        for row in &self.rows {
            row.fmt_with_indent(f, indent + 1)?;
        }
        Ok(())
    }
}

impl fmt::Debug for ExcelData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.fmt_with_indent(f, 0)
    }
}

#[wasm_bindgen]
impl ExcelData {
    #[wasm_bindgen(constructor)]
    pub fn new(rows: Vec<ExcelRowData>) -> ExcelData {
        ExcelData { rows }
    }
}
