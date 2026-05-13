import { useContext, useEffect, useReducer, useRef, useState } from "react";
import { frequencyUnits, isFrequencyUnit, isMonster, isMonsterKind, isProfile, monsterKinds, monsterName, randomMonsterKind } from "./types";
import logo from "./assets/logo.png";
import vampire from "./assets/vampire.webp";
import MiniNav from "./MiniNav";
import Nav from "./Nav";
import dayjs from "dayjs";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { GuestIdContext } from "./GuestIdContext";
import { get, post } from "./requests";
/** @import { FrequencyUnit, Level, Monster } from "./types" */


/**
 * @typedef {"hero" | "task" | "loading"} HomeMode
 */

/**
 * @typedef {(monsters: Monster[]) => void} SetMonsters
 */

/**
 * @typedef {(callback: ((monsters: Monster[]) => Monster[])) => void} UpdateMonsters
 */

/**
 * 
 * @typedef {{
 *   list: Monster[]
 *   set: (monsters: Monster[]) => void
 *   update: (callback: ((monsters: Monster[]) => Monster[])) => void
 *   setMonster: (monster: Monster) => void
 *   deleteMonster: (monster: Monster) => void
 *   slayMonster: (monster: Monster) => void
 *   attackPlayer: (monster: Monster) => void
 *   revivePlayer: () => void
 * }} MonsterProps
 */

/**
 * 
 * @param {number} xp
 * @returns {number}
 */
function getPlayerMaxHp(xp) {
  return 10 + levelFromXp(xp) - 1;
}

/**
 * 
 * @param {number} xp
 * @returns {number}
 */
function getPXp(xp) {
  const level = levelFromXp(xp);
  const max = xpFromLevel(level + 1);
  const min = xpFromLevel(level);
  return (xp - min) / (max - min);
}

/**
 * @param {number} xp
 * @returns {number}
 */
function levelFromXp(xp) {
  return seriesN(xp, 500, 100) + 1;
}

/**
 * @param {number} level
 * @returns {number}
 */
function xpFromLevel(level) {
  return seriesSum(500, 100, level - 1);
}

/**
 * @param {number} s
 * @param {number} a
 * @param {number} d
 * @returns {number}
 */
function seriesN(s, a, d) {
  // an+dn(n-1)/2 = s
  // dn^2+(2a-d)n-2s = 0
  // n = [-(2a-d) + sqrt( (2a-d)^2 - 4d(-2s) )] / (2d)
  // n = [-(2a-d) + sqrt( (2a-d)^2 + 8ds )] / (2d)
  return Math.floor((-(2*a-d) + Math.sqrt( Math.pow(2*a-d, 2) + 8*d*s ) ) / (2*d));
}

/**
 * 
 * @param {number} a 
 * @param {number} d 
 * @param {number} n 
 * @returns {number}
 */
function seriesSum(a, d, n) {
  return a * n + d * n * (n-1) / 2;
}

const reviveCost = 1;

