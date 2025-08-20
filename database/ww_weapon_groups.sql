CREATE TABLE ww_weapon_groups (
    weapon_id INT UNSIGNED NOT NULL,
    group_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (weapon_id, group_id),
    FOREIGN KEY (weapon_id) REFERENCES ww_weapons(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES ww_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
