-- Seed talent_upgrade groups and map them to weapons by type

-- Create groups if they don't exist
INSERT IGNORE INTO ww_groups (name, type) VALUES
  ('Metallic Drip', 'talent_upgrade'),
  ('Waveworn Residue', 'talent_upgrade'),
  ('Cadence', 'talent_upgrade'),
  ('Helix', 'talent_upgrade'),
  ('Phlogiston', 'talent_upgrade');

-- Map Sword -> Metallic Drip
INSERT IGNORE INTO ww_weapon_groups (weapon_id, group_id)
SELECT w.id, g.id
  FROM ww_weapons w
  JOIN ww_groups g ON g.name = 'Metallic Drip' AND g.type = 'talent_upgrade'
 WHERE w.weapon_type = 'Sword';

-- Map Broadblade -> Waveworn Residue
INSERT IGNORE INTO ww_weapon_groups (weapon_id, group_id)
SELECT w.id, g.id
  FROM ww_weapons w
  JOIN ww_groups g ON g.name = 'Waveworn Residue' AND g.type = 'talent_upgrade'
 WHERE w.weapon_type = 'Broadblade';

-- Map Gauntlets -> Cadence
INSERT IGNORE INTO ww_weapon_groups (weapon_id, group_id)
SELECT w.id, g.id
  FROM ww_weapons w
  JOIN ww_groups g ON g.name = 'Cadence' AND g.type = 'talent_upgrade'
 WHERE w.weapon_type = 'Gauntlets';

-- Map Rectifier -> Helix
INSERT IGNORE INTO ww_weapon_groups (weapon_id, group_id)
SELECT w.id, g.id
  FROM ww_weapons w
  JOIN ww_groups g ON g.name = 'Helix' AND g.type = 'talent_upgrade'
 WHERE w.weapon_type = 'Rectifier';

-- Map Pistols -> Phlogiston
INSERT IGNORE INTO ww_weapon_groups (weapon_id, group_id)
SELECT w.id, g.id
  FROM ww_weapons w
  JOIN ww_groups g ON g.name = 'Phlogiston' AND g.type = 'talent_upgrade'
 WHERE w.weapon_type = 'Pistols';

-- Also assign characters to the corresponding talent_upgrade group based on their weapon type

-- Sword -> Metallic Drip
INSERT IGNORE INTO ww_character_groups (character_id, group_id)
SELECT c.id, g.id
  FROM ww_characters c
  JOIN ww_groups g ON g.name = 'Metallic Drip' AND g.type = 'talent_upgrade'
 WHERE c.weapon_type = 'Sword';

-- Broadblade -> Waveworn Residue
INSERT IGNORE INTO ww_character_groups (character_id, group_id)
SELECT c.id, g.id
  FROM ww_characters c
  JOIN ww_groups g ON g.name = 'Waveworn Residue' AND g.type = 'talent_upgrade'
 WHERE c.weapon_type = 'Broadblade';

-- Gauntlets -> Cadence
INSERT IGNORE INTO ww_character_groups (character_id, group_id)
SELECT c.id, g.id
  FROM ww_characters c
  JOIN ww_groups g ON g.name = 'Cadence' AND g.type = 'talent_upgrade'
 WHERE c.weapon_type = 'Gauntlets';

-- Rectifier -> Helix
INSERT IGNORE INTO ww_character_groups (character_id, group_id)
SELECT c.id, g.id
  FROM ww_characters c
  JOIN ww_groups g ON g.name = 'Helix' AND g.type = 'talent_upgrade'
 WHERE c.weapon_type = 'Rectifier';

-- Pistols -> Phlogiston
INSERT IGNORE INTO ww_character_groups (character_id, group_id)
SELECT c.id, g.id
  FROM ww_characters c
  JOIN ww_groups g ON g.name = 'Phlogiston' AND g.type = 'talent_upgrade'
 WHERE c.weapon_type = 'Pistols';

-- ============================
-- Weapon Upgrade Groups by Weapon Type (enemy_drop)
-- ============================

-- Ensure enemy_drop groups exist
INSERT IGNORE INTO ww_groups (name, type) VALUES
  ('Whisperin Core', 'enemy_drop'),
  ('Howler Core', 'enemy_drop'),
  ('Rings', 'enemy_drop');

-- Broadblades -> Whisperin Core
INSERT IGNORE INTO ww_weapon_groups (weapon_id, group_id)
SELECT w.id, g.id
  FROM ww_weapons w
  JOIN ww_groups g ON g.name = 'Whisperin Core' AND g.type = 'enemy_drop'
 WHERE w.weapon_type = 'Broadblade';

-- Gauntlets & Swords -> Howler Core
INSERT IGNORE INTO ww_weapon_groups (weapon_id, group_id)
SELECT w.id, g.id
  FROM ww_weapons w
  JOIN ww_groups g ON g.name = 'Howler Core' AND g.type = 'enemy_drop'
 WHERE w.weapon_type IN ('Gauntlets','Sword');

-- Pistols & Rectifiers -> Rings
INSERT IGNORE INTO ww_weapon_groups (weapon_id, group_id)
SELECT w.id, g.id
  FROM ww_weapons w
  JOIN ww_groups g ON g.name = 'Rings' AND g.type = 'enemy_drop'
 WHERE w.weapon_type IN ('Pistol','Rectifier');


