CREATE TABLE ww_character_materials (
    character_id INT UNSIGNED NOT NULL,
    material_id INT UNSIGNED NOT NULL,
    type ENUM('weekly_boss','boss_drop','collectible') NOT NULL,
    PRIMARY KEY (character_id, type),
    FOREIGN KEY (character_id) REFERENCES ww_characters(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES ww_materials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


