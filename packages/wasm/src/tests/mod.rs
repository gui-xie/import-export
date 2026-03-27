#[cfg(test)]
mod tests {
    use crate::{create_template_buffer, excel_structs::*, export_data_buffer, import_data_buffer};

    use excel_column_data::*;
    use excel_data::*;
    use excel_info::*;
    use excel_row_data::*;
    use insta::{assert_binary_snapshot, assert_snapshot};
    use std::panic;

    fn panic_message(error: Box<dyn std::any::Any + Send>) -> String {
        if let Some(message) = error.downcast_ref::<String>() {
            return message.clone();
        }
        if let Some(message) = error.downcast_ref::<&str>() {
            return message.to_string();
        }
        format!("{:?}", error)
    }

    fn create_excel_info() -> ExcelInfo {
        let name = "Pokemon";
        let sheet_name = "FireRed Pokédex";
        let author = "senlinz";
        let create_time = "2024-11-01T08:00:00";
        let columns = vec![
            ExcelColumnInfo::new("number", "Number"),
            ExcelColumnInfo::new("name", "Name"),
            ExcelColumnInfo::new("first_type", "First"),
            ExcelColumnInfo::new("second_type", "Second"),
            ExcelColumnInfo::new("abilities", "Abilities"),
            ExcelColumnInfo::new("hp", "HP")
                .with_data_type("number")
                .with_data_type("number"),
            ExcelColumnInfo::new("attack", "Attack")
                .with_data_type("number")
                .with_data_type("number"),
            ExcelColumnInfo::new("defense", "Defense")
                .with_data_type("number")
                .with_data_type("number"),
            ExcelColumnInfo::new("sp_attack", "Sp. Atk")
                .with_data_type("number")
                .with_data_type("number"),
            ExcelColumnInfo::new("sp_defense", "Sp. Def")
                .with_data_type("number")
                .with_data_type("number"),
            ExcelColumnInfo::new("speed", "Speed")
                .with_data_type("number")
                .with_data_type("number"),
            ExcelColumnInfo::new("total", "Total").with_data_type("number"),
        ];
        excel_info::ExcelInfo::new(name, sheet_name, columns, author, create_time)
    }

    #[test]
    fn import_pokemon_success() {
        // Arrange
        let info = create_excel_info();
        let excel_bytes: &[u8] = include_bytes!(
            "./snapshots/imexport_wasm__tests__tests__export_pokemon_success.snap.xlsx"
        );

        // Act
        let result = import_data_buffer(info, excel_bytes);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        let snapshot = format!("{:?}", result);
        assert_snapshot!(snapshot);
    }

    #[test]
    fn import_pokemon_header_mismatch_fails() {
        // Arrange
        let source_info = create_excel_info();
        let excel_bytes = create_template_buffer(&source_info).unwrap();
        let mut import_info = create_excel_info();
        import_info.columns[0].name = "No.".into();

        // Act
        let result = import_data_buffer(import_info, &excel_bytes);

        // Assert
        assert!(result.is_err());
        let error = result.err().unwrap().to_string();
        assert!(error.contains("Header mismatch"));
        assert!(error.contains("expected 'No.'"));
    }

