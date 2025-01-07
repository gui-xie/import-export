#[cfg(test)]
mod tests {
    use insta::{assert_binary_snapshot, assert_snapshot};
    use wasm_bindgen_test::*;

    use crate::{create_template, excel_data, excel_info, export_data, import_data};

    wasm_bindgen_test_configure!(run_in_browser);

    #[test]
    fn import_data_should_be_correct() {
        // Arrange
        let info = create_excel_info();
        let excel_bytes: &[u8] = include_bytes!("./TomAndJerry.xlsx");

        // Act
        let result = import_data(info, excel_bytes);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        let snapshot = format!("{:?}", result);
        print!("{}", snapshot);
        assert_snapshot!(snapshot);
    }

    #[test]
    fn create_template_should_be_correct() {
        // Arrange
        let info = create_excel_info();

        // Act
        let result = create_template(info);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_binary_snapshot!("create_template_should_be_correct.xlsx", result);
    }

    #[test]
    fn export_data_should_be_correct() {
        // Arrange
        let info = create_excel_info();
        let data = create_export_data();

        // Act
        let result = export_data(info, data);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_binary_snapshot!("export_data_should_be_correct.xlsx", result);
    }

    fn create_export_data() -> excel_data::ExcelData {
        excel_data::ExcelData {
            rows: vec![
                excel_data::ExcelRowData {
                    columns: vec![
                        excel_data::ExcelColumnData::new("name".to_string(), "Tom".to_string()),
                        excel_data::ExcelColumnData::new("age".to_string(), "10".to_string()),
                        excel_data::ExcelColumnData::new(
                            "category".to_string(),
                            "Cartoon".to_string(),
                        ),
                    ],
                },
                excel_data::ExcelRowData {
                    columns: vec![
                        excel_data::ExcelColumnData::new("name".to_string(), "Jerry".to_string()),
                        excel_data::ExcelColumnData::new("age".to_string(), "9".to_string()),
                        excel_data::ExcelColumnData::new(
                            "category".to_string(),
                            "Cartoon".to_string(),
                        ),
                    ],
                },
            ],
        }
    }

    fn create_excel_info() -> excel_info::ExcelInfo {
        let name = "TomAndJerry";
        let sheet_name = "sheet1";
        let author = "senlinz";
        let create_time = "2024-11-01T08:00:00";
        let columns = vec![
            excel_info::ExcelColumnInfo::new("name".to_string(), "Name".to_string(), None),
            excel_info::ExcelColumnInfo::new("age".to_string(), "Age".to_string(), None)
                .with_data_type(excel_info::ExcelDataType::Number)
                .with_color("#FF0000".to_string())
                .with_text_color("#000000".to_string()),
            excel_info::ExcelColumnInfo::new("category".to_string(), "Category".to_string(), None),
            excel_info::ExcelColumnInfo::new("birth".to_string(), "Birth".to_string(), None)
                .with_data_type(excel_info::ExcelDataType::Date),
        ];
        excel_info::ExcelInfo::new(
            name.to_string(),
            sheet_name.to_string(),
            columns,
            author.to_string(),
            create_time.to_string(),
        )
        .with_default_row_height(30.0)
        .with_title("Tom and Jerry".to_string())
        .with_title_height(50.0)
    }
}
