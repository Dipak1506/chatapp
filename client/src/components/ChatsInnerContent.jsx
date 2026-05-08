
import React, { useEffect, useState, useRef } from 'react';
import "../css/chatInner.css";
import { Info, Lock, Mic, Phone, PhoneOff, Plus, Send, Smile, Video, VideoOff } from 'react-feather';
import EmojiPicker from 'emoji-picker-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faCircleXmark, faFile, faPhotoFilm } from '@fortawesome/free-solid-svg-icons';
import { useSocket } from '../utils/SocketContext';
import AvatarComponent from '../utils/Avatar';
import apiConfig from '../utils/apiConfig';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import Peer from 'simple-peer';
import { toast } from 'react-toastify';
import { formatTime } from '../utils/comman';

const CALL_STATUS = {
  IDLE: 'idle', CALLING: 'calling', INCOMING: 'incoming', IN_CALL: 'in-call',
};

const ChatsInnerContent = ({ user, room, selectedUser, userId, receiverId, roomId,
  messages, setMessages, isgroup, onGroupNameUpdate }) => {
  const img = require("../Assets/wa669aeJeom.png");
  const socket = useSocket();

  const [isTyping, setIsTyping]         = useState(false);
  const [emoji, setEmoji]               = useState(true);
  const [text, setText]                 = useState("");
  const [plusDropdown, setPlusDropdown] = useState(false);
  const [showCamera, setShowCamera]     = useState(false);
  const [image, setImage]               = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [changeName, setChangename]     = useState(false);
  const [newGroupname, setNewgroupName] = useState("");

  const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE);
  const [callType, setCallType]     = useState('audio');
  const [stream, setStream]         = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);

  const myAudio       = useRef();
  const userAudio     = useRef();
  const myVideo       = useRef();
  const remoteVideo   = useRef();
  const connectionRef = useRef();
  const streamRef     = useRef(null);

  const fileInputRefDocument = useRef(null);
  const fileInputRefPhoto    = useRef(null);
  const videoRef             = useRef(null);

  useEffect(() => {
    if (userId) socket.emit('registerUser', userId);
  }, [userId, socket]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      .then((s) => { setStream(s); streamRef.current = s; if (myAudio.current) myAudio.current.srcObject = s; })
      .catch((err) => console.warn("Mic access denied:", err.message));

    const handleIncomingCall    = ({ signal, from, callerName, callType: ct }) => { setCallerInfo({ signal, from, callerName, callType: ct || 'audio' }); setCallType(ct || 'audio'); setCallStatus(CALL_STATUS.INCOMING); };
    const handleCallAccepted    = (signal) => { setCallStatus(CALL_STATUS.IN_CALL); if (connectionRef.current) connectionRef.current.signal(signal); };
    const handleCallRejected    = () => { toast.info("Call was declined."); cleanupCall(); };
    const handleCallEnded       = () => { toast.info("Call ended."); cleanupCall(); };
    const handleCallUnavailable = () => { toast.warning("User is not available right now."); cleanupCall(); };

    socket.on('incomingCall',    handleIncomingCall);
    socket.on('callAccepted',    handleCallAccepted);
    socket.on('callRejected',    handleCallRejected);
    socket.on('callEnded',       handleCallEnded);
    socket.on('callUnavailable', handleCallUnavailable);

    return () => {
      socket.off('incomingCall',    handleIncomingCall);
      socket.off('callAccepted',    handleCallAccepted);
      socket.off('callRejected',    handleCallRejected);
      socket.off('callEnded',       handleCallEnded);
      socket.off('callUnavailable', handleCallUnavailable);
    };
  }, [socket]);

  useEffect(() => {
    if (callType === 'video' && streamRef.current && myVideo.current) {
      myVideo.current.srcObject = streamRef.current;
    }
  }, [callType, callStatus]);

  useEffect(() => {
    if (room) socket.emit('joinRoom', room);
    const handleMessage = (msg) => {
      if (msg.room && msg.room !== room) return;
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('receiveMessage', handleMessage);
    return () => {
      if (room) socket.emit('leaveRoom', room);
      socket.off('receiveMessage', handleMessage);
    };
  }, [room, socket]);

  // ── Call helpers ──────────────────────────────────────────────────────────
  const cleanupCall = () => {
    if (connectionRef.current) { connectionRef.current.destroy(); connectionRef.current = null; }
    if (streamRef.current) streamRef.current.getVideoTracks().forEach(t => t.stop());
    if (myVideo.current)     myVideo.current.srcObject     = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;
    if (userAudio.current)   userAudio.current.srcObject   = null;
    setCallStatus(CALL_STATUS.IDLE); setCallerInfo(null); setCallType('audio');
  };

  const getMediaStream = async (type) => {
    const constraints = type === 'video'
      ? { audio: true, video: { width: 640, height: 480 } }
      : { audio: true, video: false };
    const s = await navigator.mediaDevices.getUserMedia(constraints);
    setStream(s); streamRef.current = s;
    return s;
  };

  const callUser = async (type = 'audio') => {
   
    if (isgroup) {
      toast.info("Calls are only available in direct messages.");
      return;
    }

    if (!receiverId) return;
    setCallType(type);
    setCallStatus(CALL_STATUS.CALLING);

    let activeStream;
    try { activeStream = await getMediaStream(type); }
    catch (err) {
      toast.error(`Could not access ${type === 'video' ? 'camera/microphone' : 'microphone'}.`);
      setCallStatus(CALL_STATUS.IDLE); return;
    }

    const peer = new Peer({ initiator: true, trickle: false, stream: activeStream });
    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: receiverId, signalData: data, from: userId, callerName: user, callType: type });
    });
    peer.on('stream', (remoteStream) => {
      if (type === 'video' && remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
      else if (userAudio.current) userAudio.current.srcObject = remoteStream;
    });
    peer.on('error', (err) => { console.error(err); cleanupCall(); });
    connectionRef.current = peer;
  };

  const answerCall = async () => {
    const type = callerInfo?.callType || 'audio';
    setCallType(type); setCallStatus(CALL_STATUS.IN_CALL);

    let activeStream;
    try { activeStream = await getMediaStream(type); }
    catch (err) { toast.error(`Could not access ${type === 'video' ? 'camera/microphone' : 'microphone'}.`); cleanupCall(); return; }

    const peer = new Peer({ initiator: false, trickle: false, stream: activeStream });
    peer.on('signal', (data) => socket.emit('answerCall', { signal: data, to: callerInfo.from }));
    peer.on('stream', (remoteStream) => {
      if (type === 'video' && remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
      else if (userAudio.current) userAudio.current.srcObject = remoteStream;
    });
    peer.on('error', (err) => { console.error(err); cleanupCall(); });
    peer.signal(callerInfo.signal);
    connectionRef.current = peer;
  };

  const rejectCall = () => { socket.emit('rejectCall', { to: callerInfo.from }); cleanupCall(); };
  const endCall    = () => { socket.emit('endCall', { to: callerInfo ? callerInfo.from : receiverId }); cleanupCall(); toast.info("Call ended."); };
  const cancelCall = () => { socket.emit('endCall', { to: receiverId }); cleanupCall(); };

  // ── Messaging ─────────────────────────────────────────────────────────────
  const sendMessage = async (fileUrl = null) => {
    const messageContent = fileUrl || text.trim();
    if (!messageContent) return;
    if (!fileUrl) { setText(""); setIsTyping(false); }
    setSelectedFile(null);
    try {
      const response = await apiConfig.post('/savemessages', {
        sender_id: userId, receiver_id: receiverId, room_id: roomId,
        messages: messageContent, is_read: false,
      });
      const message_time = response.data.message_time;
      const socketMessage = fileUrl
        ? { user, text: null, file: fileUrl, message_time, room }
        : { user, text, file: null, message_time, room };
      socket.emit('sendMessage', { room, message: socketMessage });
    } catch (error) { console.error('Error saving message:', error); }
  };

  const handleEmoji      = (e) => setText((prev) => prev + e.emoji);
  const handleClick      = (ref) => { if (ref.current) ref.current.click(); };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const formData = new FormData();
    formData.append('image', file);
    apiConfig.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(res => { setPlusDropdown(false); sendMessage(res.data.imageUrl); })
      .catch(() => toast.error("File upload failed"));
    event.target.value = '';
  };

  const startCamera = () => {
    setEmoji(true); setPlusDropdown(false);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => { if (videoRef.current) videoRef.current.srcObject = s; })
      .catch(err => console.error('Camera error:', err));
  };
  const closeCamera = () => {
    setShowCamera(false);
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
  };
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width  = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      setImage(canvas.toDataURL('image/jpeg')); setShowCamera(false);
    }
  };

  const getMessageAlignment = (mid) => mid === parseInt(userId) || mid === user ? 'rightchat' : 'leftchat';
  const handleKeyDown = (e, cb) => { if (e.key === 'Enter') cb(); };
  const updateName = () => {
    apiConfig.get("/updatename", { params: { room_id: roomId, new_group_name: newGroupname } })
      .then(res => {
        if (res.data.data.rowCount > 0) {
          onGroupNameUpdate(newGroupname);
          toast.success("Group name changed");
          setChangename(false); setNewgroupName("");
        }
      })
      .catch(err => console.error("Error updating group name:", err));
  };

  
  const callsAllowed = !isgroup && callStatus === CALL_STATUS.IDLE;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    selectedUser ? (
      <div className='chatInner'>
        <audio ref={myAudio}   autoPlay muted style={{ display: 'none' }} />
        <audio ref={userAudio} autoPlay       style={{ display: 'none' }} />

        {/* Incoming call banner */}
        {callStatus === CALL_STATUS.INCOMING && callerInfo && (
          <div className="caller">
            <p>{callerInfo.callType === 'video' ? '🎥' : '📞'} <strong>{callerInfo.callerName || 'Someone'}</strong> is calling…</p>
            <button onClick={answerCall}>Answer</button>
            <button onClick={rejectCall}>Decline</button>
          </div>
        )}

        {/* Video call overlay */}
        {(callStatus === CALL_STATUS.CALLING || callStatus === CALL_STATUS.IN_CALL) && callType === 'video' && (
          <div className='videoOverlay' style={S.videoOverlay}>
            <video ref={remoteVideo} autoPlay playsInline style={S.remoteVideo} />
            <video ref={myVideo}     autoPlay playsInline muted style={S.localVideo} />
            <div className='videoControls' style={S.videoControls}>
              <p style={S.callName}>{selectedUser}</p>
              <p style={S.callSubtext}>{callStatus === CALL_STATUS.CALLING ? 'Calling…' : 'Video call in progress'}</p>
              <button style={S.endBtn} onClick={callStatus === CALL_STATUS.CALLING ? cancelCall : endCall}>
                <VideoOff size={20} /> {callStatus === CALL_STATUS.CALLING ? ' Cancel' : ' End Call'}
              </button>
            </div>
          </div>
        )}

        {/* Audio call overlay */}
        {(callStatus === CALL_STATUS.CALLING || callStatus === CALL_STATUS.IN_CALL) && callType === 'audio' && (
          <div className='audioOverlay' style={S.audioOverlay}>
            <AvatarComponent username={selectedUser} />
            <p style={S.callName}>{selectedUser}</p>
            <p style={S.callSubtext}>{callStatus === CALL_STATUS.CALLING ? 'Calling…' : 'Call in progress'}</p>
            <button style={S.endBtn} onClick={callStatus === CALL_STATUS.CALLING ? cancelCall : endCall}>
              <PhoneOff size={22} /> {callStatus === CALL_STATUS.CALLING ? ' Cancel' : ' End Call'}
            </button>
          </div>
        )}

        {/* Top bar */}
        <div className="top">
          <div className="user">
            <AvatarComponent username={selectedUser} className="Avatar" />
            <div className="texts">
              {changeName
                ? <input type='text' className='changename-input' onChange={(e) => setNewgroupName(e.target.value)} onKeyDown={(e) => handleKeyDown(e, updateName)} />
                : <span className='user'>{selectedUser}</span>
              }
              {isgroup && <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#777879", cursor: 'pointer' }} onClick={() => setChangename(true)} />}
            </div>
          </div>
          <div className="icons">
           
            <Phone
              title={isgroup ? "Calls not available in groups" : "Audio Call"}
              style={callsAllowed ? S.callIconActive : S.callIconDisabled}
              onClick={() => callsAllowed && callUser('audio')}
            />
            <Video
              title={isgroup ? "Calls not available in groups" : "Video Call"}
              style={callsAllowed ? S.callIconActive : S.callIconDisabled}
              onClick={() => callsAllowed && callUser('video')}
            />
            <Info />
          </div>
        </div>

        {/* Messages */}
        <div className="centerChat" onClick={() => { setIsTyping(false); setPlusDropdown(false); setEmoji(true); }}>
          {showCamera && (
            <div className='video-block'>
              <FontAwesomeIcon className='closeIcon' icon={faCircleXmark} style={{ color: "#908989" }} onClick={closeCamera} />
              <video ref={videoRef} width="100%" height="auto" autoPlay />
              <div className="cameraIcon" onClick={capturePhoto}><FontAwesomeIcon className="camera" icon={faCamera} /></div>
            </div>
          )}
          {Array.isArray(messages) && messages.slice(0).reverse().map((msg, index) => (
            <div className={`message ${getMessageAlignment(msg.sender_id ?? msg.user)}`} key={index}>
              <div className="message-texts">
                {msg.text     && <div className='txt'><p>{msg.text}</p></div>}
                {msg.messages && <p>{msg.messages}</p>}
                {msg.file && (
                  <div className="file-message">
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(msg.file)
                      ? <img src={`http://localhost:5500${msg.file}`} alt="shared" className="chat-image" />
                      : <a href={`http://localhost:5500${msg.file}`} target="_blank" rel="noopener noreferrer">{msg.file.split('/').pop()}</a>}
                  </div>
                )}
                <span className='time'>{formatTime(msg.message_time)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="emoji">{!emoji && <EmojiPicker className='picker' onEmojiClick={handleEmoji} />}</div>

        {plusDropdown && (
          <div className="plusDropdown">
            <div className="menuItem" onClick={() => handleClick(fileInputRefDocument)}>
              <FontAwesomeIcon icon={faFile} style={{ color: "#B197FC" }} />
              <input type='file' ref={fileInputRefDocument} className='fileInput' onChange={handleFileChange} /><p>Document</p>
            </div>
            <div className="menuItem" onClick={() => handleClick(fileInputRefPhoto)}>
              <FontAwesomeIcon icon={faPhotoFilm} style={{ color: "#74C0FC" }} />
              <input type='file' ref={fileInputRefPhoto} className='fileInput' accept="image/*,video/*" onChange={handleFileChange} /><p>Photo/Video</p>
            </div>
            <div className="menuItem" onClick={() => { startCamera(); setShowCamera(true); }}>
              <FontAwesomeIcon icon={faCamera} style={{ color: "#ff2483" }} /><p>Camera</p>
            </div>
          </div>
        )}

        <div className="bottom">
          <Smile onClick={() => { setEmoji(!emoji); setPlusDropdown(false); }} />
          <Plus  onClick={() => { setPlusDropdown(!plusDropdown); setEmoji(true); }} />
          <input
            type='text' value={text} className='msgInput' placeholder='Write your message..'
            onClick={() => { setIsTyping(true); setPlusDropdown(false); }}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, () => sendMessage())}
          />
          {isTyping || text ? <Send onClick={() => sendMessage()} /> : <Mic />}
        </div>
      </div>
    ) : (
      <div className='other'>
        <img src={img} className='chat-inner-img' alt='encryption' />
        <div className="details"><Lock /><p>Your personal messages are end-to-end encrypted</p></div>
      </div>
    )
  );
};

