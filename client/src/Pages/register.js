import '../css/register.css';
import Google from "../img/google.png";
import { useState } from "react";
import apiConfig from "../utils/apiConfig";
import { checkEmail, checkUsername } from "../utils/comman";
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.css"

const Register = () => {
    const navigate = useNavigate();
    const [username, setusername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [password, setPassword] = useState('');
    const [passError, setPassError] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [numberError, setNumberError] = useState('');
    const [cpassError, setCpassError] = useState('');
    const [signUpError, setSignupError] = useState('');

    const login = () => {
        navigate("/");
    }

    const handleSignUp = async () => {
        setNameError('');
        setEmailError('');
        setNumberError('');
        setPassError('');
        setCpassError('');
        setSignupError('');
        setUsernameError('');

        if (name === "") {
            setNameError("Name is required");
        }
        else if (!checkEmail(email)) {
            setEmailError("Please enter valid email address")
        }
        else if (number === "") {
            setNumberError("Contact Number is required")
        }
        else if (number.length < 10) {
            setNumberError("Please enter a valid contact number")
        }
        else if (!checkUsername(username)) {
            setUsernameError("username is invalid")
        }
        else if (password.length < 8) {
            setPassError("Password must be 8 characters long");
        }
        else if (password === "") {
            setPassError("Password is required")
        }
        else if (confirmPass === '') {
            setCpassError("Please re-enter your password")
        }
        else if (confirmPass !== password) {
            setCpassError("Both passwords must be the same")
        }
        else {
            console.log("react-data : " + name + email + number + password + username);
            await apiConfig.get('/signup',
                {
                    params: {
                        name: name,
                        email: email,
                        number: number,
                        password: password,
                        username: username,
                    }
                })
                .then((response) => {
                    console.log(response);
                    setSignupError("succsesfully registered");
                    login();
                });
        }
    };

    const google = () => {
        window.open("http://localhost:55000/auth/google", "_self");
    };




    return (
        <div className=" container-fluid register">

            <div className="wrapper">
                <h1 className="Title">Register Here</h1>
                <div className='wrapper-inner'>
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
                    <div className="right col-md-5">
                        <input classname="input" type="text" placeholder=" Name" id="name" value={name} maxLength={16}
                            onChange={(e) => {
                                const re = /^[a-zA-Z ]+$/;
                                if (e.target.value === "" || re.test(e.target.value)) {
                                    setName(e.target.value);
                                }
                            }
                            } />
                        <input classname="input" type="email" placeholder="Email" id="mail" value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }} />
                        <input classname="input" type="text" placeholder=" MobileNumber" id="number" value={number} maxLength={10}
                            onChange={(e) => {
                                const re = /^[0-9]+$/;
                                if (e.target.value === "" || re.test(e.target.value)) {
                                    setNumber(e.target.value);
                                }
                            }
                            } />
                        <input classname="input" type="text" placeholder="username" id="username"
                            value={username} onChange={(e) => setusername(e.target.value)} />
                        <input classname="input" type="password" placeholder="Password" id="password" value={password}
                            maxLength={10}
                            onChange={(e) => {

                                setPassword(e.target.value);

                            }} />

                        <input classname="input" type="password" placeholder="Confirm Password" id="confirm" value={confirmPass}
                            maxLength={10}
                            onChange={(e) => {
                                const re = /^[A-Za-z0-9_]+$/;
                                if (e.target.value === "" || re.test(e.target.value)) {
                                    setConfirmPass(e.target.value);
                                }
                            }} />
                        <div className="inputs">
                            <label className="error">{nameError} {emailError} {numberError} {passError} {cpassError} {signUpError} {usernameError} </label>
                        </div>
                        <button className="submit" onClick={handleSignUp} >Login</button>
                        <p className='warning'>already have account? <span onClick={login}> Login Here!</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;