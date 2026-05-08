// import "../css/chats.css";
// import React, { useEffect, useState } from "react";
// import "bootstrap/dist/css/bootstrap.css";
// import SideContent from "../components/SideContent";
// import ChatsInnerContent from "../components/ChatsInnerContent";
// import apiConfig from '../utils/apiConfig';
// import { useSocket } from "../utils/SocketContext";


// const Chats = (props) => {
//   const [userData, setUserData] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [receiverId, setReceiverId] = useState(null);
//   const [roomId, setRoomId] = useState(null);
//   const [isGroupChat, setIsGroupChat] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [isgroup, setIsGroup] = useState(false);

//   const socket = useSocket();

//   useEffect(() => {
//     const getGroups = async () => {
//       await apiConfig.get("getGroupChats")
//       .then(response => {setGroups(response.data.data);console.log("groups",groups);})
//       .catch(err => console.log(err)) 
//     }
//     getGroups();
//   },[props.user])

//   function isUserInGroup(group, userId) {
//     const members = groups.members.map(member => JSON.parse(member));
//     return members.some(member => member.id === userId);
// }

//   useEffect(() => {
//     setMessages([]);

//     apiConfig.get('/getmessages', {
//       params: {
//         userId: props.userId,
//         selectedUserId: receiverId,
//       },
//     })
//       .then(response => {
//         if (response.data) {
//           setMessages(response.data.data);
//           console.log("messages", response.data.data);
//         }
//       })
//       .catch(error => console.error('Error fetching data:', error));
//   }, [receiverId, props.userId]);


//   useEffect(() => {
//     apiConfig.get('/getusers')
//         .then(response => {
//             if (response.data && Array.isArray(response.data.data)) {
//                  const loggedInUserId = props.userId; 
//                 const filteredUsers = response.data.data.filter(user => user.id !== loggedInUserId);
//                 // console.log("filteredUsers",filteredUsers);
//                 setUserData(filteredUsers);
//             } else {
//                 setUserData([]); 
//             }
//         })
//         .catch(error => console.error('Error fetching data:', error));

// }, []);

// const handleGroupChatCreation = async (selectedUsers) => {
//   const roomName = selectedUsers.map(user => user.username).sort().join('-');
//   socket.emit("joinRoom ", roomName);
//   props.setRoom(roomName);
//   setReceiverId(selectedUsers.map(user => user.id));
//   const isGroup = true;
//   try {
//     const response = await apiConfig.get('/createroom', {
//       params: {
//         room_name: roomName,
//         isgroup: isGroup,
//       },
//     });
//     if (response.data.status === 200) {
//       setRoomId(response.data.data.room_id);
//       setIsGroupChat(true);

//       apiConfig.get("/createGroups", {
//         params: {
//           room_id: response.data.data.room_id,
//           members: selectedUsers,
//           group_name: roomName
//         }
//       })
//     } else {
//       console.error('Error creating or fetching room:', response.data.msg);
//     }
//   } catch (error) {
//     console.error('Error creating or fetching room:', error);
//   }
// };

// const handleGroupNameUpdate = (newGroupName) => {
//   setGroups(prevGroups => 
//     prevGroups.map(group => 
//       group.room_id === roomId ? { ...group, group_name: newGroupName } : group
//     )
//   );
//   setSelectedUser(newGroupName);
// };



//   return (
//     <div className="main">
//       <div className="row chat">
//         <div className="col-md-3">
//           <SideContent 
//             user={props.user}
//             setIsLogIn={props.setIsLogIn}
//             room={props.room}
//             setRoom={props.setRoom}
//             userData={userData}
//             setUserData={setUserData}
//             setSelectedUser={setSelectedUser} 
//             userId={props.userId}
//             setReceiverId={setReceiverId}
//             setRoomId={setRoomId}
//             messages={messages}
//             setMessages={setMessages}
//             receiverId={receiverId}
//             handleGroupChatCreation={handleGroupChatCreation}
//             isGroupChat={isGroupChat}
//             groups={groups}
//             setIsGroup={setIsGroup}
//           />
//         </div>
//         <div className="col-md-9">
//           <ChatsInnerContent 
//             user={props.user}
//             setIsLogIn={props.setIsLogIn}
//             room={props.room}
//             setRoom={props.setRoom}
//             userData={userData}
//             selectedUser={selectedUser} 
//             userId={props.userId}
//             receiverId={receiverId}
//             roomId={roomId}
//             messages={messages}
//             setMessages={setMessages}
//             isgroup={isgroup}
//             onGroupNameUpdate={handleGroupNameUpdate}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chats;

