import {
  BrowserRouter as Router,
  Routes, Route, Link
} from 'react-router-dom'
import Profile from "./Profile";
import User from "./User";
import Login from './Login';

function App() {
  return (
    <Router>
      {/* <User /> */}
      <Link to="/login">login</Link>
      <Link to="/profile">profile</Link>
      <Link to="/users/1">user</Link>
      <Routes>
        <Route path="/" element={<h1>Welcome</h1>}></Route>
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users/:id" element={<User />}></Route>
      </Routes>
    </Router>
  )
}

export default App;