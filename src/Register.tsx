import { useState, type SetStateAction } from "react";

type Change = React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
type Submit = React.SubmitEventHandler<HTMLFormElement>;

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const onUsernameChange: Change = e => {
    setUsername(e.target.value);
  }

  const onPasswordChange: Change = e => {
    setPassword(e.target.value);
  }

  const onSubmit: Submit = e => {
    e.preventDefault();
    fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
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

export default Register;