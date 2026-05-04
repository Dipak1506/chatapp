import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import Login from './Pages/login';
import Register from './Pages/register';
import axios from 'axios';
import Notification from './components/notification/Notification';
import { SocketProvider } from './utils/SocketContext';


function App() {
  const [isLogIn, setIsLogIn] = useState(false);
  const [user, setUser] = useState();
  const [userId, setUserId] = useState()
  const [room, setRoom] = useState('');

  const getUser = async () => {
    try {
      const url = "http://localhost:55000/auth/login/success";
      const { data } = await axios.get(url, { withCredentials: true });
      setUser(data.user.displayName);
      setIsLogIn(true);
    } catch (err) {
      console.log(err);
    }
  };

  const checkUser = () => {
    let token = sessionStorage.getItem('token');
    let username = sessionStorage.getItem('username');
    if (token && username) {
      setUser(username);
      setIsLogIn(true);
    }
  }

  useEffect(() => {
    getUser();
    checkUser();

  }, []);

  return (
    <div className="app">
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path='/'
              exact={true}
              element={
                <Login
                  setIsLogIn={setIsLogIn}
                  isLogIn={isLogIn}
                  user={user}
                  setUser={setUser}
                  room={room}
                  setRoom={setRoom}
                  userId={userId}
                  setUserId={setUserId}
                   />}>
            </Route>
            <Route
              path='/register'
              exact={true}
              element={
                <Register
                  setIsLogIn={setIsLogIn}
                  isLogIn={isLogIn}
                  user={user}
                  setUser={setUser}
                />}>
            </Route>
          </Routes>
        </BrowserRouter>
        <Notification />
      </SocketProvider>
    </div>
  );
}

export default App;
