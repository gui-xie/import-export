#[cfg(test)]
mod tests {
    use insta::{assert_binary_snapshot, assert_snapshot};
    use wasm_bindgen_test::*;

    use crate::{
        create_template_buffer, excel_data, excel_info, export_data_buffer, import_data_buffer,
    };

    wasm_bindgen_test_configure!(run_in_browser);

    #[test]
    fn import_data_should_be_correct() {
        // Arrange
        let info = create_excel_info();
        let excel_bytes: &[u8] = include_bytes!("./TomAndJerry.xlsx");

        // Act
        let result = import_data_buffer(info, excel_bytes);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        let snapshot = format!("{:?}", result);
        assert_snapshot!(snapshot);
    }

    #[test]
    fn create_template_should_be_correct() {
        // Arrange
        let info = create_excel_info();

        // Act
        let result = create_template_buffer(&info);

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
        let result = export_data_buffer(&info, &data);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_binary_snapshot!("export_data_should_be_correct.xlsx", result);
    }

    fn create_excel_info() -> excel_info::ExcelInfo {
        let name = "Pokemon";
        let sheet_name = "FireRed Pokédex";
        let author = "senlinz";
        let create_time = "2024-11-01T08:00:00";
        let columns = vec![
            excel_info::ExcelColumnInfo::new("number".into(), "Number".into())
                .with_color("#868686".into()),
            excel_info::ExcelColumnInfo::new("type".into(), "Type".into()),
            excel_info::ExcelColumnInfo::new("first_type".into(), "First".into())
                .with_parent("type".into()),
            excel_info::ExcelColumnInfo::new("second_type".into(), "Second".into())
                .with_parent("type".into()),
            excel_info::ExcelColumnInfo::new("abilities".into(), "Abilities".into()),
            excel_info::ExcelColumnInfo::new("base_stats".into(), "Base Stats".into()),
            excel_info::ExcelColumnInfo::new("hp".into(), "HP".into())
                .with_parent("base_stats".into()),
            excel_info::ExcelColumnInfo::new("attack".into(), "Attack".into())
                .with_parent("base_stats".into()),
            excel_info::ExcelColumnInfo::new("defense".into(), "Defense".into())
                .with_parent("base_stats".into()),
            excel_info::ExcelColumnInfo::new("sp_attack".into(), "Sp. Atk".into())
                .with_parent("base_stats".into()),
            excel_info::ExcelColumnInfo::new("sp_defense".into(), "Sp. Def".into())
                .with_parent("base_stats".into()),
            excel_info::ExcelColumnInfo::new("speed".into(), "Speed".into())
                .with_parent("base_stats".into()),
            excel_info::ExcelColumnInfo::new("total".into(), "Total".into())
                .with_parent("base_stats".into()),
            excel_info::ExcelColumnInfo::new("evolution".into(), "Evolution".into()),
            excel_info::ExcelColumnInfo::new("evolution_method".into(), "Method".into())
                .with_parent("evolution".into()),
            excel_info::ExcelColumnInfo::new("evolution_condition".into(), "Condition".into())
                .with_parent("evolution".into()),
            excel_info::ExcelColumnInfo::new("evolution_next".into(), "Next".into())
                .with_parent("evolution".into()),
            excel_info::ExcelColumnInfo::new("moves".into(), "Moves".into()),
            excel_info::ExcelColumnInfo::new("moves_by".into(), "By".into())
                .with_parent("moves".into()),
            excel_info::ExcelColumnInfo::new("moves_move".into(), "Move.".into())
                .with_parent("moves".into()),
            excel_info::ExcelColumnInfo::new("moves_type".into(), "Type.".into())
                .with_parent("moves".into()),
            excel_info::ExcelColumnInfo::new("moves_cat".into(), "Cat.".into())
                .with_parent("moves".into()),
            excel_info::ExcelColumnInfo::new("moves_power".into(), "Power.".into())
                .with_parent("moves".into()),
            excel_info::ExcelColumnInfo::new("moves_acc".into(), "Acc.".into())
                .with_parent("moves".into()),
        ];
        excel_info::ExcelInfo::new(
            name.into(),
            sheet_name.into(),
            columns,
            author.into(),
            create_time.into(),
        )
        .with_default_row_height(30.0)
        .with_title(sheet_name.into())
        .with_title_height(50.0)
        .with_title_background_color("#FF0000".into())
        .with_title_bold(true)
        .with_title_color("#00FF00".into())
        .with_title_font_size(20.0)
    }