import "../css/chats.css";
import React, { useEffect, useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.css";
import SideContent from "../components/SideContent";
import ChatsInnerContent from "../components/ChatsInnerContent";
import apiConfig from '../utils/apiConfig';
import { useSocket } from "../utils/SocketContext";


const Chats = (props) => {
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isgroup, setIsGroup] = useState(false);

  const socket = useSocket();

  // BUG FIX: extracted so it can be called after group creation too
  const fetchGroups = useCallback(async () => {
    try {
      const response = await apiConfig.get("getGroupChats");
      if (response.data && response.data.data) {
        setGroups(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, props.user]);

  useEffect(() => {
    setMessages([]);
    if (!receiverId) return;

    apiConfig.get('/getmessages', {
      params: {
        userId: props.userId,
        selectedUserId: receiverId,
      },
    })
      .then(response => {
        if (response.data) {
          setMessages(response.data.data);
        }
      })
      .catch(error => console.error('Error fetching messages:', error));
  }, [receiverId, props.userId]);

  useEffect(() => {
    apiConfig.get('/getusers')
      .then(response => {
        if (response.data && Array.isArray(response.data.data)) {
          const filteredUsers = response.data.data.filter(user => user.id !== props.userId);
          setUserData(filteredUsers);
        } else {
          setUserData([]);
        }
      })
      .catch(error => console.error('Error fetching users:', error));
  }, [props.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGroupChatCreation = async (selectedUsers) => {
    const roomName = selectedUsers.map(user => user.username).sort().join('-');

    // BUG FIX: was "joinRoom " (trailing space)
    socket.emit("joinRoom", roomName);
    props.setRoom(roomName);
    setReceiverId(null); // groups don't use a single receiverId
    const isGroup = true;

    try {
      const response = await apiConfig.get('/createroom', {
        params: {
          room_name: roomName,
          isgroup: isGroup,
        },
      });

      if (response.data.status === 200) {
        const newRoomId = response.data.data.room_id;
        setRoomId(newRoomId);
        setIsGroupChat(true);

        // BUG FIX: members must be JSON-serialised — passing raw objects as query
        // params makes axios encode them as members[0][id]=…, which the backend
        // receives as garbage and stores incorrectly.
        await apiConfig.get("/createGroups", {
          params: {
            room_id: newRoomId,
            members: JSON.stringify(selectedUsers),
            group_name: roomName
          }
        });

        // BUG FIX: refresh the groups list so the new group appears immediately
        await fetchGroups();

        // Open the new group chat right away
        setSelectedUser(roomName);
        setIsGroup(true);
      } else {
        console.error('Error creating or fetching room:', response.data.msg);
      }
    } catch (error) {
      console.error('Error creating group room:', error);
    }
  };

  const handleGroupNameUpdate = (newGroupName) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.room_id === roomId ? { ...group, group_name: newGroupName } : group
      )
    );
    setSelectedUser(newGroupName);
  };

  return (
    <div className="main">
      <div className="row chat">
        <div className="col-md-3">
          <SideContent
            user={props.user}
            setIsLogIn={props.setIsLogIn}
            room={props.room}
            setRoom={props.setRoom}
            userData={userData}
            setUserData={setUserData}
            setSelectedUser={setSelectedUser}
            userId={props.userId}
            setReceiverId={setReceiverId}
            setRoomId={setRoomId}
            messages={messages}
            setMessages={setMessages}
            receiverId={receiverId}
            handleGroupChatCreation={handleGroupChatCreation}
            isGroupChat={isGroupChat}
            groups={groups}
            setIsGroup={setIsGroup}
          />
        </div>
        <div className="col-md-9">
          <ChatsInnerContent
            user={props.user}
            setIsLogIn={props.setIsLogIn}
            room={props.room}
            setRoom={props.setRoom}
            userData={userData}
            selectedUser={selectedUser}
            userId={props.userId}
            receiverId={receiverId}
            roomId={roomId}
            messages={messages}
            setMessages={setMessages}
            isgroup={isgroup}
            onGroupNameUpdate={handleGroupNameUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default Chats;
