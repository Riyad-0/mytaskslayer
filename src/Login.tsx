import { useState, type SetStateAction } from "react";

type Change = React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
type Submit = React.SubmitEventHandler<HTMLFormElement>;

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const onUsernameChange: Change = e => {
    setUsername(e.target.value);
  }

  const onPasswordChange: Change = e => {
    setPassword(e.target.value);
  }

  const onSubmit: Submit = async e => {
    e.preventDefault();
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
        <button type="submit">Log in</button>
      </form>
    </>
  );
}

export default Login;