    fn create_export_data() -> excel_data::ExcelData {
        let level_moves = excel_data::ExcelRowData::new(vec![excel_data::ExcelColumnData::new(
            "moves_by".into(),
            "level".into(),
        )
        .with_children(vec![
            excel_data::ExcelRowData::new(vec![
                excel_data::ExcelColumnData::new("moves_move".into(), "Tackle".into()),
                excel_data::ExcelColumnData::new("moves_type".into(), "Normal".into()),
                excel_data::ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                excel_data::ExcelColumnData::new("moves_power".into(), "40".into()),
                excel_data::ExcelColumnData::new("moves_acc".into(), "100".into()),
            ]),
            excel_data::ExcelRowData::new(vec![
                excel_data::ExcelColumnData::new("moves_move".into(), "Growl".into()),
                excel_data::ExcelColumnData::new("moves_type".into(), "Normal".into()),
                excel_data::ExcelColumnData::new("moves_cat".into(), "Status".into()),
                excel_data::ExcelColumnData::new("moves_power".into(), "-".into()),
                excel_data::ExcelColumnData::new("moves_acc".into(), "100".into()),
            ]),
        ])]);
        let egg_moves = excel_data::ExcelRowData::new(vec![excel_data::ExcelColumnData::new(
            "moves_by".into(),
            "egg".into(),
        )
        .with_children(vec![
            excel_data::ExcelRowData::new(vec![
                excel_data::ExcelColumnData::new("moves_move".into(), "Curse".into()),
                excel_data::ExcelColumnData::new("moves_type".into(), "Ghost".into()),
                excel_data::ExcelColumnData::new("moves_cat".into(), "Status".into()),
                excel_data::ExcelColumnData::new("moves_power".into(), "-".into()),
                excel_data::ExcelColumnData::new("moves_acc".into(), "—".into()),
            ]),
            excel_data::ExcelRowData::new(vec![
                excel_data::ExcelColumnData::new("moves_move".into(), "Ingrain".into()),
                excel_data::ExcelColumnData::new("moves_type".into(), "Grass".into()),
                excel_data::ExcelColumnData::new("moves_cat".into(), "Status".into()),
                excel_data::ExcelColumnData::new("moves_power".into(), "-".into()),
                excel_data::ExcelColumnData::new("moves_acc".into(), "—".into()),
            ]),
        ])]);
        let bulbasaur = excel_data::ExcelRowData::new(vec![
            excel_data::ExcelColumnData::new("number".into(), "#001".into()),
            excel_data::ExcelColumnData::new("first_type".into(), "Grass".into()),
            excel_data::ExcelColumnData::new("second_type".into(), "Poison".into()),
            excel_data::ExcelColumnData::new("abilities".into(), "Overgrow".into()),
            excel_data::ExcelColumnData::new("hp".into(), "45".into()),
            excel_data::ExcelColumnData::new("attack".into(), "49".into()),
            excel_data::ExcelColumnData::new("defense".into(), "49".into()),
            excel_data::ExcelColumnData::new("sp_attack".into(), "65".into()),
            excel_data::ExcelColumnData::new("sp_defense".into(), "65".into()),
            excel_data::ExcelColumnData::new("speed".into(), "45".into()),
            excel_data::ExcelColumnData::new("total".into(), "318".into()),
            excel_data::ExcelColumnData::root().with_children(vec![
                excel_data::ExcelRowData::new(vec![
                    excel_data::ExcelColumnData::new("evolution_method".into(), "Level 16".into()),
                    excel_data::ExcelColumnData::new("evolution_condition".into(), "None".into()),
                    excel_data::ExcelColumnData::new("evolution_next".into(), "Ivysaur".into()),
                ]),
                excel_data::ExcelRowData::new(vec![
                    excel_data::ExcelColumnData::new("evolution_method".into(), "Level 32".into()),
                    excel_data::ExcelColumnData::new("evolution_condition".into(), "None".into()),
                    excel_data::ExcelColumnData::new("evolution_next".into(), "Venusaur".into()),
                ]),
            ]),
            excel_data::ExcelColumnData::root().with_children(vec![level_moves, egg_moves]),
        ]);

        return excel_data::ExcelData {
            rows: vec![bulbasaur],
        };
    }
}
