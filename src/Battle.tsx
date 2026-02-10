import { useEffect, useState } from "react";

interface Monster {
  name: string,
  task: string
}

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
              <h4>{monster.name}</h4>
              <h5>{monster.task}</h5>
            </div>
          )
      }
    </>
  );
}

export default Battle;