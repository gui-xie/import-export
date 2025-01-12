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
            rows: vec![excel_data::ExcelRowData {
                // 1	Tackle	Normal	Physical 	35 	95
                // 4	Growl	Normal	Status 	— 	100
                // 7	Leech Seed	Grass	Status 	— 	90
                // 10	Vine Whip	Grass	Special 	35 	100
                // 15	PoisonPowder	Poison	Status 	— 	75
                // 15	Sleep Powder	Grass	Status 	— 	75
                // 20	Razor Leaf	Grass	Special 	55 	95
                // 25	Sweet Scent	Normal	Status 	— 	100
                // 32	Growth	Normal	Status 	— 	—
                // 39	Synthesis	Grass	Status 	— 	—
                // 46	SolarBeam	Grass	Special 	120 	100

                // Acc.
                // 01	Cut	Normal	Physical 	50 	95
                // 04	Strength	Normal	Physical 	80 	100
                // 05	Flash	Normal	Status 	— 	70
                // 06	Rock Smash	Fighting	Physical 	20 	100

                //                     Egg moves

                // Bulbasaur learns the following moves via breeding in Pokémon FireRed & LeafGreen. Details and compatible parents can be found below.
                // Move

                // Type

                // Cat.

                // Power

                // Acc.
                // Charm	Normal	Status 	— 	100
                // Curse	???	Status 	— 	—
                // GrassWhistle	Grass	Status 	— 	55
                // Light Screen	Psychic	Status 	— 	—
                // Magical Leaf	Grass	Special 	60 	∞
                // Petal Dance	Grass	Special 	70 	100
                // Safeguard	Normal	Status 	— 	—
                // Skull Bash	Normal	Physical 	100 	100

                // Move Tutor moves

                // Bulbasaur can be taught these attacks in Pokémon FireRed & LeafGreen from move tutors (details):
                // Move

                // Type

                // Cat.

                // Power

                // Acc.
                // Body Slam	Normal	Physical 	85 	100
                // Double-Edge	Normal	Physical 	120 	100
                // Mimic	Normal	Status 	— 	—
                // Substitute	Normal	Status 	— 	—
                // Swords Dance	Normal	Status 	— 	—

                //                     Moves learnt by HM

                // Bulbasaur is compatible with these Hidden Machines in Pokémon FireRed & LeafGreen:
                // HM

                // Move

                // Type

                // Cat.

                // Power

                // Acc.
                // 01	Cut	Normal	Physical 	50 	95
                // 04	Strength	Normal	Physical 	80 	100
                // 05	Flash	Normal	Status 	— 	70
                // 06	Rock Smash	Fighting	Physical 	20 	100

                // Moves learnt by TM

                // Bulbasaur is compatible with these Technical Machines in Pokémon FireRed & LeafGreen:
                // TM

                // Move

                // Type

                // Cat.

                // Power

                // Acc.
                // 06	Toxic	Poison	Status 	— 	85
                // 09	Bullet Seed	Grass	Special 	10 	100
                // 10	Hidden Power	Normal	Physical 	60 	100
                // 11	Sunny Day	Fire	Status 	— 	—
                // 17	Protect	Normal	Status 	— 	—
                // 19	Giga Drain	Grass	Special 	60 	100
                // 21	Frustration	Normal	Physical 	— 	100
                // 22	SolarBeam	Grass	Special 	120 	100
                // 27	Return	Normal	Physical 	— 	100
                // 32	Double Team	Normal	Status 	— 	—
                // 36	Sludge Bomb	Poison	Physical 	90 	100
                // 42	Facade	Normal	Physical 	70 	100
                // 43	Secret Power	Normal	Physical 	70 	100
                // 44	Rest	Psychic	Status 	— 	—
                // 45	Attract	Normal	Status 	— 	100
                columns: vec![
                    excel_data::ExcelColumnData::new("number".into(), "#001".into()),
                    excel_data::ExcelColumnData::new("name".into(), "Bulbasaur".into()),
                    excel_data::ExcelColumnData::new("first_type".into(), "Grass".into()),
                    excel_data::ExcelColumnData::new("second_type".into(), "Poison".into()),
                    excel_data::ExcelColumnData::new("abilities".into(), "Overgrow".into()),
                    excel_data::ExcelColumnData::new(
                        "abilities".into(),
                        "Chlorophyll (hidden ability)".into(),
                    ),
                    excel_data::ExcelColumnData::new("hp".into(), "45".into()),
                    excel_data::ExcelColumnData::new("attack".into(), "49".into()),
                    excel_data::ExcelColumnData::new("defense".into(), "49".into()),
                    excel_data::ExcelColumnData::new("sp_attack".into(), "65".into()),
                    excel_data::ExcelColumnData::new("sp_defense".into(), "65".into()),
                    excel_data::ExcelColumnData::new("speed".into(), "45".into()),
                    excel_data::ExcelColumnData::new("total".into(), "318".into()),
                    excel_data::ExcelColumnData::new("evolution".into(), "I".into()),
                    excel_data::ExcelColumnData::new("evolution_method".into(), "Level 16".into()),
                    excel_data::ExcelColumnData::new("evolution_condition".into(), "—".into()),
                    excel_data::ExcelColumnData::new("evolution_next".into(), "Ivysaur".into()),
                    excel_data::ExcelColumnData::new("moves".into(), "Tackle".into()),
                    excel_data::ExcelColumnData::new("moves_by_level".into(), "01".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_lv".into(), "01".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_move".into(), "Tackle".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_type".into(), "Normal".into()),
                    excel_data::ExcelColumnData::new(
                        "moves_by_level_cat".into(),
                        "Physical".into(),
                    ),
                    excel_data::ExcelColumnData::new("moves_by_level_power".into(), "35".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_acc".into(), "95".into()),
                    excel_data::ExcelColumnData::new("moves_by_level".into(), "04".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_lv".into(), "04".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_move".into(), "Growl".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_type".into(), "Normal".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_cat".into(), "Status".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_power".into(), "—".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_acc".into(), "100".into()),
                    excel_data::ExcelColumnData::new("moves_by_level".into(), "07".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_lv".into(), "07".into()),
                    excel_data::ExcelColumnData::new(
                        "moves_by_level_move".into(),
                        "Leech Seed".into(),
                    ),
                    excel_data::ExcelColumnData::new("moves_by_level_type".into(), "Grass".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_cat".into(), "Status".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_power".into(), "—".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_acc".into(), "90".into()),
                    excel_data::ExcelColumnData::new("moves_by_level".into(), "10".into()),
                    excel_data::ExcelColumnData::new("moves_by_level_lv".into(), "10".into()),
                ],
            }],
        }
    }

    fn create_excel_info() -> excel_info::ExcelInfo {
        let name = "Pokemon";
        let sheet_name = "FireRed & LeafGreen Pokédex";
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
            excel_info::ExcelColumnInfo::new("evolution_method".into(), "Method".into()),
            excel_info::ExcelColumnInfo::new("evolution_condition".into(), "Condition".into()),
            excel_info::ExcelColumnInfo::new("evolution_next".into(), "Next".into()),
            excel_info::ExcelColumnInfo::new("moves".into(), "Moves".into()),
            excel_info::ExcelColumnInfo::new("moves_by".into(), "By".into())
                .with_parent("moves".into()),
            excel_info::ExcelColumnInfo::new("moves_by_level_lv".into(), "LV.".into())
                .with_parent("moves_by_level".into()),
            excel_info::ExcelColumnInfo::new("moves_by_level_move".into(), "Move.".into())
                .with_parent("moves_by_level".into()),
            excel_info::ExcelColumnInfo::new("moves_by_level_type".into(), "Type.".into())
                .with_parent("moves_by_level".into()),
            excel_info::ExcelColumnInfo::new("moves_by_level_cat".into(), "Cat.".into())
                .with_parent("moves_by_level".into()),
            excel_info::ExcelColumnInfo::new("moves_by_level_power".into(), "Power.".into())
                .with_parent("moves_by_level".into()),
            excel_info::ExcelColumnInfo::new("moves_by_level_acc".into(), "Acc.".into())
                .with_parent("moves_by_level".into()),
            excel_info::ExcelColumnInfo::new("moves_by_egg".into(), "Egg".into())
                .with_parent("moves".into()),
            excel_info::ExcelColumnInfo::new("moves_by_egg_move".into(), "Move.".into())
                .with_parent("moves_by_egg".into()),
            excel_info::ExcelColumnInfo::new("moves_by_egg_type".into(), "Type.".into())
                .with_parent("moves_by_egg".into()),
            excel_info::ExcelColumnInfo::new("moves_by_egg_cat".into(), "Cat.".into())
                .with_parent("moves_by_egg".into()),
            excel_info::ExcelColumnInfo::new("moves_by_egg_power".into(), "Power.".into())
                .with_parent("moves_by_egg".into()),
            excel_info::ExcelColumnInfo::new("moves_by_egg_acc".into(), "Acc.".into())
                .with_parent("moves_by_egg".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tutor".into(), "Tutor".into())
                .with_parent("moves".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tutor_move".into(), "Move.".into())
                .with_parent("moves_by_tutor".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tutor_type".into(), "Type.".into())
                .with_parent("moves_by_tutor".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tutor_cat".into(), "Cat.".into())
                .with_parent("moves_by_tutor".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tutor_power".into(), "Power.".into())
                .with_parent("moves_by_tutor".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tutor_acc".into(), "Acc.".into())
                .with_parent("moves_by_tutor".into()),
            excel_info::ExcelColumnInfo::new("moves_by_hm".into(), "HM".into())
                .with_parent("moves".into()),
            excel_info::ExcelColumnInfo::new("moves_by_hm_move".into(), "Move.".into())
                .with_parent("moves_by_hm".into()),
            excel_info::ExcelColumnInfo::new("moves_by_hm_type".into(), "Type.".into())
                .with_parent("moves_by_hm".into()),
            excel_info::ExcelColumnInfo::new("moves_by_hm_cat".into(), "Cat.".into())
                .with_parent("moves_by_hm".into()),
            excel_info::ExcelColumnInfo::new("moves_by_hm_power".into(), "Power.".into())
                .with_parent("moves_by_hm".into()),
            excel_info::ExcelColumnInfo::new("moves_by_hm_acc".into(), "Acc.".into())
                .with_parent("moves_by_hm".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tm".into(), "TM".into())
                .with_parent("moves".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tm_move".into(), "Move.".into())
                .with_parent("moves_by_tm".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tm_type".into(), "Type.".into())
                .with_parent("moves_by_tm".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tm_cat".into(), "Cat.".into())
                .with_parent("moves_by_tm".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tm_power".into(), "Power.".into())
                .with_parent("moves_by_tm".into()),
            excel_info::ExcelColumnInfo::new("moves_by_tm_acc".into(), "Acc.".into())
                .with_parent("moves_by_tm".into()),
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
}
