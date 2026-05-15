/**
 * @typedef {object} Profile
 * @property {string} displayName
 * @property {number} hp
 * @property {number} xp
 * @property {number} gold
 * @property {Class} class_
 * @property {Monster[]} monsters
 */

/**
 * @typedef {classes[number]} Class
 */

/**
 * @typedef {object} Monster
 * @property {number} id
 * @property {string} taskName
 * @property {MonsterKind} kind
 * @property {string} task
 * @property {Level} level
 * @property {number} currentHp
 * @property {number} maxHp
 * @property {boolean} periodic
 * @property {string} periodNumber
 * @property {FrequencyUnit} periodUnit
 * @property {number | null} deadline // In milliseconds; null if periodNumber is invalid.
 */

/**
 * @typedef {frequencyUnits[number]} FrequencyUnit
 */

/**
 * 
 * @typedef {monsterKinds[number]} MonsterKind 
 */

/**
 * @typedef {number | "boss"} Level
 */

/**
 * @exports {User}
 */

const classes = /** @type {const} */ (["Warrior", "Scholar", "Bard", "Monk"]);

export const monsterKinds = /** @type {const} */ ([
  "Demon",
  "Dragon",
  "Cyclops",
  "Goblin",
  "Golem",
  "Gorgon",
  "Hydra",
  "Kraken",
  "Mummy",
  "Serpent",
  "Skeleton",
  "Vampire",
  "Werewolf",
  "Witch",
  "Wraith",
  "Zombie",
]);

/** @type {Class} */
export const defaultClass = classes[0];

export const frequencyUnits = /** @type {const} */ ([
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "year",
]);

/**
 * 
 * @param {any} class_ 
 * @returns {class_ is Class}
 */
export function isClass(class_) {
  return classes.includes(class_);
}

/**
 * 
 * @param {any} level 
 * @returns {level is Class}
 */
export function isLevel(level) {
  return typeof level === "number" || level === "boss";
}


/**
 * 
 * @param {Class} class_ 
 * @returns {Class}
 */
export function prevClass(class_) {
  const i = (classes.indexOf(class_) - 1 + 4) % classes.length;
  return classes[i];
}

/**
 * 
 * @param {Class} class_ 
 * @returns {Class}
 */
export function nextClass(class_) {
  const i = (classes.indexOf(class_) + 1) % classes.length;
  return classes[i];
}

/**
 * 
 * @returns {MonsterKind}
 */
export function randomMonsterKind() {
  const i = Math.floor(Math.random() * monsterKinds.length);
  return monsterKinds[i];
}


/**
 * @param {Monster} monster
 * @returns {string}
 */
export function monsterName(monster) {
  return `${monster.taskName} ${monster.kind}`;
}

/**
 * 
 * @param {any} monsterKind 
 * @returns {monsterKind is MonsterKind}
 */
export function isMonsterKind(monsterKind) {
  return monsterKinds.includes(monsterKind);
}

/**
 * 
 * @param {any} unit 
 * @returns {unit is FrequencyUnit}
 */
export function isPeriodUnit(unit) {
  return frequencyUnits.includes(unit);
}

/**
 * 
 * @param {any} monster 
 * @returns {monster is Monster}
 */
export function isMonster(monster) {
  return (
    typeof monster?.id === "number" &&
    typeof monster?.taskName === "string" &&
    isMonsterKind(monster?.kind) &&
    typeof monster?.task === "string" &&
    isLevel(monster?.level) &&
    typeof monster?.currentHp === "number" &&
    typeof monster?.maxHp === "number" &&
    typeof monster?.periodNumber === "string" &&
    isPeriodUnit(monster?.periodUnit) &&
    (typeof monster?.deadline === "number" || monster?.deadline === null)
  );
}

/**
 * 
 * @param {any} profile 
 * @returns {profile is Profile}
 */
export function isProfile(profile) {
  return (
    typeof profile?.displayName === "string" &&
    typeof profile?.hp === "number" &&
    typeof profile?.xp === "number" &&
    typeof profile?.gold === "number" &&
    isClass(profile?.class_) &&
    (Array.isArray(profile?.monsters) && profile.monsters.every(isMonster))
  );
}