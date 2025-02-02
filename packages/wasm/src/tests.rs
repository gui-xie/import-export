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

    #[test]
    fn export_pokemon_skill_should_be_correct() {
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
        let result = export_data_buffer(&info, &data);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_binary_snapshot!("pokemon_basic_info_should_be_correct.xlsx", result);
    }

    #[test]
    fn export_complex_data_should_be_correct() {
        // Arrange
        let info = create_excel_info();
        let data = create_export_data();

        // Act
        let result = export_data_buffer(&info, &data);

        // Assert
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_binary_snapshot!("complex_data_should_be_correct.xlsx", result);
    }

    fn create_excel_info() -> ExcelInfo {
        let name = "Pokemon";
        let sheet_name = "FireRed Pokédex";
        let author = "senlinz";
        let create_time = "2024-11-01T08:00:00";
        let columns = vec![
            ExcelColumnInfo::new("number", "Number"),
            ExcelColumnInfo::new("type", "Type"),
            ExcelColumnInfo::new("first_type", "First").with_parent("type"),
            ExcelColumnInfo::new("second_type", "Second").with_parent("type"),
            ExcelColumnInfo::new("abilities", "Abilities"),
            ExcelColumnInfo::new("base_stats", "Base Stats"),
            ExcelColumnInfo::new("hp", "HP")
                .with_data_type("number")
                .with_parent("base_stats")
                .with_data_type("number"),
            ExcelColumnInfo::new("attack", "Attack")
                .with_data_type("number")
                .with_parent("base_stats")
                .with_data_type("number"),
            ExcelColumnInfo::new("defense", "Defense")
                .with_data_type("number")
                .with_parent("base_stats")
                .with_data_type("number"),
            ExcelColumnInfo::new("sp_attack", "Sp. Atk")
                .with_data_type("number")
                .with_parent("base_stats")
                .with_data_type("number"),
            ExcelColumnInfo::new("sp_defense", "Sp. Def")
                .with_data_type("number")
                .with_parent("base_stats")
                .with_data_type("number"),
            ExcelColumnInfo::new("speed", "Speed")
                .with_data_type("number")
                .with_parent("base_stats")
                .with_data_type("number"),
            ExcelColumnInfo::new("total", "Total")
                .with_data_type("number")
                .with_parent("base_stats"),
            ExcelColumnInfo::new("evolution", "Evolution"),
            ExcelColumnInfo::new("evolution_method", "Method").with_parent("evolution"),
            ExcelColumnInfo::new("evolution_next", "Next").with_parent("evolution"),
            ExcelColumnInfo::new("moves", "Moves"),
            ExcelColumnInfo::new("moves_by", "By").with_parent("moves"),
            ExcelColumnInfo::new("moves_lv", "LV/TM/HM")
                .with_parent("moves")
                .with_data_type("number"),
            ExcelColumnInfo::new("moves_move", "Move.")
                .with_parent("moves")
                .with_width(16.0),
            ExcelColumnInfo::new("moves_type", "Type.").with_parent("moves"),
            ExcelColumnInfo::new("moves_cat", "Cat.").with_parent("moves"),
            ExcelColumnInfo::new("moves_power", "Power.").with_parent("moves"),
            ExcelColumnInfo::new("moves_acc", "Acc.").with_parent("moves"),
        ];
        excel_info::ExcelInfo::new(name, sheet_name, columns, author, create_time)
            .with_default_row_height(30.0)
            .with_title(sheet_name)
            .with_title_height(50.0)
            .with_title_format(
                ExcelCellFormat::new()
                    .with_bold(true)
                    .with_color("#00FF00")
                    .with_font_size(20.0)
                    .with_align("center")
                    .with_align_vertical("center")
                    .with_border_color("#0000FF"),
            )
    }

    fn create_export_data() -> excel_data::ExcelData {
        return excel_data::ExcelData {
            rows: vec![create_bulbasaur()],
        };
    }

    fn create_bulbasaur() -> ExcelRowData {
        let level_moves = ExcelRowData::new(vec![ExcelColumnData::new("moves_by", "level")
            .with_children(vec![
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
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "15"),
                    ExcelColumnData::new("moves_move", "PoisonPowder"),
                    ExcelColumnData::new("moves_type", "Poison"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "-"),
                    ExcelColumnData::new("moves_acc", "75"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "15"),
                    ExcelColumnData::new("moves_move", "Sleep Powder"),
                    ExcelColumnData::new("moves_type", "Grass"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "-"),
                    ExcelColumnData::new("moves_acc", "75"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "20"),
                    ExcelColumnData::new("moves_move", "Razor Leaf"),
                    ExcelColumnData::new("moves_type", "Grass"),
                    ExcelColumnData::new("moves_cat", "Special"),
                    ExcelColumnData::new("moves_power", "55"),
                    ExcelColumnData::new("moves_acc", "95"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "25"),
                    ExcelColumnData::new("moves_move", "Sweet Scent"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "-"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "32"),
                    ExcelColumnData::new("moves_move", "Growth"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "-"),
                    ExcelColumnData::new("moves_acc", "-"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "39"),
                    ExcelColumnData::new("moves_move", "Synthesis"),
                    ExcelColumnData::new("moves_type", "Grass"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "-"),
                    ExcelColumnData::new("moves_acc", "-"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "46"),
                    ExcelColumnData::new("moves_move", "SolarBeam"),
                    ExcelColumnData::new("moves_type", "Grass"),
                    ExcelColumnData::new("moves_cat", "Special"),
                    ExcelColumnData::new("moves_power", "120"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
            ])]);
        let egg_moves = ExcelRowData::new(vec![ExcelColumnData::new("moves_by", "egg")
            .with_children(vec![
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
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_move", "Petal Dance"),
                    ExcelColumnData::new("moves_type", "Grass"),
                    ExcelColumnData::new("moves_cat", "Special"),
                    ExcelColumnData::new("moves_power", "70"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_move", "Skull Bash"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Physical"),
                    ExcelColumnData::new("moves_power", "100"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
            ])]);
        let hm_moves = ExcelRowData::new(vec![ExcelColumnData::new("moves_by", "HM")
            .with_children(vec![
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "01"),
                    ExcelColumnData::new("moves_move", "Cut"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Physical"),
                    ExcelColumnData::new("moves_power", "50"),
                    ExcelColumnData::new("moves_acc", "95"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "04"),
                    ExcelColumnData::new("moves_move", "Strength"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Physical"),
                    ExcelColumnData::new("moves_power", "80"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "05"),
                    ExcelColumnData::new("moves_move", "Flash"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "—"),
                    ExcelColumnData::new("moves_acc", "70"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "06"),
                    ExcelColumnData::new("moves_move", "Rock Smash"),
                    ExcelColumnData::new("moves_type", "Fighting"),
                    ExcelColumnData::new("moves_cat", "Physical"),
                    ExcelColumnData::new("moves_power", "20"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
            ])]);
        let tm_moves = ExcelRowData::new(vec![ExcelColumnData::new("moves_by", "TM")
            .with_children(vec![
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "06"),
                    ExcelColumnData::new("moves_move", "Toxic"),
                    ExcelColumnData::new("moves_type", "Poison"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "—"),
                    ExcelColumnData::new("moves_acc", "85"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "09"),
                    ExcelColumnData::new("moves_move", "Bullet Seed"),
                    ExcelColumnData::new("moves_type", "Grass"),
                    ExcelColumnData::new("moves_cat", "Special"),
                    ExcelColumnData::new("moves_power", "10"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "10"),
                    ExcelColumnData::new("moves_move", "Hidden Power"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Physical"),
                    ExcelColumnData::new("moves_power", "60"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "11"),
                    ExcelColumnData::new("moves_move", "Sunny Day"),
                    ExcelColumnData::new("moves_type", "Fire"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "—"),
                    ExcelColumnData::new("moves_acc", "—"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "17"),
                    ExcelColumnData::new("moves_move", "Protect"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "—"),
                    ExcelColumnData::new("moves_acc", "—"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "19"),
                    ExcelColumnData::new("moves_move", "Giga Drain"),
                    ExcelColumnData::new("moves_type", "Grass"),
                    ExcelColumnData::new("moves_cat", "Special"),
                    ExcelColumnData::new("moves_power", "60"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "21"),
                    ExcelColumnData::new("moves_move", "Frustration"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Physical"),
                    ExcelColumnData::new("moves_power", "—"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "22"),
                    ExcelColumnData::new("moves_move", "SolarBeam"),
                    ExcelColumnData::new("moves_type", "Grass"),
                    ExcelColumnData::new("moves_cat", "Special"),
                    ExcelColumnData::new("moves_power", "120"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "27"),
                    ExcelColumnData::new("moves_move", "Return"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Physical"),
                    ExcelColumnData::new("moves_power", "—"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "32"),
                    ExcelColumnData::new("moves_move", "Double Team"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "—"),
                    ExcelColumnData::new("moves_acc", "—"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "36"),
                    ExcelColumnData::new("moves_move", "Sludge Bomb"),
                    ExcelColumnData::new("moves_type", "Poison"),
                    ExcelColumnData::new("moves_cat", "Physical"),
                    ExcelColumnData::new("moves_power", "90"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "42"),
                    ExcelColumnData::new("moves_move", "Facade"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Physical"),
                    ExcelColumnData::new("moves_power", "70"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "43"),
                    ExcelColumnData::new("moves_move", "Secret Power"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Physical"),
                    ExcelColumnData::new("moves_power", "70"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "44"),
                    ExcelColumnData::new("moves_move", "Rest"),
                    ExcelColumnData::new("moves_type", "Psychic"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "—"),
                    ExcelColumnData::new("moves_acc", "—"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("moves_lv", "45"),
                    ExcelColumnData::new("moves_move", "Attract"),
                    ExcelColumnData::new("moves_type", "Normal"),
                    ExcelColumnData::new("moves_cat", "Status"),
                    ExcelColumnData::new("moves_power", "—"),
                    ExcelColumnData::new("moves_acc", "100"),
                ]),
            ])]);

        ExcelRowData::new(vec![
            ExcelColumnData::new("number", "#001"),
            ExcelColumnData::new("first_type", "Grass"),
            ExcelColumnData::new("second_type", "Poison"),
            ExcelColumnData::new_root(vec![
                ExcelRowData::new(vec![ExcelColumnData::new("abilities", "Overgrow")]),
                ExcelRowData::new(vec![ExcelColumnData::new("abilities", "Chlorophyll")]),
            ]),
            ExcelColumnData::new("hp", "45"),
            ExcelColumnData::new("attack", "49"),
            ExcelColumnData::new("defense", "49"),
            ExcelColumnData::new("sp_attack", "65"),
            ExcelColumnData::new("sp_defense", "65"),
            ExcelColumnData::new("speed", "45"),
            ExcelColumnData::new("total", "318"),
            ExcelColumnData::new_root(vec![
                ExcelRowData::new(vec![
                    ExcelColumnData::new("evolution_method", "Level 16"),
                    ExcelColumnData::new("evolution_next", "Ivysaur"),
                ]),
                ExcelRowData::new(vec![
                    ExcelColumnData::new("evolution_method", "Level 32"),
                    ExcelColumnData::new("evolution_next", "Venusaur"),
                ]),
            ]),
            ExcelColumnData::new_root(vec![level_moves, egg_moves, hm_moves, tm_moves]),
        ])
    }
}
