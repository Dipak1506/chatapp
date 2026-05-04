import React, { useEffect, useRef, useState } from 'react';

import Peer from 'simple-peer';
import { useSocket } from '../utils/SocketContext';

const AudioCall = ({ userId, partnerId, onEndCall }) => {
  const socket = useSocket();
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const userAudio = useRef();
  const partnerAudio = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        setStream(stream);
        if (userAudio.current) {
          userAudio.current.srcObject = stream;
        }
      });

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setReceivingCall(true);
      setCaller(callerName);
      setCallerSignal(signal);
    });

    // Automatically start the call when the component mounts
    callUser();

    return () => {
      // Clean up the call when the component unmounts
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: partnerId,
        signalData: data,
        from: userId,
        name: "Your Name"
      });
    });

    peer.on('stream', (stream) => {
      partnerAudio.current.srcObject = stream;
    });

    socket.on('callAccepted', (signal) => {
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
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (stream) => {
      partnerAudio.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const handleEndCall = () => {
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onEndCall();
  };

  return (
    <div>
      <audio playsInline ref={userAudio} autoPlay style={{display: "none"}} />
      <audio playsInline ref={partnerAudio} autoPlay style={{display: "none"}} />
      
      {receivingCall && !callAccepted && (
        <div>
          <h1>{caller} is calling...</h1>
          <button onClick={answerCall}>Answer</button>
        </div>
      )}

      {callAccepted && (
        <div>
          <h2>Call in progress</h2>
          <button onClick={handleEndCall}>End Call</button>
        </div>
      )}
    </div>
  );
};

export default AudioCall;