const S = {
  audioOverlay:    { position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(18,140,126,0.95)', zIndex:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, color:'#fff' },
  videoOverlay:    { position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'#1a1a2e', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' },
  remoteVideo:     { width:'100%', height:'100%', objectFit:'cover' },
  localVideo:      { position:'absolute', bottom:80, right:16, width:140, height:100, borderRadius:10, objectFit:'cover', border:'2px solid rgba(255,255,255,0.8)', backgroundColor:'#000', zIndex:10 },
  videoControls:   { position:'absolute', bottom:0, left:0, right:0, display:'flex', flexDirection:'column', alignItems:'center', paddingBottom:20, gap:6, background:'linear-gradient(transparent,rgba(0,0,0,0.75))', zIndex:10 },
  callName:        { fontSize:22, fontWeight:600, margin:0, color:'#fff' },
  callSubtext:     { fontSize:14, opacity:0.8, margin:0, color:'#fff' },
  endBtn:          { marginTop:10, display:'flex', alignItems:'center', gap:8, background:'#e53935', color:'#fff', border:'none', borderRadius:24, padding:'10px 28px', fontSize:15, fontWeight:600, cursor:'pointer' },
  // Call icon styles — two states so logic and appearance share one source of truth
  callIconActive:  { cursor:'pointer' },
  callIconDisabled:{ opacity:0.35, cursor:'not-allowed' },
};

export default ChatsInnerContent;