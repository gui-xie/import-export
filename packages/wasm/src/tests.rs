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
                        excel_data::ExcelColumnData::new("name".into(), "Tom".into()),
                        excel_data::ExcelColumnData::new("age".into(), "10".into()),
                        excel_data::ExcelColumnData::new("category".into(), "Cartoon".into()),
                    ],
                },
                excel_data::ExcelRowData {
                    columns: vec![
                        excel_data::ExcelColumnData::new("name".into(), "Jerry".into()),
                        excel_data::ExcelColumnData::new("age".into(), "9".into()),
                        excel_data::ExcelColumnData::new("category".into(), "Cartoon".into()),
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
            excel_info::ExcelColumnInfo::new("name".into(), "Name".into()),
            excel_info::ExcelColumnInfo::new("life".into(), "Life".into()),
            excel_info::ExcelColumnInfo::new("generation".into(), "Generation".into())
                .with_parent("life".into()),
            excel_info::ExcelColumnInfo::new("age".into(), "Age".into())
                .with_data_type(excel_info::ExcelDataType::Number)
                .with_color("#FF0000".into())
                .with_text_color("#FFFFFF".into())
                .with_text_bold(false)
                .with_parent("generation".into()),
            excel_info::ExcelColumnInfo::new("birth".into(), "Birth".into())
                .with_width(40.0)
                .with_data_type(excel_info::ExcelDataType::Date)
                .with_parent("generation".into()),
            excel_info::ExcelColumnInfo::new("heart".into(), "Heart".into())
                .with_parent("life".into()),
            excel_info::ExcelColumnInfo::new("category".into(), "Category".into()),
        ];
        excel_info::ExcelInfo::new(
            name.into(),
            sheet_name.into(),
            columns,
            author.into(),
            create_time.into(),
        )
        .with_default_row_height(30.0)
        .with_title("Tom and Jerry".into())
        .with_title_height(50.0)
    }
}
