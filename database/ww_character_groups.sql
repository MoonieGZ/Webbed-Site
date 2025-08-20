CREATE TABLE ww_character_groups (
    character_id INT UNSIGNED NOT NULL,
    group_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (character_id, group_id),
    FOREIGN KEY (character_id) REFERENCES ww_characters(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES ww_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;