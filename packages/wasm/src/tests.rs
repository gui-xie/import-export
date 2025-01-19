#[cfg(test)]
mod tests {
    use excel_data::*;
    use excel_info::*;
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

    fn create_excel_info() -> ExcelInfo {
        let name = "Pokemon";
        let sheet_name = "FireRed Pokédex";
        let author = "senlinz";
        let create_time = "2024-11-01T08:00:00";
        let columns = vec![
            ExcelColumnInfo::new("number".into(), "Number".into())
                .with_color("#868686".into())
                .with_value_format(vec![ValueFormat::new("default".into())
                    .with_bold(true)
                    .with_font_size(20.0)
                    .with_align("center".into())
                    .with_align_vertical("top".into())]),
            ExcelColumnInfo::new("type".into(), "Type".into()),
            ExcelColumnInfo::new("first_type".into(), "First".into())
                .with_parent("type".into())
                .with_value_format(vec![ValueFormat::new("eq".into())
                    .with_value("Grass".into())
                    .with_background_color("#78C850".into())
                    .with_color("#FFFFFF".into())
                    .with_bold(true)
                    .with_font_size(14.0)
                    .with_align("center".into())
                    .with_align_vertical("top".into())]),
            ExcelColumnInfo::new("second_type".into(), "Second".into())
                .with_parent("type".into())
                .with_value_format(vec![
                    ValueFormat::new("eq".into())
                        .with_value("Poison".into())
                        .with_background_color("#A040A0".into())
                        .with_color("#FFFFFF".into())
                        .with_italic(true)
                        .with_font_size(14.0)
                        .with_align("center".into())
                        .with_align_vertical("top".into()),
                    ValueFormat::new("default".into())
                        .with_italic(true)
                        .with_strikethrough(true)
                        .with_underline(true)
                        .with_font_size(14.0)
                        .with_align("right".into())
                        .with_align_vertical("top".into()),
                ]),
            ExcelColumnInfo::new("abilities".into(), "Abilities".into())
                .with_width(30.0)
                .with_background_color("#00FFFF".into())
                .with_color("#FF0000".into())
                .with_value_format(vec![ValueFormat::new("default".into())
                    .with_bold(true)
                    .with_align("center".into())
                    .with_align_vertical("top".into())]),
            ExcelColumnInfo::new("base_stats".into(), "Base Stats".into()),
            ExcelColumnInfo::new("hp".into(), "HP".into())
                .with_data_type("number".into())
                .with_parent("base_stats".into())
                .with_value_format(vec![ValueFormat::new("default".into())
                    .with_align("center".into())
                    .with_align_vertical("top".into())]),
            ExcelColumnInfo::new("attack".into(), "Attack".into())
                .with_data_type("number".into())
                .with_parent("base_stats".into())
                .with_value_format(vec![ValueFormat::new("default".into())
                    .with_align("center".into())
                    .with_align_vertical("top".into())]),
            ExcelColumnInfo::new("defense".into(), "Defense".into())
                .with_data_type("number".into())
                .with_parent("base_stats".into())
                .with_value_format(vec![ValueFormat::new("default".into())
                    .with_align("center".into())
                    .with_align_vertical("top".into())]),
            ExcelColumnInfo::new("sp_attack".into(), "Sp. Atk".into())
                .with_data_type("number".into())
                .with_parent("base_stats".into())
                .with_value_format(vec![ValueFormat::new("default".into())
                    .with_align("center".into())
                    .with_align_vertical("top".into())]),
            ExcelColumnInfo::new("sp_defense".into(), "Sp. Def".into())
                .with_data_type("number".into())
                .with_parent("base_stats".into())
                .with_value_format(vec![ValueFormat::new("default".into())
                    .with_align("center".into())
                    .with_align_vertical("top".into())]),
            ExcelColumnInfo::new("speed".into(), "Speed".into())
                .with_data_type("number".into())
                .with_parent("base_stats".into())
                .with_value_format(vec![ValueFormat::new("default".into())
                    .with_align("center".into())
                    .with_align_vertical("top".into())]),
            ExcelColumnInfo::new("total".into(), "Total".into())
                .with_data_type("number".into())
                .with_parent("base_stats".into())
                .with_value_format(vec![ValueFormat::new("default".into())
                    .with_align("center".into())
                    .with_align_vertical("top".into())]),
            ExcelColumnInfo::new("evolution".into(), "Evolution".into()),
            ExcelColumnInfo::new("evolution_method".into(), "Method".into())
                .with_parent("evolution".into()),
            ExcelColumnInfo::new("evolution_condition".into(), "Condition".into())
                .with_parent("evolution".into()),
            ExcelColumnInfo::new("evolution_next".into(), "Next".into())
                .with_parent("evolution".into()),
            ExcelColumnInfo::new("moves".into(), "Moves".into()),
            ExcelColumnInfo::new("moves_by".into(), "By".into())
                .with_parent("moves".into())
                .with_value_format(vec![ValueFormat::new("default".into())
                    .with_font_size(14.0)
                    .with_align("center".into())
                    .with_align_vertical("center".into())]),
            ExcelColumnInfo::new("moves_lv".into(), "LV/TM/HM".into())
                .with_parent("moves".into())
                .with_data_type("number".into()),
            ExcelColumnInfo::new("moves_move".into(), "Move.".into()).with_parent("moves".into()),
            ExcelColumnInfo::new("moves_type".into(), "Type.".into())
                .with_parent("moves".into())
                .with_value_format(vec![
                    ValueFormat::new("eq".into())
                        .with_value("Grass".into())
                        .with_background_color("#78C850".into())
                        .with_color("#FFFFFF".into())
                        .with_bold(true)
                        .with_font_size(14.0)
                        .with_align("center".into())
                        .with_align_vertical("center".into()),
                    ValueFormat::new("eq".into())
                        .with_value("Poison".into())
                        .with_background_color("#A040A0".into())
                        .with_color("#FFFFFF".into())
                        .with_bold(true)
                        .with_font_size(14.0)
                        .with_align("center".into())
                        .with_align_vertical("center".into()),
                    ValueFormat::new("default".into())
                        .with_strikethrough(true)
                        .with_underline(true),
                ]),
            ExcelColumnInfo::new("moves_cat".into(), "Cat.".into()).with_parent("moves".into()),
            ExcelColumnInfo::new("moves_power".into(), "Power.".into()).with_parent("moves".into()),
            ExcelColumnInfo::new("moves_acc".into(), "Acc.".into()).with_parent("moves".into()),
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
        return excel_data::ExcelData {
            rows: vec![create_bulbasaur()],
        };
    }

    fn create_bulbasaur() -> ExcelRowData {
        let level_moves = ExcelRowData::new(vec![ExcelColumnData::new(
            "moves_by".into(),
            "level".into(),
        )
        .with_children(vec![
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "1".into()),
                ExcelColumnData::new("moves_move".into(), "Tackle".into()),
                ExcelColumnData::new("moves_type".into(), "Normal".into()),
                ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                ExcelColumnData::new("moves_power".into(), "40".into()),
                ExcelColumnData::new("moves_acc".into(), "100".into()),
            ]),
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "4".into()),
                ExcelColumnData::new("moves_move".into(), "Growl".into()),
                ExcelColumnData::new("moves_type".into(), "Normal".into()),
                ExcelColumnData::new("moves_cat".into(), "Status".into()),
                ExcelColumnData::new("moves_power".into(), "-".into()),
                ExcelColumnData::new("moves_acc".into(), "100".into()),
            ]),
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "7".into()),
                ExcelColumnData::new("moves_move".into(), "Leech Seed".into()),
                ExcelColumnData::new("moves_type".into(), "Grass".into()),
                ExcelColumnData::new("moves_cat".into(), "Status".into()),
                ExcelColumnData::new("moves_power".into(), "-".into()),
                ExcelColumnData::new("moves_acc".into(), "90".into()),
            ]),
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "10".into()),
                ExcelColumnData::new("moves_move".into(), "Vine Whip".into()),
                ExcelColumnData::new("moves_type".into(), "Grass".into()),
                ExcelColumnData::new("moves_cat".into(), "Special".into()),
                ExcelColumnData::new("moves_power".into(), "35".into()),
                ExcelColumnData::new("moves_acc".into(), "100".into()),
            ]),
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "15".into()),
                ExcelColumnData::new("moves_move".into(), "PoisonPowder".into()),
                ExcelColumnData::new("moves_type".into(), "Poison".into()),
                ExcelColumnData::new("moves_cat".into(), "Status".into()),
                ExcelColumnData::new("moves_power".into(), "-".into()),
                ExcelColumnData::new("moves_acc".into(), "75".into()),
            ]),
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "15".into()),
                ExcelColumnData::new("moves_move".into(), "Sleep Powder".into()),
                ExcelColumnData::new("moves_type".into(), "Grass".into()),
                ExcelColumnData::new("moves_cat".into(), "Status".into()),
                ExcelColumnData::new("moves_power".into(), "-".into()),
                ExcelColumnData::new("moves_acc".into(), "75".into()),
            ]),
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "20".into()),
                ExcelColumnData::new("moves_move".into(), "Razor Leaf".into()),
                ExcelColumnData::new("moves_type".into(), "Grass".into()),
                ExcelColumnData::new("moves_cat".into(), "Special".into()),
                ExcelColumnData::new("moves_power".into(), "55".into()),
                ExcelColumnData::new("moves_acc".into(), "95".into()),
            ]),
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "25".into()),
                ExcelColumnData::new("moves_move".into(), "Sweet Scent".into()),
                ExcelColumnData::new("moves_type".into(), "Normal".into()),
                ExcelColumnData::new("moves_cat".into(), "Status".into()),
                ExcelColumnData::new("moves_power".into(), "-".into()),
                ExcelColumnData::new("moves_acc".into(), "100".into()),
            ]),
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "32".into()),
                ExcelColumnData::new("moves_move".into(), "Growth".into()),
                ExcelColumnData::new("moves_type".into(), "Normal".into()),
                ExcelColumnData::new("moves_cat".into(), "Status".into()),
                ExcelColumnData::new("moves_power".into(), "-".into()),
                ExcelColumnData::new("moves_acc".into(), "-".into()),
            ]),
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "39".into()),
                ExcelColumnData::new("moves_move".into(), "Synthesis".into()),
                ExcelColumnData::new("moves_type".into(), "Grass".into()),
                ExcelColumnData::new("moves_cat".into(), "Status".into()),
                ExcelColumnData::new("moves_power".into(), "-".into()),
                ExcelColumnData::new("moves_acc".into(), "-".into()),
            ]),
            ExcelRowData::new(vec![
                ExcelColumnData::new("moves_lv".into(), "46".into()),
                ExcelColumnData::new("moves_move".into(), "SolarBeam".into()),
                ExcelColumnData::new("moves_type".into(), "Grass".into()),
                ExcelColumnData::new("moves_cat".into(), "Special".into()),
                ExcelColumnData::new("moves_power".into(), "120".into()),
                ExcelColumnData::new("moves_acc".into(), "100".into()),
            ]),
        ])]);
        let egg_moves =
            ExcelRowData::new(vec![ExcelColumnData::new("moves_by".into(), "egg".into())
                .with_children(vec![
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_move".into(), "Curse".into()),
                        ExcelColumnData::new("moves_type".into(), "Ghost".into()),
                        ExcelColumnData::new("moves_cat".into(), "Status".into()),
                        ExcelColumnData::new("moves_power".into(), "-".into()),
                        ExcelColumnData::new("moves_acc".into(), "—".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_move".into(), "Ingrain".into()),
                        ExcelColumnData::new("moves_type".into(), "Grass".into()),
                        ExcelColumnData::new("moves_cat".into(), "Status".into()),
                        ExcelColumnData::new("moves_power".into(), "-".into()),
                        ExcelColumnData::new("moves_acc".into(), "—".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_move".into(), "Nature Power".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Status".into()),
                        ExcelColumnData::new("moves_power".into(), "-".into()),
                        ExcelColumnData::new("moves_acc".into(), "—".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_move".into(), "Petal Dance".into()),
                        ExcelColumnData::new("moves_type".into(), "Grass".into()),
                        ExcelColumnData::new("moves_cat".into(), "Special".into()),
                        ExcelColumnData::new("moves_power".into(), "70".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_move".into(), "Skull Bash".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                        ExcelColumnData::new("moves_power".into(), "100".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                ])]);
        let hm_moves =
            ExcelRowData::new(vec![ExcelColumnData::new("moves_by".into(), "HM".into())
                .with_children(vec![
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "01".into()),
                        ExcelColumnData::new("moves_move".into(), "Cut".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                        ExcelColumnData::new("moves_power".into(), "50".into()),
                        ExcelColumnData::new("moves_acc".into(), "95".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "04".into()),
                        ExcelColumnData::new("moves_move".into(), "Strength".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                        ExcelColumnData::new("moves_power".into(), "80".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "05".into()),
                        ExcelColumnData::new("moves_move".into(), "Flash".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Status".into()),
                        ExcelColumnData::new("moves_power".into(), "—".into()),
                        ExcelColumnData::new("moves_acc".into(), "70".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "06".into()),
                        ExcelColumnData::new("moves_move".into(), "Rock Smash".into()),
                        ExcelColumnData::new("moves_type".into(), "Fighting".into()),
                        ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                        ExcelColumnData::new("moves_power".into(), "20".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                ])]);
        let tm_moves =
            ExcelRowData::new(vec![ExcelColumnData::new("moves_by".into(), "TM".into())
                .with_children(vec![
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "06".into()),
                        ExcelColumnData::new("moves_move".into(), "Toxic".into()),
                        ExcelColumnData::new("moves_type".into(), "Poison".into()),
                        ExcelColumnData::new("moves_cat".into(), "Status".into()),
                        ExcelColumnData::new("moves_power".into(), "—".into()),
                        ExcelColumnData::new("moves_acc".into(), "85".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "09".into()),
                        ExcelColumnData::new("moves_move".into(), "Bullet Seed".into()),
                        ExcelColumnData::new("moves_type".into(), "Grass".into()),
                        ExcelColumnData::new("moves_cat".into(), "Special".into()),
                        ExcelColumnData::new("moves_power".into(), "10".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "10".into()),
                        ExcelColumnData::new("moves_move".into(), "Hidden Power".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                        ExcelColumnData::new("moves_power".into(), "60".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "11".into()),
                        ExcelColumnData::new("moves_move".into(), "Sunny Day".into()),
                        ExcelColumnData::new("moves_type".into(), "Fire".into()),
                        ExcelColumnData::new("moves_cat".into(), "Status".into()),
                        ExcelColumnData::new("moves_power".into(), "—".into()),
                        ExcelColumnData::new("moves_acc".into(), "—".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "17".into()),
                        ExcelColumnData::new("moves_move".into(), "Protect".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Status".into()),
                        ExcelColumnData::new("moves_power".into(), "—".into()),
                        ExcelColumnData::new("moves_acc".into(), "—".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "19".into()),
                        ExcelColumnData::new("moves_move".into(), "Giga Drain".into()),
                        ExcelColumnData::new("moves_type".into(), "Grass".into()),
                        ExcelColumnData::new("moves_cat".into(), "Special".into()),
                        ExcelColumnData::new("moves_power".into(), "60".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "21".into()),
                        ExcelColumnData::new("moves_move".into(), "Frustration".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                        ExcelColumnData::new("moves_power".into(), "—".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "22".into()),
                        ExcelColumnData::new("moves_move".into(), "SolarBeam".into()),
                        ExcelColumnData::new("moves_type".into(), "Grass".into()),
                        ExcelColumnData::new("moves_cat".into(), "Special".into()),
                        ExcelColumnData::new("moves_power".into(), "120".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "27".into()),
                        ExcelColumnData::new("moves_move".into(), "Return".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                        ExcelColumnData::new("moves_power".into(), "—".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "32".into()),
                        ExcelColumnData::new("moves_move".into(), "Double Team".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Status".into()),
                        ExcelColumnData::new("moves_power".into(), "—".into()),
                        ExcelColumnData::new("moves_acc".into(), "—".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "36".into()),
                        ExcelColumnData::new("moves_move".into(), "Sludge Bomb".into()),
                        ExcelColumnData::new("moves_type".into(), "Poison".into()),
                        ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                        ExcelColumnData::new("moves_power".into(), "90".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "42".into()),
                        ExcelColumnData::new("moves_move".into(), "Facade".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                        ExcelColumnData::new("moves_power".into(), "70".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "43".into()),
                        ExcelColumnData::new("moves_move".into(), "Secret Power".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Physical".into()),
                        ExcelColumnData::new("moves_power".into(), "70".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "44".into()),
                        ExcelColumnData::new("moves_move".into(), "Rest".into()),
                        ExcelColumnData::new("moves_type".into(), "Psychic".into()),
                        ExcelColumnData::new("moves_cat".into(), "Status".into()),
                        ExcelColumnData::new("moves_power".into(), "—".into()),
                        ExcelColumnData::new("moves_acc".into(), "—".into()),
                    ]),
                    ExcelRowData::new(vec![
                        ExcelColumnData::new("moves_lv".into(), "45".into()),
                        ExcelColumnData::new("moves_move".into(), "Attract".into()),
                        ExcelColumnData::new("moves_type".into(), "Normal".into()),
                        ExcelColumnData::new("moves_cat".into(), "Status".into()),
                        ExcelColumnData::new("moves_power".into(), "—".into()),
                        ExcelColumnData::new("moves_acc".into(), "100".into()),
                    ]),
                ])]);

        ExcelRowData::new(vec![
            ExcelColumnData::new("number".into(), "#001".into()),
            ExcelColumnData::new("first_type".into(), "Grass".into()),
            ExcelColumnData::new("second_type".into(), "Poison".into()),
            ExcelColumnData::root().with_children(vec![
                ExcelRowData::new(vec![ExcelColumnData::new(
                    "abilities".into(),
                    "Overgrow".into(),
                )]),
                ExcelRowData::new(vec![ExcelColumnData::new(
                    "abilities".into(),
                    "Chlorophyll".into(),
                )]),
            ]),
            ExcelColumnData::new("hp".into(), "45".into()),
            ExcelColumnData::new("attack".into(), "49".into()),
            ExcelColumnData::new("defense".into(), "49".into()),
            ExcelColumnData::new("sp_attack".into(), "65".into()),
            ExcelColumnData::new("sp_defense".into(), "65".into()),
            ExcelColumnData::new("speed".into(), "45".into()),
            ExcelColumnData::new("total".into(), "318".into()),
            ExcelColumnData::root().with_children(vec![
                ExcelRowData::new(vec![
                    ExcelColumnData::new("evolution_method".into(), "Level 16".into()),
                    ExcelColumnData::new("evolution_condition".into(), "None".into()),
                    ExcelColumnData::new("evolution_next".into(), "Ivysaur".into()),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("evolution_method".into(), "Level 32".into()),
                    ExcelColumnData::new("evolution_condition".into(), "None".into()),
                    ExcelColumnData::new("evolution_next".into(), "Venusaur".into()),
                ]),
            ]),
            ExcelColumnData::root().with_children(vec![level_moves, egg_moves, hm_moves, tm_moves]),
        ])
    }
}
