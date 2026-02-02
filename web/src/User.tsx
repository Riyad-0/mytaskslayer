import { useEffect, useState } from "react"

type User = {
  name: string
};

function User() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetch("/api/users/1")
      .then(res => res.json())
      .then(json => {
        setUser(json);
      });
  }, [user]);
  return (
    user == null ?
      <>Loading...</> :
      <>{user.name}</>
  );
}

export default User;