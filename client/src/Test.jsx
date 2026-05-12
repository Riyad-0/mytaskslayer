import { useContext, useEffect, useRef, useState } from "react";
import { post } from "./requests";
import { GuestIdContext } from "./GuestIdContext";
import dayjs from "dayjs";


/** @import { FrequencyUnit, Level } from "./types" */

/**
 * @typedef {object} Monster
 * @property {number} deadline // In milliseconds; null if frequencyMagnitude is invalid.
 * @property {number} count
 */

/**
 * @typedef {"hero" | "task" | "loading"} HomeMode
 */

/**
 * @typedef {(monsters: Monster[]) => void} SetMonsters
 */

/**
 * @typedef {(callback: ((monster: Monster) => Monster)) => void} UpdateMonster
 */

/**
 * 
 * @typedef {{
 *   list: Monster[]
 *   update: (callback: ((monsters: Monster[]) => Monster[])) => void
 * }} MonsterProps
 */

function Test() {
  return (
    <Timer />
  );
}

function Timer() {
  const initialDeadline = Date.now() + 5000;
  const [deadline, setDeadline] = useState(initialDeadline);
  const [initialTime, _] = useState(Date.now());
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    if (time === initialTime) {
      return;
    }
    if (time < deadline) {
      return;
    }
    console.log("deadline:", deadline);
    setDeadline(deadline + 5000);
  }, [time]);
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 67);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <></>
  );
}

/**
 * 
 * @param {{
 *   updateMonster: UpdateMonster
 * }} props 
 * @returns 
 */
function MonsterSection({ updateMonster }) {
  useEffect(() => {
    const interval = setInterval(() => {
      updateMonster(monster => {
        let changed = false;
        const deadline = monster.deadline;
        // if (monster.count === 1) return monster;
        if (Date.now() < deadline) return monster;
        changed = true;
        const newDeadline = deadline + 4000;
        console.log("chaneg", dayjs(deadline).format("mm:ss"), dayjs(newDeadline).format("mm:ss"), monster.count);
        return {
          ...monster,
          deadline: newDeadline,
          count: monster.count + 1,
        };
      });
    }, 67);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div>test</div>
  );
}


/**
 * 
 * @param {Monster} monster
 * @returns {boolean}
 */
function isTaskCompleted(monster) {
  if (monster.deadline === null) {
    return false;
  }
  const parsedMagnitude = parseFrequencyMagnitude(monster.frequencyMagnitude);
  if (parsedMagnitude === null) {
    return false;
  }
  return monster.deadline - Date.now() > getPeriod(parsedMagnitude, monster.frequencyUnit);
}

/**
 * 
 * @param {number} frequencyMagnitude
 * @param {FrequencyUnit} frequencyUnit
 * @returns {number}
 */
function getPeriod(frequencyMagnitude, frequencyUnit) {
  return dayjs().add(frequencyMagnitude, frequencyUnit).diff(dayjs()).valueOf();
}

/**
 * 
 * @param {string} frequencyMagnitude
 * @param {FrequencyUnit} frequencyUnit
 * @returns {number | null}
 */
function tryGetDeadline(frequencyMagnitude, frequencyUnit) {
  const deadline = tryGetDeadlineObj(frequencyMagnitude, frequencyUnit);
  if (deadline === null) {
    return null;
  }
  return deadline.valueOf();
}

/**
 * 
 * @param {string} frequencyMagnitude
 * @param {FrequencyUnit} frequencyUnit
 * @returns {dayjs.Dayjs | null}
 */
function tryGetDeadlineObj(frequencyMagnitude, frequencyUnit) {
  const parsedMagnitude = parseFrequencyMagnitude(frequencyMagnitude);
  if (parsedMagnitude === null) {
    return null;
  }
  return getDeadlineObj(parsedMagnitude, frequencyUnit);
}

/**
 * 
 * @param {Monster} monster
 * @returns {number | null}
 */
function tryAdvanceDeadline(monster) {
  if (monster.deadline === null) {
    return null;
  }
  const parsedMagnitude = parseFrequencyMagnitude(monster.frequencyMagnitude);
  if (parsedMagnitude === null) {
    return null;
  }
  const newDeadline = dayjs(monster.deadline).add(parsedMagnitude, monster.frequencyUnit).valueOf();
  return newDeadline
}

/**
 * 
 * @param {number} frequencyMagnitude
 * @param {FrequencyUnit} frequencyUnit
 * @returns {number}
 */
function getDeadline(frequencyMagnitude, frequencyUnit) {
  return getDeadlineObj(frequencyMagnitude, frequencyUnit).valueOf();
}

/**
 * 
 * @param {number} frequencyMagnitude
 * @param {FrequencyUnit} frequencyUnit
 * @returns {dayjs.Dayjs}
 */
function getDeadlineObj(frequencyMagnitude, frequencyUnit) {
  return dayjs().add(frequencyMagnitude - 1, frequencyUnit).endOf(frequencyUnit);
}

/**
 * 
 * @param {string} magnitude
 * @param {FrequencyUnit} unit 
 * @returns {{ invalidMagnitude: false, value: string } | { invalidMagnitude: true }} 
 */
function formatFrequency(magnitude, unit) {
  const parsedMagnitude = parseFrequencyMagnitude(magnitude);
  if (parsedMagnitude === null) {
    return { invalidMagnitude: true };
  }
  return { invalidMagnitude: false, value: formatFrequencyHelper(parsedMagnitude, unit) };
}

/**
 * 
 * @param {number} magnitude
 * @param {FrequencyUnit} unit 
 * @returns {string} 
 */
function formatFrequencyHelper(magnitude, unit) {
  if (magnitude === 1) {
    switch (unit) {
      case 'hour': return 'Hourly';
      case 'day': return 'Daily';
      case 'week': return 'Weekly';
      case 'month': return 'Monthly';
      case 'year': return 'Yearly';
      default: return `Every ${unit}`;
    }
  }
  return `Every ${magnitude} ${unit}s`;
}

/**
 * 
 * @param {string} magnitude
 * @param {FrequencyUnit} unit 
 * @returns {string}
 */
function formatUnit(magnitude, unit) {
  const parsedMagnitude = parseFrequencyMagnitude(magnitude);
  if (parsedMagnitude === null) {
    return formatUnitHelper(1, unit);
  }
  return formatUnitHelper(parsedMagnitude, unit);
}

/**
 * 
 * @param {number} magnitude
 * @param {FrequencyUnit} unit 
 * @returns {string} 
 */
function formatUnitHelper(magnitude, unit) {
  if (magnitude === 1) {
    return toTitleCase(unit);
  }
  return toTitleCase(unit) + 's';
}

/**
 * 
 * @param {string} magnitude
 * @returns {number | null} 
 */
function parseFrequencyMagnitude(magnitude) {
  const trimmed = magnitude.trim();
  for (const c of trimmed) {
    if (Number.isNaN(Number.parseInt(c))) {
      return null;
    }
  }
  const parsedMagnitude = Number.parseInt(trimmed);
  if (Number.isNaN(parsedMagnitude) || parsedMagnitude < 1) {
    return null;
  }
  return parsedMagnitude;
}

/**
 * 
 * @param {string} s 
 * @returns {string}
 */
function toTitleCase(s) {
  if (s.length === 0) {
    return s;
  }
  return s[0].toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * 
 * @returns {Level}
 */
function randomLevel() {
  if (Math.random() < 0.1) {
    return "boss";
  } else {
    return Math.floor(Math.random() * 99) + 1;
  }
}

/**
 * 
 * @param {Level} level 
 * @returns {string} 
 */
function formatLevel(level) {
  if (level === "boss") {
    return "boss";
  } else {
    return "lvl " + padLevelNumber(level);
  }
}

/**
 * 
 * @param {number} level 
 * @returns {string} 
 */
function padLevelNumber(level) {
  return (level < 10) ?
    "0" + level :
    level.toString();
}


function OuterCounter() {
  const [count, setCount] = useState(0);
  function _setCount(callback) {
    setCount(count => {
      const newCount = callback(count);
      delay();
      return newCount;
    });
  }
  return (
    <>
      <InnerCounter setCount={_setCount} />
    </>
  );
}

function delay() {
  for (let i = 0; i < 100000000; i++) {}
}

function InnerCounter({setCount}) {
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count => {
        if (count < 50) {
          console.log(count);
        }
        return count + 1;
      });
    }, 67);
    return () => {
      clearInterval(interval);
    }
  }, []);
  return (
    <>
      <div>Test</div>
    </>
  );
}

