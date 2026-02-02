import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

type User = {
  name: string
};

function User() {
  const id = useParams().id;
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetch("/api/users/" + id)
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