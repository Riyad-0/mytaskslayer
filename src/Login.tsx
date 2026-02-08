import { useState, type SetStateAction } from "react";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  function onUsernameChange(e: { target: { value: SetStateAction<string>; }; }) {
    setUsername(e.target.value);
  }

  function onPasswordChange(e: { target: { value: SetStateAction<string>; }; }) {
    setPassword(e.target.value);
  }

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    e.target.submit
    console.log("test");
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const body = await res.json();
    console.log("response: ", body);
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <input name="username" onChange={onUsernameChange} value={username} />
        <input name="password" onChange={onPasswordChange} value={password} />
        <button action type="submit">Log in</button>
      </form>
    </>
  );
}

export default Login;