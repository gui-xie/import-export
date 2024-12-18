use std::fmt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct ExcelColumnData {
    pub key: String,
    pub value: String,
}

impl ExcelColumnData {
    fn fmt_with_indent(&self, f: &mut fmt::Formatter<'_>, indent: usize) -> fmt::Result {
        let indent_str = "  ".repeat(indent);
        writeln!(f, "{}- ExcelColumnData:", indent_str,)?;
        writeln!(f, "{}  key: {}", indent_str, self.key)?;
        writeln!(f, "{}  value: {}", indent_str, self.value)
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
        ExcelColumnData { key, value }
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