    #[test]
    fn import_pokemon_uses_first_sheet_when_named_sheet_is_missing() {
        // Arrange
        let source_info = ExcelInfo::new(
            "Pokemon",
            "Kanto Pokédex",
            create_excel_info().columns,
            "senlinz",
            "2024-11-01T08:00:00",
        );
        let excel_bytes = create_template_buffer(&source_info).unwrap();
        let import_info = create_excel_info();

        // Act
        let result = import_data_buffer(import_info, &excel_bytes);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.rows.is_empty());
    }

    #[test]
    fn import_pokemon_missing_header_fails() {
        // Arrange
        let source_info = create_excel_info();
        let excel_bytes = create_template_buffer(&source_info).unwrap();
        let mut import_info = create_excel_info();
        import_info
            .columns
            .push(ExcelColumnInfo::new("region", "Region"));

        // Act
        let result = import_data_buffer(import_info, &excel_bytes);

        // Assert
        assert!(result.is_err());
        let error = result.err().unwrap().to_string();
        assert!(error.contains("Header mismatch"));
        assert!(error.contains("expected 'Region'"));
    }

    #[test]
    fn invalid_schema_duplicate_key_panics() {
        let result = panic::catch_unwind(|| {
            ExcelInfo::new(
                "Broken",
                "sheet1",
                vec![
                    ExcelColumnInfo::new("name", "Name"),
                    ExcelColumnInfo::new("name", "Alias"),
                ],
                "senlinz",
                "2024-11-01T08:00:00",
            )
        });

        assert!(result.is_err());
        let message = panic_message(result.err().unwrap());
        assert!(message.contains("duplicate column key"));
    }

    #[test]
    fn invalid_schema_unknown_group_parent_panics() {
        let result = panic::catch_unwind(|| {
            ExcelInfo::new(
                "Broken",
                "sheet1",
                vec![
                    ExcelColumnInfo::new("moves", "Moves"),
                    ExcelColumnInfo::new("move_name", "Move")
                        .with_parent("moves")
                        .with_data_group_parent("missing_group"),
                ],
                "senlinz",
                "2024-11-01T08:00:00",
            )
        });

        assert!(result.is_err());
        let message = panic_message(result.err().unwrap());
        assert!(message.contains("dataGroupParent"));
    }

    #[test]
    fn create_pokemon_template_success() {
        // Arrange
        let info = create_excel_info();

        // Act
        let result = create_template_buffer(&info);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_binary_snapshot!("create_pokemon_template_success.xlsx", result);
    }

    #[tokio::test]
    async fn export_pokemon_success() {
        // Arrange
        let info = create_excel_info();
        let data = excel_data::ExcelData {
            rows: vec![ExcelRowData::new(vec![
                ExcelColumnData::new("number", "#001"),
                ExcelColumnData::new("name", "Bulbasaur"),
                ExcelColumnData::new("first_type", "Grass"),
                ExcelColumnData::new("second_type", "Poison"),
                ExcelColumnData::new("abilities", "Overgrow/Chlorophyll"),
                ExcelColumnData::new("hp", "45"),
                ExcelColumnData::new("attack", "49"),
                ExcelColumnData::new("defense", "49"),
                ExcelColumnData::new("sp_attack", "65"),
                ExcelColumnData::new("sp_defense", "65"),
                ExcelColumnData::new("speed", "45"),
                ExcelColumnData::new("total", "318"),
            ])],
        };

        // Act
        let result = export_data_buffer(&info, &data).await;

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_binary_snapshot!("export_pokemon_success.xlsx", result);
    }

    #[tokio::test]
    async fn export_number_column_with_invalid_value_fails() {
        let info = ExcelInfo::new(
            "Pokemon",
            "FireRed Pokédex",
            vec![ExcelColumnInfo::new("hp", "HP").with_data_type("number")],
            "senlinz",
            "2024-11-01T08:00:00",
        );
        let data = ExcelData::new(vec![ExcelRowData::new(vec![ExcelColumnData::new("hp", "abc")])]);

        let result = export_data_buffer(&info, &data).await;

        assert!(result.is_err());
        assert!(result
            .err()
            .unwrap()
            .to_string()
            .contains("Invalid number value 'abc'"));
    }

    #[tokio::test]
    async fn export_date_column_with_invalid_value_fails() {
        let info = ExcelInfo::new(
            "Pokemon",
            "FireRed Pokédex",
            vec![ExcelColumnInfo::new("caught_on", "Caught On").with_data_type("date")],
            "senlinz",
            "2024-11-01T08:00:00",
        );
        let data = ExcelData::new(vec![ExcelRowData::new(vec![ExcelColumnData::new(
            "caught_on",
            "not-a-date",
        )])]);

        let result = export_data_buffer(&info, &data).await;

        assert!(result.is_err());
        assert!(result
            .err()
            .unwrap()
            .to_string()
            .contains("Invalid date value 'not-a-date'"));
    }

    #[tokio::test]
    async fn import_pokemon_with_offset_success() {
        // Arrange
        let info = create_excel_info().with_offset(2, 1).with_title("Pokemon");
        let data = excel_data::ExcelData {
            rows: vec![ExcelRowData::new(vec![
                ExcelColumnData::new("number", "#001"),
                ExcelColumnData::new("name", "Bulbasaur"),
                ExcelColumnData::new("first_type", "Grass"),
                ExcelColumnData::new("second_type", "Poison"),
                ExcelColumnData::new("abilities", "Overgrow/Chlorophyll"),
                ExcelColumnData::new("hp", "45"),
                ExcelColumnData::new("attack", "49"),
                ExcelColumnData::new("defense", "49"),
                ExcelColumnData::new("sp_attack", "65"),
                ExcelColumnData::new("sp_defense", "65"),
                ExcelColumnData::new("speed", "45"),
                ExcelColumnData::new("total", "318"),
            ])],
        };
        let excel_bytes = export_data_buffer(&info, &data).await.unwrap();

        // Act
        let result = import_data_buffer(info, &excel_bytes);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.rows.len(), 1);
        assert_eq!(result.rows[0].columns.len(), 12);
        assert_eq!(result.rows[0].columns[0].key, "number");
        assert_eq!(result.rows[0].columns[0].value, "#001");
        assert_eq!(result.rows[0].columns[1].key, "name");
        assert_eq!(result.rows[0].columns[1].value, "Bulbasaur");
    }

    #[tokio::test]
    async fn export_pokemon_skill_success() {
        // Arrange
        let info = ExcelInfo::new(
            "Pokemon",
            "FireRed Pokédex",
            vec![
                ExcelColumnInfo::new("number", "Number"),
                ExcelColumnInfo::new("name", "Name"),
                ExcelColumnInfo::new("moves", "Moves").with_data_group("moves"),
                ExcelColumnInfo::new("moves_by", "By")
                    .with_parent("moves")
                    .with_data_group("moves_by")
                    .with_data_group_parent("moves"),
                ExcelColumnInfo::new("moves_lv", "LV/TM/HM")
                    .with_parent("moves")
                    .with_data_type("number")
                    .with_data_group_parent("moves_by"),
                ExcelColumnInfo::new("moves_move", "Move.")
                    .with_parent("moves")
                    .with_width(16.0)
                    .with_data_group_parent("moves_by"),
                ExcelColumnInfo::new("moves_type", "Type.")
                    .with_parent("moves")
                    .with_data_group_parent("moves_by"),
                ExcelColumnInfo::new("moves_cat", "Cat.")
                    .with_parent("moves")
                    .with_data_group_parent("moves_by"),
                ExcelColumnInfo::new("moves_power", "Power.")
                    .with_parent("moves")
                    .with_data_group_parent("moves_by"),
                ExcelColumnInfo::new("moves_acc", "Acc.")
                    .with_parent("moves")
                    .with_data_group_parent("moves_by"),
            ],
            "senlinz",
            "2024-11-01T08:00:00",
        );

        let data = ExcelData::new(vec![ExcelRowData::new(vec![
            ExcelColumnData::new("number", "#001"),
            ExcelColumnData::new("name", "Bulbasaur"),
            ExcelColumnData::new_root_group(
                "moves".into(),
                vec![
                    ExcelRowData::new(vec![ExcelColumnData::new_group(
                        "moves_by".into(),
                        "Level".into(),
                        vec![
                            ExcelRowData::new(vec![
                                ExcelColumnData::new("moves_lv", "1"),
                                ExcelColumnData::new("moves_move", "Tackle"),
                                ExcelColumnData::new("moves_type", "Normal"),
                                ExcelColumnData::new("moves_cat", "Physical"),
                                ExcelColumnData::new("moves_power", "40"),
                                ExcelColumnData::new("moves_acc", "100"),
                            ]),
                            ExcelRowData::new(vec![
                                ExcelColumnData::new("moves_lv", "4"),
                                ExcelColumnData::new("moves_move", "Growl"),
                                ExcelColumnData::new("moves_type", "Normal"),
                                ExcelColumnData::new("moves_cat", "Status"),
                                ExcelColumnData::new("moves_power", "-"),
                                ExcelColumnData::new("moves_acc", "100"),
                            ]),
                            ExcelRowData::new(vec![
                                ExcelColumnData::new("moves_lv", "7"),
                                ExcelColumnData::new("moves_move", "Leech Seed"),
                                ExcelColumnData::new("moves_type", "Grass"),
                                ExcelColumnData::new("moves_cat", "Status"),
                                ExcelColumnData::new("moves_power", "-"),
                                ExcelColumnData::new("moves_acc", "90"),
                            ]),
                            ExcelRowData::new(vec![
                                ExcelColumnData::new("moves_lv", "10"),
                                ExcelColumnData::new("moves_move", "Vine Whip"),
                                ExcelColumnData::new("moves_type", "Grass"),
                                ExcelColumnData::new("moves_cat", "Special"),
                                ExcelColumnData::new("moves_power", "35"),
                                ExcelColumnData::new("moves_acc", "100"),
                            ]),
                        ],
                    )]),
                    ExcelRowData::new(vec![ExcelColumnData::new_group(
                        "moves_by".into(),
                        "Egg".into(),
                        vec![
                            ExcelRowData::new(vec![
                                ExcelColumnData::new("moves_move", "Curse"),
                                ExcelColumnData::new("moves_type", "Ghost"),
                                ExcelColumnData::new("moves_cat", "Status"),
                                ExcelColumnData::new("moves_power", "-"),
                                ExcelColumnData::new("moves_acc", "—"),
                            ]),
                            ExcelRowData::new(vec![
                                ExcelColumnData::new("moves_move", "Ingrain"),
                                ExcelColumnData::new("moves_type", "Grass"),
                                ExcelColumnData::new("moves_cat", "Status"),
                                ExcelColumnData::new("moves_power", "-"),
                                ExcelColumnData::new("moves_acc", "—"),
                            ]),
                            ExcelRowData::new(vec![
                                ExcelColumnData::new("moves_move", "Nature Power"),
                                ExcelColumnData::new("moves_type", "Normal"),
                                ExcelColumnData::new("moves_cat", "Status"),
                                ExcelColumnData::new("moves_power", "-"),
                                ExcelColumnData::new("moves_acc", "—"),
                            ]),
                        ],
                    )]),
                ],
            ),
        ])]);

        // Act
        let result = export_data_buffer(&info, &data).await;

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_binary_snapshot!("export_pokemon_skill_success.xlsx", result);
    }
}
