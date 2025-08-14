CREATE TABLE `gi_characters` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `element` enum('Anemo','Geo','Electro','Dendro','Hydro','Pyro','Cryo') NOT NULL,
  `five_star` tinyint(1) NOT NULL DEFAULT 0,
  `weapon_type` enum('Sword','Claymore','Polearm','Bow','Catalyst') NOT NULL,
  `origin` enum('Mondstadt','Liyue','Inazuma','Sumeru','Fontaine','Natlan','Snezhnaya','Nod-Krai','Other') NOT NULL,
  `version` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!80021 ALTER TABLE `gi_characters` ADD UNIQUE INDEX IF NOT EXISTS `unique_name` (`name`) */;
