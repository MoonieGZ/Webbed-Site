CREATE TABLE ww_weapons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    weapon_type ENUM('Pistol','Sword','Broadblade','Rectifier','Gauntlets') NOT NULL,
    rarity TINYINT NOT NULL,
    UNIQUE KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