function SimpleTest() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count => {
        if (count < 50) {
          console.log(count);
        }
        return count + 1;
      });
    }, 67);
    return () => {
      clearInterval(interval);
    }
  }, []);
  return (
    <>
      <div>Test</div>
    </>
  );
}

function InputFlexTest() {
  return (
    <div className="flex flex-col gap-y-2 m-2">
      <div className="flex flex-col gap-y-1 p-2 bg-gray-700 text-gray-100 rounded">
        <div className="flex gap-x-1">
          <div className="bg-red-500 rounded px-1 grow">text</div>
          <div className="bg-blue-500 rounded px-1">text</div>
        </div>
        <div className="flex gap-x-1">
          <input className="bg-red-500 rounded px-1 grow" defaultValue={"text"} />
          <div className="bg-blue-500 rounded px-1">text</div>
        </div>
      </div>

      <div className="flex flex-col gap-y-1 p-2 bg-gray-700 text-gray-100 rounded">
        <div className="flex gap-x-1">
          <div className="bg-red-500 rounded px-1 grow">text</div>
          <div className="bg-blue-500 rounded px-1">text</div>
        </div>
        <div className="flex gap-x-1">
          <input className="bg-red-500 rounded px-1 grow min-w-0" defaultValue={"text"} />
          <div className="bg-blue-500 rounded px-1">text</div>
        </div>
      </div>

      <div className="flex flex-col gap-y-1 p-2 bg-gray-700 text-gray-100 rounded">
        <div className="flex gap-x-1">
          <div className="bg-red-500 rounded px-1 grow">text</div>
          <div className="bg-blue-500 rounded px-1">text</div>
        </div>
        <div className="flex gap-x-1">
          <div className="flex grow">
            <input className="bg-red-500 rounded px-1 min-w-0 grow" defaultValue={"text"} />
          </div>
          <div className="bg-blue-500 rounded px-1">text</div>
        </div>
      </div>

      <div className="flex flex-col gap-y-1 p-2 bg-gray-700 text-gray-100 rounded">
        <div className="flex gap-x-1">
          <div className="bg-red-500 rounded px-1 grow">text</div>
          <div className="bg-blue-500 rounded px-1">text</div>
        </div>
        <div className="flex gap-x-1">
          <div className="flex grow min-w-0">
            <input className="bg-red-500 rounded px-1 grow min-w-0" defaultValue={"text"} />
          </div>
          <div className="bg-blue-500 rounded px-1">text</div>
        </div>
      </div>
    </div>
  );
}

export default Test;