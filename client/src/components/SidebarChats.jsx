// import apiConfig from "../utils/apiConfig";
// import AvatarComponent from "../utils/Avatar";
// import { useSocket } from "../utils/SocketContext";
// import { useCallback, useEffect, useState } from "react";
// import "../css/sidebar-chats.css";

// const SidebarChats = ({ user, setRoom, userData, userId, setSelectedUser, setReceiverId, setRoomId, messages, groups, setIsGroup }) => {
//     const socket = useSocket();
//     const [lastMessages, setLastMessages] = useState({});
//     const [filteredGroups, setFilteredGroups] = useState([]);

//     useEffect(() => {

//         const fetchGroups = async () => {
//             const groupsWithUser = groups.filter(group => {
//                 const members = group.members.map(member => JSON.parse(member));
//                 return members.some(member => member.id === userId);
//             });
//             setFilteredGroups(groupsWithUser);
//         };

//         fetchGroups();
//     }, [groups, userId]);

//     const formatTime = (time24) => {

//         if (!time24) {
//             return '';
//         }

//         const [hours, minutes, seconds] = time24.split(':');
//         let formattedTime = '';

//         let hour = parseInt(hours, 10);
//         const ampm = hour >= 12 ? 'PM' : 'AM';
//         hour = hour % 12;
//         hour = hour ? hour : 12;
//         formattedTime = `${hour}:${minutes} ${ampm}`;

//         return formattedTime;
//     };

//     // const fetchLastMessages = useCallback(async () => {
//     //     try {
//     //         const response = await apiConfig.get('/lastMessages', {
//     //             params: { userId }
//     //         });
//     //         if (response.data.status === 200) {
//     //             const messages = response.data.data.reduce((acc, msg) => {
//     //                 acc[msg.other_user_id] = {
//     //                     ...msg,
//     //                     unread_count: msg.unread_count || 0
//     //                 };
//     //                 return acc;
//     //             }, {});
//     //             setLastMessages(messages);
//     //             console.log("last msgs:", messages);


//     //         }
//     //     } catch (error) {
//     //         console.error('Error fetching last messages:', error);
//     //     }
//     // }, [userId]);
//     const fetchLastMessages = useCallback(async () => {
//         try {
//             const response = await apiConfig.get('/lastMessages', {
//                 params: { userId, userId }
//             });
//             if (response.data.status === 200) {
//                 const messages = response.data.data.reduce((acc, msg) => {
//                     acc[msg.other_user_id] = {
//                         ...msg,
//                         unread_count: msg.unread_count || 0
//                     };
//                     return acc;
//                 }, {});
//                 setLastMessages(messages);
//             }
//         } catch (error) {
//             console.error('Error fetching last messages:', error);
//         }
//     }, [userId, userId]);

//     useEffect(() => {
//         fetchLastMessages();
//     }, [fetchLastMessages]);

//     useEffect(() => {
//         socket.on('receiveMessage', () => {
//             fetchLastMessages();
//         });
//         return () => socket.off('receiveMessage');
//     }, [socket, fetchLastMessages]);



//     const roomSet = async (selectedUser) => {
//         const roomName = [user, selectedUser.username].sort().join('-');

//         try {
//             const response = await apiConfig.get('/createroom', {
//                 params: {
//                     room_name: roomName,
//                     isgroup: false
//                 }
//             });
//             if (response.data.status === 200) {
//                 const room_id = response.data.data.room_id;
//                 setRoomId(room_id);
//                 socket.emit("joinRoom", response.data.data.room_name);
//                 setRoom(response.data.data.room_name);
//                 setSelectedUser(selectedUser.username);
//                 setReceiverId(selectedUser.id);
//                 setIsGroup(false);
//             } else {
//                 console.error('Error creating or fetching room:', response.data.msg);
//             }
//         } catch (error) {
//             console.error('Error creating or fetching room:', error);
//         }

//         try {
//             await apiConfig.post('/markAsRead', {
//                 userId: userId,
//                 senderId: selectedUser.id
//             });
//             await fetchLastMessages(); 
//         } catch (error) {
//             console.error('Error marking messages as read:', error);
//         }

//         // setRoom(roomName);
//         // setSelectedUser(selectedUser.username);
//     };
//     return (
//         <div className='sidebar-chats'>
//             {filteredGroups.map(group => (
//                 <div className="item" key={group.room_id} onClick={() => {
//                     setSelectedUser(group.group_name);
//                     setReceiverId(group.group_id);
//                     setRoomId(group.room_id)
//                     setIsGroup(true)
//                 }}>
//                     <AvatarComponent username={group.group_name} className="img" />
//                     <div className="texts">
//                         <div className="texts-inner">
//                             <span className="side-username">{group.group_name}</span>
//                         </div>
//                         <span className="side-msg">{formatTime(lastMessages[group.room_id]?.message_time)}</span>
//                     </div>
//                 </div>
//             ))}

//             {Array.isArray(userData) && userData.map(selectedUser => {
//                 const lastMessage = lastMessages[selectedUser.id];
//                 console.log("lastmsg -----", lastMessage);

//                 const hasUnread = lastMessage && lastMessage.unread_count && lastMessage.unread_count > 0;
//                 console.log("unread----", hasUnread);

