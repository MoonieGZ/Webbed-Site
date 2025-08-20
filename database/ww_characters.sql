CREATE TABLE ww_characters (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    element ENUM('Aero','Glacio','Havoc','Fusion','Spectro','Electro','Unknown') NOT NULL,
    weapon_type ENUM('Pistol','Sword','Broadblade','Rectifier','Gauntlets','Unknown') NOT NULL,
    rarity TINYINT NOT NULL,
    UNIQUE KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
