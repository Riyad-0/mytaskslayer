import {
  BrowserRouter as Router,
  Routes, Route, Link,
  useNavigate
} from 'react-router-dom';
import Profile from "./Profile";
import User from "./User";
import Login from './Login';

function InsideRouter() {
  const navigate = useNavigate();
  function onLogIn() {
    navigate("/profile");
  }
  return (
    <>
      <Link to="/login">login</Link>
      <Link to="/profile">profile</Link>
      <Link to="/users/1">user</Link>
      <Routes>
        <Route path="/" element={<h1>Welcome</h1>}></Route>
        <Route path="/login" element={<Login onLogIn={onLogIn} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users/:id" element={<User />}></Route>
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <InsideRouter />
    </Router>
  )
}

export default App;