function Home() {
  const [task, setTask] = useState("");
  const [hp, _setHp] = useState(/** @type {number | null} */ (null));
  const [xp, _setXp] = useState(/** @type {number | null} */ (null));
  const [gold, _setGold] = useState(/** @type {number | null} */ (null));
  const [monsters, _setMonsters] = useState(/** @type {Monster[]} */ ([]));
  const [didSubmitTask, setDidSubmitTask] = useState(false);
  const [mode, setMode] = useState(/** @type {HomeMode} */ ("loading"));
  // const [lastUpdate, setLastUpdate] = useState(Date.now());
  // const didUpdateHp = useRef(false);
  // const didUpdateMonsters = useRef(false);
  const guestId = useContext(GuestIdContext);

  useEffect(() => {
    get('/api/profile', guestId).then(data => {
      const profile = data?.profile;
      if (!isProfile(profile)) {
        setMode("hero");
        return;
      }
      console.log(data);
      let hpLost = 0;
      let changed = false;
      const newMonsters = profile.monsters.map(monster => {
        if (!isMonster(monster)) return monster;
        const frequencyMagnitude = parseFrequencyMagnitude(monster.frequencyMagnitude);
        if (frequencyMagnitude === null || monster.deadline === null) return monster;
        const period = getPeriod(frequencyMagnitude, monster.frequencyUnit);
        const deadline = monster.deadline;
        const sinceDeadline = Date.now() - deadline;
        const laps = Math.floor(sinceDeadline / period);
        if (laps <= 0) return monster;
        changed = true;
        hpLost += laps;
        return {
          ...monster,
          deadline: getDeadline(frequencyMagnitude, monster.frequencyUnit),
        };
      });
      const newHp = Math.max(profile.hp - hpLost, 0);
      _setHp(newHp);
      _setXp(profile.xp);
      _setGold(profile.gold);
      _setMonsters(newMonsters);

      if (changed) {
        post('/api/status', guestId, { hp: newHp, monsters: newMonsters });
      }

      if (newMonsters.length > 0) {
        setMode("task");
      } else {
        setMode("hero");
      }
    });
  }, []);

  // useEffect(() => {
  //   if (didUpdateHp.current) {
  //     post('/api/hp', guestId, { hp });
  //   }
  // }, [hp]);

  // useEffect(() => {
  //   if (didUpdateMonsters.current) {
  //     post('/api/monsters', guestId, { monsters });
  //   }
  // }, [monsters]);

  /**
   * 
   * @param {number} hp 
   */
  function setHp(hp) {
    _setHp(hp);
    post('/api/hp', guestId, { hp });
  }

  /**
   * 
   * @param {Monster[]} monsters 
   */
  function setMonsters(monsters) {
    _setMonsters(monsters);
    post('/api/monsters', guestId, { monsters });

    // didUpdateMonsters.current = true;
  }

  function submitTask() {
    const words = task.trim().split(" ");
    if (words.length === 0) {
      return;
    }
    const lastWord = words[words.length - 1];
    if (lastWord.length === 0) {
      return;
    }
    const taskName = lastWord[0].toUpperCase() + lastWord.slice(1);

    let id = monsters.length;
    for (const m of monsters) {
      if (m.id >= id) {
        id = m.id + 1;
      }
    }

    let monsterKind = randomMonsterKind();
    for (let i = 0; i < 9; i++) {
      if (monsters.some(m => m.kind === monsterKind)) {
        monsterKind = randomMonsterKind();
      } else {
        break;
      }
    }
    const level = randomLevel();
    const frequencyMagnitude = 5;
    const frequencyUnit = 'second';
    const deadline = getDeadline(frequencyMagnitude, frequencyUnit);
    const hp = 2;
    setMonsters([
      ...monsters,
      {
        id,
        taskName,
        kind: monsterKind,
        maxHp: hp,
        currentHp: hp,
        task,
        level,
        frequencyMagnitude: frequencyMagnitude.toString(),
        frequencyUnit,
        deadline,
      }
    ]);
    setTask("");
    setDidSubmitTask(true);
            console.log("hoo hey");

  }

  /**
   * @param {Monster} newMonster
   * @returns {Monster[]}
   */
  function _setMonster(newMonster) {
    const newMonsters = monsters.map(found => {
      if (found.id === newMonster.id) {
        return newMonster;
      } else {
        return found;
      }
    });
    _setMonsters(newMonsters);
    return newMonsters;
  }

  
  /** @type {MonsterProps} */
  const monsterProps = {
    list: monsters,
    set: setMonsters,
    update(callback) {
      _setMonsters(monsters => {
        const newMonsters = callback(monsters);
        // didUpdateMonsters.current = true;
        // console.log(newMonsters === monsters);
        // TODO: uncomment
        // post('/api/monsters', guestId, { monsters: newMonsters });

        // if (newMonsters !== monsters && (Date.now() - lastUpdate > 100)) {
          // post('/api/monsters', guestId, { monsters: newMonsters });
          // setLastUpdate(Date.now());
        // }
        return newMonsters;
      });
    },
    setMonster(newMonster) {
      this.set(monsters.map(found => {
        if (found.id === newMonster.id) {
          return newMonster;
        } else {
          return found;
        }
      }));
    },
    deleteMonster(monster) {
      this.set(this.list.filter(found => found.id !== monster.id));
    },
    slayMonster(monster) {
      if (hp === null || xp === null || gold === null) return;
      const newXp = xp + 150;
      const newGold = gold + 1;
      const maxHpMultiplier = getPlayerMaxHp(newXp) / getPlayerMaxHp(xp);
      const newHp = maxHpMultiplier * hp;
      /** @type {Monster} */
      const newMonster = {
        ...monster,
        currentHp: 0,
      };
      const newMonsters = _setMonster(newMonster);
      _setHp(newHp);
      _setXp(newXp);
      _setGold(newGold);
      post('/api/slay', guestId, { hp: newHp, xp: newXp, gold: newGold, monsters: newMonsters });
    },
    attackPlayer(monster) {
      if (hp === null) return;
      const newHp = Math.max(hp - 1, 0);
      setHp(newHp);
    },
    revivePlayer() {
      if (xp === null || gold === null) return;
      if (gold < reviveCost) return;
      const newHp = getPlayerMaxHp(xp);
      const newGold = gold - reviveCost;
      _setHp(newHp);
      _setGold(newGold);
      post('/api/revive', guestId, { hp: newHp, gold: newGold });
    }
  };
  return (
    <>
      <title>Task Slayer</title>
      <Header />
      {mode === "loading" ?
        <></> :
        <>
          {mode === "task" ?
            <></> :
            <Hero didSubmitTask={didSubmitTask} />
          }
          {
            (hp === null || xp === null || gold === null) ?
              <></> :
              <MonsterSection mode={mode} didSubmitTask={didSubmitTask} monsters={monsterProps} task={task} hp={hp} xp={xp} gold={gold} setTask={setTask} submitTask={submitTask} />
          }
        </>
      }
    </>
  );
}