//                 return (
//                     <div className={`item ${hasUnread ? 'unread' : ''}`} key={selectedUser.id} onClick={() => roomSet(selectedUser)}>
//                         <AvatarComponent username={selectedUser.username} className="img" />
//                         <div className="texts">
//                             <div className="texts-inner">
//                                 <span className="side-username">{selectedUser.username}</span>
//                                 <span className="side-time">
//                                     {lastMessage ? formatTime(lastMessage.message_time) : ''}
//                                 </span>
//                             </div>
//                             <div className="last-message">
//                                 <span className="side-msg">
//                                     {lastMessage ? lastMessage.messages : ''}
//                                 </span>
//                                 {hasUnread && (
//                                     <span className="unread-indicator">{lastMessage.unread_count}</span>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 );
//             })}


//         </div>
//     );
// };

// export default SidebarChats;

import apiConfig from "../utils/apiConfig";
import AvatarComponent from "../utils/Avatar";
import { useSocket } from "../utils/SocketContext";
import { useCallback, useEffect, useState } from "react";
import "../css/sidebar-chats.css";
import { formatTime } from "../utils/comman";

const SidebarChats = ({ user, setRoom, userData, userId, setSelectedUser, setReceiverId, setRoomId, messages, groups, setIsGroup }) => {
    const socket = useSocket();
    const [lastMessages, setLastMessages] = useState({});
    const [filteredGroups, setFilteredGroups] = useState([]);

    useEffect(() => {
        if (!groups || !Array.isArray(groups)) return;

        const groupsWithUser = groups.filter(group => {
            try {
                // members may be a JSON string, a JSON array of strings, or a plain array
                let members = group.members;

                if (typeof members === 'string') {
                    // stored as a single JSON blob e.g. '[{"id":1,...}]'
                    members = JSON.parse(members);
                }

                if (!Array.isArray(members)) return false;

                return members.some(member => {
                    // each element may itself be a JSON string
                    const m = typeof member === 'string' ? JSON.parse(member) : member;
                    // compare as numbers to avoid "1" !== 1 mismatch
                    return Number(m.id) === Number(userId);
                });
            } catch (e) {
                return false;
            }
        });

        setFilteredGroups(groupsWithUser);
    }, [groups, userId]);

    const fetchLastMessages = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await apiConfig.get('/lastMessages', {
                params: { userId }
            });
            if (response.data.status === 200) {
                // BUG FIX: store keys as strings so lookups against selectedUser.id
                // (which Postgres may return as a number) always match
                const msgs = response.data.data.reduce((acc, msg) => {
                    acc[String(msg.other_user_id)] = {
                        ...msg,
                        unread_count: Number(msg.unread_count) || 0
                    };
                    return acc;
                }, {});
                setLastMessages(msgs);
            }
        } catch (error) {
            console.error('Error fetching last messages:', error);
        }
    }, [userId]);

    useEffect(() => {
        fetchLastMessages();
    }, [fetchLastMessages]);

    // Re-fetch whenever any message arrives so the sidebar stays live
    useEffect(() => {
        const handler = () => fetchLastMessages();
        socket.on('receiveMessage', handler);
        return () => socket.off('receiveMessage', handler);
    }, [socket, fetchLastMessages]);

    const roomSet = async (selectedUser) => {
        const roomName = [user, selectedUser.username].sort().join('-');

        try {
            const response = await apiConfig.get('/createroom', {
                params: { room_name: roomName, isgroup: false }
            });
            if (response.data.status === 200) {
                setRoomId(response.data.data.room_id);
                socket.emit("joinRoom", response.data.data.room_name);
                setRoom(response.data.data.room_name);
                setSelectedUser(selectedUser.username);
                setReceiverId(selectedUser.id);
                setIsGroup(false);
            } else {
                console.error('Error creating or fetching room:', response.data.msg);
            }
        } catch (error) {
            console.error('Error creating or fetching room:', error);
        }

        try {
            await apiConfig.post('/markAsRead', {
                userId: userId,
                senderId: selectedUser.id
            });
            await fetchLastMessages();
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    return (
        <div className='sidebar-chats'>
            {filteredGroups.map(group => (
                <div className="item" key={group.room_id} onClick={() => {
                    setSelectedUser(group.group_name);
                    setReceiverId(group.room_id);   // use room_id for group messaging
                    setRoomId(group.room_id);
                    setIsGroup(true);
                    socket.emit("joinRoom", String(group.room_id));
                }}>
                    <AvatarComponent username={group.group_name} className="img" />
                    <div className="texts">
                        <div className="texts-inner">
                            <span className="side-username">{group.group_name}</span>
                        </div>
                        <span className="side-msg">
                            {lastMessages[String(group.room_id)]
                                ? formatTime(lastMessages[String(group.room_id)].message_time)
                                : ''}
                        </span>
                    </div>
                </div>
            ))}

            {Array.isArray(userData) && userData.map(selectedUser => {
                // BUG FIX: stringify the id so it matches the keys built above
                const lastMessage = lastMessages[String(selectedUser.id)];
                const hasUnread = lastMessage && lastMessage.unread_count > 0;

                return (
                    <div
                        className={`item ${hasUnread ? 'unread' : ''}`}
                        key={selectedUser.id}
                        onClick={() => roomSet(selectedUser)}
                    >
                        <AvatarComponent username={selectedUser.username} className="img" />
                        <div className="texts">
                            <div className="texts-inner">
                                <span className="side-username">{selectedUser.username}</span>
                                <span className="side-time">
                                    {lastMessage ? formatTime(lastMessage.message_time) : ''}
                                </span>
                            </div>
                            <div className="last-message">
                                <span className="side-msg">
                                    {lastMessage ? lastMessage.messages : ''}
                                </span>
                                {hasUnread && (
                                    <span className="unread-indicator">{lastMessage.unread_count}</span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SidebarChats;
