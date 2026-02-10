import { useEffect, useState } from "react";

interface Monster {
  name: string,
  task: string,
  level: Level,
  currentHp: number,
  maxHp: number
}

type Level = number | "boss";

function Battle() {
  const [monsters, setMonsters] = useState<Monster[]>();
  useEffect(() => {
    fetch("/api/profile/")
      .then(res => res.json())
      .then(data => {
        setMonsters(data.profile.monsters);
      });
  }, []);
  return (
    <>
      {(monsters === undefined) ?
        "Loading..." :
        (monsters.length === 0) ?
          "No monsters yet." :
          monsters.map(monster =>
            <div key={monster.name}>
              <div>{formatLevel(monster.level)}</div>
              <div>{monster.name}</div>
              <div>{monster.task}</div>
              <div>HP</div>
              <div>{monster.currentHp}/{monster.maxHp}</div>
              <button>Attack</button>
            </div>
          )
      }
    </>
  );
}

function formatLevel(level: Level) {
  if (level === "boss") {
    return "boss";
  } else {
    return "lvl " + padLevelNumber(level);
  }
}

function padLevelNumber(level: number): string {
  return (level < 10) ?
    "0" + level :
    level.toString();
}

export default Battle;