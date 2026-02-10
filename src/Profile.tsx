import { useEffect, useState } from "react"

type Class = "Warrior" | "Scholar";

function Profile({ enterRealm }: { enterRealm: () => void }) {
  const [playerClass, setPlayerClass] = useState<Class>("Scholar");
  async function onClickEnterRealm() {
    await fetch("/api/profile", {
      method: "POST",
      body: JSON.stringify({
        class_: playerClass
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    enterRealm();
  }
  useEffect(() => {
    fetch("/api/profile/")
      .then(res => res.json())
      .then(data => {
        if (data.profile.class_ !== undefined) {
          setPlayerClass(data.profile.class_);
        }
      });
  }, []);
  return (
    <>
      <h1>Archetype Selection</h1>
			<ClassHeading>The {playerClass}</ClassHeading>
			<ClassImage class_={playerClass} />
			<ClassList selectClass={setPlayerClass} />
      <button onClick={onClickEnterRealm}>Enter Realm</button>
    </>
  );
}

function ClassHeading({ children: class_ }: { children: string[] }) {
  return (
    <>
      <h1>
        {class_}
      </h1>
    </>
  );
}

function ClassImage({ class_ }: { class_: Class }) {
  return (
    <>
      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuATLB2FYGxtzEjFFAax6TFJOVWLdobJOioC5hH-7Zrtp9mnkMjH-IMC0BXq8LXkAT9-c50I6IuFKhCpPBMFO4dgxATQaaEgewvBVobnOfLFuwCmAIw0yjfxR2Y_J3yTQcjtk7UJVEqWc_e7TSbT86t-1iP7Xdy6ynl-GBbfC9WCahF3vnxMI1d6V96NgmFdqdT-K7zTBNgfSXX5nkhewm9O9Qb_I9IRearWqRniC7siBhWT9L-KqB7uuxqnNEjVkNGZpdbei0CgGok"></img>
      {class_}
    </>
  );
}

function ClassList(
  { selectClass }: { selectClass: (class_: Class) => void }
) {
	const classes: Class[] = ["Warrior", "Scholar"];
	return (
    <>
      {classes.map(class_ =>
        <SelectClassButton
          key={class_}
          class_={class_}
          selectClass={selectClass}
        />
      )}
    </>
  );
}

function SelectClassButton(
  {
    class_,
    selectClass
  }: {
    class_: Class,
    selectClass: (class_: Class) => void
  }
) {
	function onClick() {
		selectClass(class_);
	}
  return (
    <>
			<button
			  onClick={onClick}
			>
			  {class_}
			</button>
    </>
  );
}

export default Profile;
