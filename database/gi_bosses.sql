CREATE TABLE `gi_bosses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `location` enum('Mondstadt','Liyue','Inazuma','Sumeru','Fontaine','Natlan','Snezhnaya','Nod-Krai','Other') NOT NULL,
  `legendary` tinyint(1) NOT NULL DEFAULT 0,
  `coop` tinyint(1) NOT NULL DEFAULT 1,
  `wiki_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
