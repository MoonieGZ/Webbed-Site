export const ASCENSION_TEMPLATES = {
  CHARACTER: [
    { level: 20, ascension: 1, boss_drop: 0, enemy_drop: [4, 0, 0, 0], specialty: 0, credits: 5000 },
    { level: 40, ascension: 2, boss_drop: 3, enemy_drop: [0, 4, 0, 0], specialty: 4, credits: 10000 },
    { level: 50, ascension: 3, boss_drop: 6, enemy_drop: [0, 8, 0, 0], specialty: 8, credits: 15000 },
    { level: 60, ascension: 4, boss_drop: 9, enemy_drop: [0, 0, 4, 0], specialty: 12, credits: 20000 },
    { level: 70, ascension: 5, boss_drop: 12, enemy_drop: [0, 0, 8, 0], specialty: 16, credits: 40000 },
    { level: 80, ascension: 6, boss_drop: 16, enemy_drop: [0, 0, 0, 4], specialty: 20, credits: 80000 }
  ],

  WEAPON_5: [
    { level: 20, ascension: 1, talent_upgrade: [0, 0, 0, 0], enemy_drop: [6, 0, 0, 0], credits: 10000 },
    { level: 40, ascension: 2, talent_upgrade: [6, 0, 0, 0], enemy_drop: [0, 6, 0, 0], credits: 20000 },
    { level: 50, ascension: 3, talent_upgrade: [0, 8, 0, 0], enemy_drop: [0, 0, 4, 0], credits: 40000 },
    { level: 60, ascension: 4, talent_upgrade: [0, 0, 6, 0], enemy_drop: [0, 0, 6, 0], credits: 60000 },
    { level: 70, ascension: 5, talent_upgrade: [0, 0, 0, 8], enemy_drop: [0, 0, 0, 4], credits: 80000 },
    { level: 80, ascension: 6, talent_upgrade: [0, 0, 0, 12], enemy_drop: [0, 0, 0, 8], credits: 120000 },
  ],

  WEAPON_4: [
    { level: 20, ascension: 1, talent_upgrade: [0, 0, 0, 0], enemy_drop: [5, 0, 0, 0], credits: 8000 },
    { level: 40, ascension: 2, talent_upgrade: [5, 0, 0, 0], enemy_drop: [0, 5, 0, 0], credits: 16000 },
    { level: 50, ascension: 3, talent_upgrade: [0, 7, 0, 0], enemy_drop: [0, 0, 4, 0], credits: 32000 },
    { level: 60, ascension: 4, talent_upgrade: [0, 0, 5, 0], enemy_drop: [0, 0, 5, 0], credits: 48000 },
    { level: 70, ascension: 5, talent_upgrade: [0, 0, 0, 7], enemy_drop: [0, 0, 0, 4], credits: 64000 },
    { level: 80, ascension: 6, talent_upgrade: [0, 0, 0, 10], enemy_drop: [0, 0, 0, 7], credits: 96000 },
  ],
};

export const EXP_TEMPLATES = {
  CHARACTER: [
    { level: 20, exp: 33300, credits: 11655 },
    { level: 40, exp: 175500, credits: 61425 },
    { level: 50, exp: 188300, credits: 65905 },
    { level: 60, exp: 286600, credits: 100310 },
    { level: 70, exp: 413000, credits: 144550 },
    { level: 80, exp: 572400, credits: 200340 },
    { level: 90, exp: 768900, credits: 269115 }
  ],

  WEAPON_5_STAR: [
    { level: 20, exp: 38700, credits: 15480 },
    { level: 40, exp: 187400, credits: 74690 },
    { level: 50, exp: 199900, credits: 79960 },
    { level: 60, exp: 302400, credits: 120960 },
    { level: 70, exp: 432100, credits: 172840 },
    { level: 80, exp: 590700, credits: 236280 },
    { level: 90, exp: 941200, credits: 376480 }
  ],

  WEAPON_4_STAR: [
    { level: 20, exp: 36900, credits: 14760 },
    { level: 40, exp: 150800, credits: 60320 },
    { level: 50, exp: 150800, credits: 60320 },
    { level: 60, exp: 227900, credits: 91160 },
    { level: 70, exp: 333600, credits: 133440 },
    { level: 80, exp: 474800, credits: 189920 },
    { level: 90, exp: 914400, credits: 365760 }
  ]
};

export const SKILL_TEMPLATES = {
  SKILL: [
    { level: 2, talent_upgrade: [2, 0, 0, 0], enemy_drop: [2, 0, 0, 0], weekly_boss: 0, credits: 1500 },
    { level: 3, talent_upgrade: [3, 0, 0, 0], enemy_drop: [3, 0, 0, 0], weekly_boss: 0, credits: 2000 },
    { level: 4, talent_upgrade: [0, 2, 0, 0], enemy_drop: [0, 2, 0, 0], weekly_boss: 0, credits: 4500 },
    { level: 5, talent_upgrade: [0, 3, 0, 0], enemy_drop: [0, 3, 0, 0], weekly_boss: 0, credits: 6000 },
    { level: 6, talent_upgrade: [0, 0, 3, 0], enemy_drop: [0, 0, 2, 0], weekly_boss: 0, credits: 16000 },
    { level: 7, talent_upgrade: [0, 0, 5, 0], enemy_drop: [0, 0, 3, 0], weekly_boss: 1, credits: 30000 },
    { level: 8, talent_upgrade: [0, 0, 0, 2], enemy_drop: [0, 0, 0, 2], weekly_boss: 1, credits: 50000 },
    { level: 9, talent_upgrade: [0, 0, 0, 3], enemy_drop: [0, 0, 0, 3], weekly_boss: 1, credits: 70000 },
    { level: 10, talent_upgrade: [0, 0, 0, 6], enemy_drop: [0, 0, 0, 4], weekly_boss: 1, credits: 100000 }
  ],

  STAT_NODE: [
    {level: 1, talent_upgrade: [0, 0, 3, 0], enemy_drop: [0, 0, 3, 0], weekly_boss: 0, credits: 50000},
    {level: 2, talent_upgrade: [0, 0, 0, 3], enemy_drop: [0, 0, 0, 3], weekly_boss: 1, credits: 100000}
  ],

  INHERENT: [
    {level: 1, talent_upgrade: [0, 3, 0, 0], enemy_drop: [0, 3, 0, 0], weekly_boss: 1, credits: 10000},
    {level: 2, talent_upgrade: [0, 0, 3, 0], enemy_drop: [0, 0, 3, 0], weekly_boss: 1, credits: 20000}
  ]
};