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
 * @typedef {Guest} User
 */

/**
 * @typedef {object} Guest
 * @property {Session} session
 * @property {number} hp
 * @property {number} xp
 * @property {number} gold
 * @property {Class} class_
 * @property {Monster[]} monsters
 */

/**
 * @typedef {object} Session
 * @property {string} id
 * @property {number} created - The result of Date.now() when the session was created.
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
 * @property {Schedule} schedule
 * @property {string} periodNumber
 * @property {FrequencyUnit} periodUnit
 * @property {number | null} deadline // In milliseconds; null if periodNumber is invalid.
 */

/**
 * @typedef {{ periodic: true } | { periodic: false, missedDeadline: boolean }} Schedule
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
 * @param {any} monsterKind 
 * @returns {monsterKind is MonsterKind}
 */
export function isMonsterKind(monsterKind) {
  return monsterKinds.includes(monsterKind);
}

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
 * @param {any} unit 
 * @returns {unit is FrequencyUnit}
 */
export function isFrequencyUnit(unit) {
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
    isSchedule(monster.schedule) &&
    typeof monster?.periodNumber === "string" &&
    isPeriodUnit(monster?.periodUnit) &&
    (typeof monster?.deadline === "number" || monster?.deadline === null)
  );
}

/**
 * 
 * @param {any} schedule 
 * @returns {schedule is Schedule}
 */
export function isSchedule(schedule) {
  return (
    schedule?.periodic === false ||
    (schedule?.periodic === true && typeof schedule?.missedDeadline === "boolean")
  );
}

/**
 * 
 * @param {any} unit 
 * @returns {unit is FrequencyUnit}
 */
export function isPeriodUnit(unit) {
  return frequencyUnits.includes(unit);
}