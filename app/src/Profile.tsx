import { useState } from "react"

type Class = "Warrior" | "Scholar";

function Profile() {
  const [playerClass, setPlayerClass] = useState<Class>("Scholar");
  return (
    <>
      <h1>Archetype Selection</h1>
			{/*<ClassHeading>The {playerClass}</ClassHeading>
			<ClassImage class_={playerClass} />
			<ClassList selectClass=setPlayerClass />*/}
    </>
  );
}

function ClassHeading({ children: class_ }: { children: string }) {
  return (
    <>
      <h1>
        {class_}
      </h1>
    </>
  );
}

function ClassImage(class_: Class) {
  return (
    <>
      <div></div>
    </>
  );
}

function ClassList(selectClass: (Class) => void) {
	const classes = ["Warrior", "Scholar"];
	return (
    <>
      <ul>
				{classes.map(class_ => (
					<li>
					  <SelectClassButton
							class_={class_}
							selectClass={selectClass}
						/>
					</li>
				)}
			</ul>
    </>
  );
}

function SelectClassButton(
	class_: Class,
	selectClass: (Class) => void
) {
	function onClick() {
		selectClass(class_);
	}
  return (
    <>
			<button
			  onClick=onClick
			>
			  {class_}
			</button>
    </>
  );
}

export default Profile;
