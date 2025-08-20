CREATE TABLE ww_group_items (
    group_id INT UNSIGNED NOT NULL,
    material_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (group_id, material_id),
    FOREIGN KEY (group_id) REFERENCES ww_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES ww_materials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