/**
 * 
 * @param {{ didSubmitTask: boolean }} props 
 */
function Hero({ didSubmitTask }) {
  return (
    <div className={
      (didSubmitTask ? "prepare-shrink shrink" : "prepare-shrink")
    }>
      <div className="hero">
        <img className="hero-logo" alt="logo" src={logo} />
        <div className="hero-heading">Task Slayer</div>
        <div className="hero-subheading">Finish tasks. Slay monsters. Level up.</div>
      </div>
    </div>
  );
}

function HeroOrHud({ didSubmitTask }) {

}

/**
 * 
 * @param {{
 *   mode: HomeMode
 *   didSubmitTask: boolean
 *   monsters: MonsterProps
 *   task: string
 *   hp: number
 *   xp: number
 *   gold: number,
 *   setTask: (task: string) => void
 *   submitTask: () => void
 * }} props 
 * @returns 
 */
function MonsterSection({ mode, didSubmitTask, monsters, task, hp, xp, gold, setTask, submitTask }) {
  const [initialTime, _] = useState(Date.now());
  const [time, setTime] = useState(initialTime);
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 67);
    return () => {
      clearInterval(interval);
    };
  }, []);
  useEffect(() => {
    if (time === initialTime) return;
    let changed = false;
    const newMonsters = monsters.list.map(found => {
      if (found.deadline === null) return found;
      const frequencyMagnitude = parseFrequencyMagnitude(found.frequencyMagnitude);
      if (frequencyMagnitude === null) {
        return found;
      }
      const deadline = found.deadline;
      if (time < deadline) return found;
      changed = true;
      const newDeadline = getDeadline(frequencyMagnitude, found.frequencyUnit);
      if (found.currentHp === 0) {
        const hp = found.currentHp === 0 ? found.maxHp : found.currentHp;
        const level = randomLevel();
        console.log("revivve");
        return {
          ...found,
          currentHp: hp,
          level,
          deadline: newDeadline,
        };
      } else {
        monsters.attackPlayer(found);
        return {
          ...found,
          deadline: newDeadline,
        };
      }
    });
    if (changed) {
      monsters.set(newMonsters);
    }
  }, [time]);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setTime(Date.now());
  //     monsters.update(monsters => {
  //       let changed = false;
  //       const newMonsters = monsters.map(found => {
  //         if (found.deadline === null) return found;
  //         const frequencyMagnitude = parseFrequencyMagnitude(found.frequencyMagnitude);
  //         if (frequencyMagnitude === null) {
  //           return found;
  //         }
  //         const deadline = found.deadline;
  //         if (Date.now() < deadline) return found;
  //         changed = true;
  //         const newDeadline = getDeadline(frequencyMagnitude, found.frequencyUnit);
  //         if (found.currentHp === 0) {
  //           const hp = found.currentHp === 0 ? found.maxHp : found.currentHp;
  //           const level = randomLevel();
  //           console.log("revivve");
  //           return {
  //             ...found,
  //             currentHp: hp,
  //             level,
  //             deadline: newDeadline,
  //           };
  //         } else {
  //           return {
  //             ...found,
  //             deadline: newDeadline,
  //           };
  //         }
  //       });
  //       if (changed) {
  //         return newMonsters;
  //       } else {
  //         return monsters;
  //       }
  //     });
  //   }, 67);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);
  /** @type {React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>} */
  function onChangeTask(e) {
    setTask(e.target.value);
  }
  /** @type {React.SubmitEventHandler<HTMLFormElement>} */
  function onSubmitTask(e) {
    e.preventDefault();
    submitTask();
  }
  function revive() {
    monsters.revivePlayer();
  }
  const maxHp = getPlayerMaxHp(xp);
  const pHp = (hp / maxHp) * 100;
  const pXp = getPXp(xp) * 100;
  const level = levelFromXp(xp);
  const xpInBar = xp - xpFromLevel(level);
  const xpBarSize = xpFromLevel(level + 1) - xpFromLevel(level);
  return (
    <div className="home-monsters-section">
      <div className="home-monsters-container">
        {/* <div className="text-white text-center text-2xl">Guest</div> */}
        <div className={mode === "task" ? "" : (didSubmitTask ? "prepare-appear appear" : "prepare-appear")}>
          <div className="h-2 mx-12 bg-gray-500 rounded-[3px]">
            <div
              className="h-full bg-red-500 rounded-[3px]"
              style={{ width: `${pHp}%` }}
            ></div>
          </div>
          <div className="mx-12 text-red-500">Health: {Math.round(hp)}/{maxHp}</div>
          <div className="h-2 mx-12 mt-4 bg-gray-500 rounded-[3px]">
            <div
              className="h-full bg-green-400 rounded-[3px]"
              style={{ width: `${pXp}%` }}
            ></div>
          </div>
          <div className="mx-12 text-green-400">Level {level} -  {xpInBar}/{xpBarSize}</div>
          {hp > 0 ?
            <div className="mx-12 text-amber-300 text-end">Gold: {gold}</div> :
            <div className="mx-12 flex items-center justify-between">
              <button onClick={revive} className="cursor-pointer bg-red-500 rounded text-gray-300 font-bold p-1.5">Revive? ({reviveCost})</button>
              <div className="text-amber-300 text-end">Gold: {gold}</div>
            </div>
          }
        </div>
        <h2 className="home-monsters-heading mt-6">What monsters will we slay today?</h2>
        <form onSubmit={onSubmitTask}>
          <input
            className="home-monsters-input"
            onChange={onChangeTask}
            value={task}
            placeholder="try: do the laundry"
          />
        </form>
        {/* <div
          className="grid text-white items-center justify-center gap-x-2"
          style={{
            gridTemplateColumns: "1fr 3fr 1fr"
          }}
        >
          <div className="justify-self-end text-red-400">HP</div>
          <div className="justify-self-center w-full">
            <div className="h-1.5 bg-gray-500 rounded-[3px]">
              <div
                className="h-1.5 bg-red-500 rounded-[3px]"
                style={{ width: `${90}%` }}
              ></div>
            </div>
          </div>
        </div> */}
        <div className="home-monsters">
          {monsters.list.map(m => {
            return (
              <Monster key={m.id} monster={m} monsters={monsters} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * 
 * @param {{
 *   monster: Monster
 *   monsters: MonsterProps
 * }} props 
 */
function Monster({ monster, monsters }) {
  const [editing, setEditing] = useState(false);
  function switchToEdit() {
    setEditing(true);
  }
  function switchToView() {
    setEditing(false);
  }
  return editing ?
    <MonsterEdit monster={monster} monsters={monsters} switchToView={switchToView} /> :
    <MonsterView monster={monster} monsters={monsters} switchToEdit={switchToEdit} />
}

/**
 * 
 * @param {{
 *   monster: Monster
 *   monsters: MonsterProps
 *   switchToEdit: () => void
 * }} props 
 */
function MonsterView({ monster, monsters, switchToEdit }) {
  const name = monsterName(monster);
  function attack() {
    const newHp = Math.max(monster.currentHp - 1, 0);
    if (newHp === 0) {
      // monsters.setMonster({
      //   ...monster,
      //   currentHp: 0,
      // });
      monsters.slayMonster(monster);
    } else {
      const newDeadline = tryAdvanceDeadline(monster);
      monsters.setMonster({
        ...monster,
        currentHp: newHp,
        deadline: newDeadline,
      });
    }
  }
  const level = formatLevel(monster.level);
  const hp = monster.currentHp / monster.maxHp * 100;

  return (
    <div className="font-sans p-2 bg-slate-700 rounded-sm text-slate-100" key={monster.id}>
        <div className="flex gap-x-2">
          <div className="flex flex-col gap-y-0.5 items-center min-w-20">
            <img alt="vampire" src={vampire} className="rounded w-20 h-20 object-cover object-top" />
            <div className="text-center text-slate-400 bg-slate-950 rounded w-full">{level}</div>
          </div>
          <div className="flex flex-col grow">
            <div className="flex justify-between">
              <div>{name}</div>
              <button onClick={switchToEdit} className="cursor-pointer">
                <span className="material-symbols-outlined text-slate-400">edit</span>
              </button>
            </div>
            <div>{monster.task}</div>
            <MonsterFrequency monster={monster} />
            <div className="flex flex-col grow justify-end gap-y-2 items-center mt-2">
              <div className="w-full h-1.5 bg-gray-500 rounded-[3px]">
                <div
                  className="h-1.5 bg-red-500 rounded-[3px]"
                  style={{ width: `${hp}%` }}
                ></div>
              </div>
              <AttackButtonOrStatus monster={monster} attack={attack} />
            </div>
          </div>
        </div>
    </div>
  );
}

/**
 * 
 * @param {{
 *   monster: Monster
 *   attack: () => void
 * }} props 
 */
function AttackButtonOrStatus({ monster, attack }) {
  return (
    monster.currentHp === 0 ?
      <div className="flex bg-green-800 h-7 rounded-[14px] w-full items-center justify-center" >Slain</div> :
      isTaskCompleted(monster) ?
        <div className="flex bg-green-600 h-7 rounded-[14px] w-full items-center justify-center" >Pacified</div> :
        <button onClick={attack} className="cursor-pointer bg-sky-600 h-7 rounded-[14px] w-full" >Attack</button>
  );
}

/**
 * 
 * @param {{
 *   monster: Monster
 * }} props 
 */
function MonsterFrequency({ monster }) {
  const frequencyMagnitude = parseFrequencyMagnitude(monster.frequencyMagnitude);
  const frequencyResult = formatFrequency(monster.frequencyMagnitude, monster.frequencyUnit);
  return (
    (frequencyResult.invalidMagnitude || frequencyMagnitude === null || monster.deadline === null) ? 
      <div className="text-red-300">Invalid frequency</div> :
      <ValidMonsterFrequency
        monster={monster}
        frequencyMagnitude={frequencyMagnitude}
        frequencyString={frequencyResult.value}
        deadline={monster.deadline}
      />
  );
}

/**
 * 
 * @param {{
 *   monster: Monster
 *   frequencyMagnitude: number
 *   frequencyString: string
 *   deadline: number
 * }} props 
 */
function ValidMonsterFrequency({ monster, frequencyMagnitude, frequencyString, deadline }) {
  const period = getPeriod(frequencyMagnitude, monster.frequencyUnit);
  const periodEnd = isTaskCompleted(monster) ? 
    (deadline - period) :
    deadline;
  const timeLeft = periodEnd - Date.now();
  const p = Math.max(Math.min(timeLeft / period, 1), 0);
  return (
    <div className="flex items-center gap-x-2">
      <div>{frequencyString}</div>
      <div className="w-5 h-5 mt-0.5">
        <CircularProgressbar
          className="text-red-500"
          value={p}
          maxValue={1}
          strokeWidth={50}
          styles={buildStyles({
            pathColor: 'var(--color-amber-500)',
            strokeLinecap: "butt"
          })}
        />
      </div>
    </div>
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

/**
 * 
 * @param {{
 *   monster: Monster
 *   monsters: MonsterProps
 *   switchToView: () => void
 * }} props 
 */
function MonsterEdit({ monster, monsters, switchToView }) {
  const name = monsterName(monster);
  /** @type {React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>} */
  function onChangeTaskName(e) {
    monsters.setMonster({
      ...monster,
      taskName: e.target.value,
    });
  }
  /** @type {React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>} */
  function onChangeTask(e) {
    monsters.setMonster({
      ...monster,
      task: e.target.value,
    });
  }
  /** @type {React.ChangeEventHandler<HTMLSelectElement, HTMLSelectElement>} */
  function onChangeMonsterKind(e) {
    const kind = e.target.value;
    if (!isMonsterKind(kind)) {
      return;
    }
    monsters.setMonster({
      ...monster,
      kind,
    });
  }
  /** @type {React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>} */
  function onChangeFrequencyMagnitude(e) {
    const frequencyMagnitude = e.target.value;
    const deadline = tryGetDeadline(frequencyMagnitude, monster.frequencyUnit);
    monsters.setMonster({
      ...monster,
      frequencyMagnitude,
      deadline,
    });
  }
  /** @type {React.ChangeEventHandler<HTMLSelectElement, HTMLSelectElement>} */
  function onChangeFrequencyUnit(e) {
    const frequencyUnit = e.target.value;
    if (!isFrequencyUnit(frequencyUnit)) {
      return;
    }
    const deadline = tryGetDeadline(monster.frequencyMagnitude, frequencyUnit);
    monsters.setMonster({
      ...monster,
      frequencyUnit,
      deadline,
    });
  }

  function deleteMonster() {
    monsters.deleteMonster(monster);
  }
  return (
    <div className="font-sans p-2 bg-slate-700 rounded-sm text-slate-100" key={monster.id}>
      <div className="flex items-start justify-between">
        <div>{name}</div>
        <div className="flex gap-x-1">
          <button onClick={deleteMonster} className="cursor-pointer">
            <span className="material-symbols-outlined text-slate-400">delete</span>
          </button>
          <button onClick={switchToView} className="cursor-pointer">
            <span className="material-symbols-outlined text-slate-400">check</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-y-2 mt-1">
        <div className="flex gap-x-2">
          <div className="flex flex-col min-w-0">
            <input className="bg-slate-600 rounded-sm px-2 py-0.5 min-w-0" name='prefix' value={monster.taskName} onChange={onChangeTaskName}/>
            <label className="ml-2 text-slate-400 font-bold text-sm" htmlFor='prefix'>PREFIX</label>
          </div>

          <div className="flex flex-col">
            <select className="bg-slate-600 rounded-sm px-1 py-0.5" name='monster' value={monster.kind} onChange={onChangeMonsterKind}>
              {monsterKinds.map(kind => {
                return (<option key={kind} value={kind}>{kind}</option>);
              })}
            </select>
            <label className="ml-2 text-slate-400 font-bold text-sm" htmlFor='monster'>MONSTER</label>
          </div>
        </div>
        <div className="flex flex-col">
          <input className="bg-slate-600 rounded-sm px-2 py-0.5" name='task' value={monster.task} onChange={onChangeTask} />
          <label className="ml-2 text-slate-400 font-bold text-sm" htmlFor='task'>TASK</label>
        </div>
      </div>
      <div className="flex gap-x-2">
        <div>Every</div>
        <input className="bg-slate-600 rounded-sm px-2 py-0.5 w-[8ch]" name='frequency magnitude' value={monster.frequencyMagnitude} onChange={onChangeFrequencyMagnitude} />
        <select className="bg-slate-600 rounded-sm px-1 py-0.5" name='frequency unit' value={monster.frequencyUnit} onChange={onChangeFrequencyUnit}>
          {frequencyUnits.map(unit => {
            return (<option key={unit} value={unit}>{formatUnit(monster.frequencyMagnitude, unit)}</option>);
          })}
        </select>
      </div>
      {parseFrequencyMagnitude(monster.frequencyMagnitude) === null ?
        <div className="text-red-500">Invalid frequency</div> :
        <></>
      }
    </div>
  );
}

function Header() {
  return (
    <>
      <header className="home-header">
        <Nav />
      </header>
      <header className="home-mini-header">
        <MiniNav />
      </header>
    </>
  );
}

export default Home;
