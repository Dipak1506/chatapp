import React, { useEffect, useState, useRef } from 'react';
import "../css/chatInner.css";
import { Crosshair, Edit, Info, Lock, Mic, Phone, Plus, Send, Smile, Video } from 'react-feather';
import EmojiPicker from 'emoji-picker-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faCircleXmark, faFile, faPhotoFilm } from '@fortawesome/free-solid-svg-icons';
import { useSocket } from '../utils/SocketContext';
import AvatarComponent from '../utils/Avatar';
import apiConfig from '../utils/apiConfig';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import AudioCall from './AudioCall';
import Peer from 'simple-peer';
import { toast } from 'react-toastify';

const ChatsInnerContent = ({ user, room, selectedUser, userId, receiverId, roomId, messages,
                             setMessages, isgroup, onGroupNameUpdate }) => {
  const img = require("../Assets/wa669aeJeom.png");
  const socket = useSocket();

  const [isTyping, setIsTyping] = useState(false);
  const [emoji, setEmoji] = useState(true);
  const [text, setText] = useState("");
  const [plusDropdown, setPlusDropdown] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [changeName, setChangename] = useState(false);
  const [newGroupname, setNewgroupName] = useState("");

  const [isCallActive, setIsCallActive] = useState(false);

  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const myAudio = useRef();
  const userAudio = useRef();
  const connectionRef = useRef();

  const fileInputRefDocument = useRef(null);
  const fileInputRefPhoto = useRef(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const getCurrentTime = () => {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit' };
    return now.toLocaleTimeString([], options);
  };

  const formatTime = (time24) => {

    if (!time24) {
      return '';
    }

    const [hours, minutes, seconds] = time24.split(':');
    let formattedTime = '';

    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    formattedTime = `${hour}:${minutes} ${ampm}`;

    return formattedTime;
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myAudio.current) {
          myAudio.current.srcObject = currentStream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error.name, error.message);
      });


    socket.on("hey", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });
  }, []);

  useEffect(() => {
    if (room) {
      socket.emit('joinRoom', room);
    }

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [room, socket]);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: userId
      });
    });

    peer.on("stream", (currentStream) => {
      if (userAudio.current) {
        userAudio.current.srcObject = currentStream;
      }
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on("signal", (data) => {
      socket.emit("acceptCall", { signal: data, to: caller });
    });

    peer.on("stream", (currentStream) => {
      if (userAudio.current) {
        userAudio.current.srcObject = currentStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallAccepted(false);
    setReceivingCall(false);
    connectionRef.current.destroy();
  };




  const sendMessage = async () => {
    if (text.trim() || selectedFile) {
      // const message = { user, text, file: null };
      const message = { user, text, file: selectedFile ? selectedFile : null };

      socket.emit('sendMessage', { room, message });

      setText("");
      setSelectedFile(null);
      setIsTyping(false);

      try {
        await apiConfig.get('/savemessages', {
          params: {
            sender_id: userId,
            receiver_id: receiverId,
            room_id: roomId,
            messages: text,
            isread: false
          }
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      const formData = new FormData();
      formData.append('image', file);

      apiConfig.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        setPlusDropdown(false);
        const imageUrl = response.data.imageUrl;
        sendMessage(imageUrl);
      }).catch(error => {
        console.log('Error uploading file:', error);
      });
    }
  };

  const handleClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const startCamera = () => {
    setEmoji(true);
    setPlusDropdown(false);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error('Error accessing camera:', err));
  };

  const closeCamera = () => {
    setShowCamera(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const capturedImage = canvas.toDataURL('image/jpeg');
      setImage(capturedImage);
      setShowCamera(false);
    }
  };

  const getMessageAlignment = (messageUserId) => {
    if ((messageUserId === parseInt(userId)) || messageUserId === user) {
      return 'rightchat';
    } else {
      return 'leftchat';
    }
  };

  const handlePhoneClick = () => {
    setIsCallActive(true);
  };

  const endCall = () => {
    setIsCallActive(false);
  };

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter') {
      callback();
    }
  }

  const updateName = () => {
    apiConfig.get("/updatename", {
      params: {
        room_id: roomId,
        new_group_name: newGroupname
      }
    })
      .then(response => {
        if (response.data.data.rowCount > 0) {
          onGroupNameUpdate(newGroupname);
          toast.success("Groupname changed");
          setChangename(false);
          setNewgroupName("");
        }
      })
      .catch(err => console.log("Error updating group name:", err)
      )
  }


  return (
    selectedUser ? (
      <div className='chatInner'>
        <div className="top">
          <div className="user">
            <>
              <AvatarComponent username={selectedUser} className="Avatar" />
              <div className="texts">
                {changeName ?
                  <input type='text' className='changename-input'
                    onChange={(e) => setNewgroupName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, updateName)}
                  />
                  :
                  <span className='user'>{selectedUser}</span>
                }

                {isgroup ? <FontAwesomeIcon
                  icon={faPenToSquare}
                  style={{ color: "#777879" }}
                  onClick={() => setChangename(true)} /> : ""}
              </div>
            </>
          </div>
          <div className="icons">
            <Phone onClick={() => callUser(receiverId)} />
            {receivingCall && !callAccepted ? (
              <div className="caller">
                <h1>{caller} is calling...</h1>
                <button onClick={answerCall}>Answer</button>
              </div>
            ) : null}
            <Video />
            <Info />
          </div>
        </div>
        {isCallActive ? (
          <div className="callContainer">
            <AudioCall
              userId={userId}
              partnerId={receiverId}
              onEndCall={endCall}
            />
          </div>
        ) : (
          <div className="centerChat" onClick={() => { setIsTyping(false); setPlusDropdown(false); setEmoji(true) }}>
            {showCamera ?
              <div className='video-block'>
                <FontAwesomeIcon className='closeIcon'
                  icon={faCircleXmark}
                  style={{ color: "#908989" }}
                  onClick={() => { closeCamera() }}
                />
                <video ref={videoRef} width="100%" height="auto" autoPlay></video>
                <div className="cameraIcon" onClick={() => capturePhoto()}>
                  <FontAwesomeIcon className="camera" icon={faCamera} />
                </div>
              </div>
              :
              <></>}

            {Array.isArray(messages) && messages.slice(0).reverse().map((msg, index) => (
              <div className={`message ${getMessageAlignment(msg.sender_id ? msg.sender_id : msg.user)}`} key={index}>
                <div className="message-texts">
                  {msg.text && <div className='txt'><p >{msg.text}</p></div>}
                  {msg.messages && <p>{msg.messages}</p>}
                  {msg.file && (
                    <div className="file-message">
                      {msg.file.endsWith('.jpg') || msg.file.endsWith('.jpeg') || msg.file.endsWith('.png') ? (
                        <img src={msg.file} alt="Image" className="chat-image" />
                      ) : (
                        <a href={msg.file} target="_blank" rel="noopener noreferrer">
                          {msg.file.split('/').pop()}
                        </a>
                      )}
                    </div>
                  )}
                  <span className='time'>{msg.message_time ? formatTime(msg.message_time) : getCurrentTime()}</span>
                </div>
              </div>
            ))}

          </div>
        )}
        <div className="emoji">
          {emoji ? <></> : (
            <EmojiPicker
              className='picker'
              onEmojiClick={(e) => handleEmoji(e)}
            />
          )}
        </div>
        {plusDropdown && (
          <div className="plusDropdown">
            <div className="menuItem" onClick={() => handleClick(fileInputRefDocument)}>
              <FontAwesomeIcon icon={faFile} style={{ color: "#B197FC" }} />
              <input
                type='file'
                ref={fileInputRefDocument}
                className='fileInput'
                onChange={(event) => handleFileChange(event)}
                multiple
              />
              <p>Document</p>
            </div>
            <div className="menuItem" onClick={() => handleClick(fileInputRefPhoto)}>
              <FontAwesomeIcon icon={faPhotoFilm} style={{ color: "#74C0FC" }} />
              <input
                type='file'
                ref={fileInputRefPhoto}
                className='fileInput'
                onChange={(event) => handleFileChange(event)}
                multiple
              />
              <p>Photo/Video</p>
            </div>
            <div className="menuItem" onClick={() => setShowCamera(true)}>
              <FontAwesomeIcon icon={faCamera} style={{ color: "#ff2483" }} onClick={() => startCamera()} />
              <p>Camera</p>
            </div>
          </div>
        )}


        <div className="bottom">
          {/* <audio playsInline ref={myAudio} autoPlay />
          <audio playsInline ref={userAudio} autoPlay /> */}
          <Smile onClick={() => { setEmoji(!emoji); setPlusDropdown(false) }} />
          <Plus onClick={() => { setPlusDropdown(!plusDropdown); setEmoji(true) }} />
          <input
            type='text'
            value={text}
            className='msgInput'
            placeholder='Write your message..'
            onClick={() => { setIsTyping(true); setPlusDropdown(false) }}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, sendMessage)}
          />
          {isTyping ? <Send onClick={sendMessage} /> : <Mic />}
        </div>
      </div>
    ) :
      <div className='other'>
        <img src={img} className='chat-inner-img' alt='encryption' />
        <div className="details">
          <Lock />
          <p> Your personal messages are end-to-end encrypted </p>
        </div>
      </div>
  );
};

export default ChatsInnerContent;
