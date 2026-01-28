import { useState } from "react"

function Profile() {
  // const [playerClass, setPlayerClass] = useState();
  return (
    <>
      <h1>Archetype Selection</h1>
      <ClassHeading>The Scholar</ClassHeading>
      

    </>
  );
}

function ClassHeading({ children: className }: { children: string }) {
  return (
    <>
      <h1>
        {className}
      </h1>
    </>
  )
}

function ClassImage(className: string) {
  return (
    <>
      <div></div>
    </>
  )
}