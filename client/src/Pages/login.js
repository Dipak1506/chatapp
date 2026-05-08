import '../css/login.css';
import Google from "../img/google.png";
import { useState } from "react";
import apiConfig from "../utils/apiConfig";
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.css";
import Chats from './chats';
import { toast } from 'react-toastify';
import { useSocket } from '../utils/SocketContext';




const Login = (props) => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [usernameError] = useState('');
  const [password, setPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [signInError, setSignInError] = useState('');

  const register = () => {
    navigate('/register');
    
  }

    

  const handleSignIn = async () => {

    console.log("clickedd",props.user,password);

  
    
    
    if (!props.user) {
      setPassError("Please enter valid username");
    }
    else if (password === "") {
      setPassError("Password is required");
    }
    else {
    
      
      await apiConfig.get('/signin',
        
        {
          params: {
            username: props.user,
            password: password,
          }
        })
        .then((response) => {
          console.log('user',response);
          if (response.data.status === 200) {
            setSignInError(response.data.msg);
            props.setIsLogIn(true);
           // console.log(response.data.data[0].username,response.data.data[0].id);
            sessionStorage.setItem('username',response.data.data[0].username);
            sessionStorage.setItem('token', response.data.token);
           toast.success("Hello...  " + response.data.data[0].username);
           props.setUserId(response.data.data[0].id)

          //  socket.emit('join_room', { username: props.user, room: props.user  })
          socket.emit('joinRoom', props.user);
          } else if (response.data.status === 201) {
            setSignInError(response.data.msg);
            toast.warning("Enter Valid Details...")
          }
        })
        .catch((err) => {
          console.log(err);
        })
      //setSignInError("loggedin successfully");
      
      
    }
  };

  const google = () => {
    window.open("http://localhost:5500/auth/google", "_self");
};


  return (
    props.isLogIn ? <Chats 
                        setIsLogIn={props.setIsLogIn} 
                        user={props.user}
                        room={props.room}
                        setRoom={props.setRoom}
                        userId={props.userId}
                         /> :
    
    <div className="container-fluid login">

      <div className="wrapper">
        <h1 className="Title">Choose a Login Method</h1>
        <div className='row wrapper-inner'>
          <div className="left col-md-5">
            <div className="loginButton google" onClick={() => google()}>
              <img src={Google} alt="" className="icon" />
              Google
            </div>
          </div>
          <div className="center col-md-2">
            <div className="line" />
            <div className="or">OR</div>
          </div>
          <div className="right col-md-5 flex-column mt-3 justify-content-center">
            <input className="input-first input" type="text" placeholder="username"
              value={props.user} 
              onChange={(e) => props.setUser(e.target.value)} />
            <input  className="input" type="password" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="inputs">
              <label className="error"> {usernameError} {passError} {signInError}</label>
            </div>
            <button className="submit" onClick={handleSignIn} >Login</button>
            <p className='warning'>Don't have account? <span onClick={register}> Register Here!</span></p>
          </div>
        </div>
      </div>
    </div> 
  );
};

export default Login;