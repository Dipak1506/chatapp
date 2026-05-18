import apiConfig from "../utils/apiConfig";
import AvatarComponent from "../utils/Avatar";
import { useSocket } from "../utils/SocketContext";
import { useCallback, useEffect, useState } from "react";
import "../css/sidebar-chats.css";
import { formatTime } from "../utils/comman";

const SidebarChats = ({
  user, setRoom, userData, userId, setSelectedUser, setReceiverId,
  setRoomId, messages, groups, setIsGroup, switchRoom}) => {
  const socket = useSocket();
  const [lastMessages, setLastMessages] = useState({});
  const [filteredGroups, setFilteredGroups] = useState([]);

  // ── Filter groups the current user belongs to ────────────────────────────
  useEffect(() => {
    if (!groups || !Array.isArray(groups)) return;

    const groupsWithUser = groups.filter(group => {
      try {
        let members = group.members;
        if (typeof members === 'string') members = JSON.parse(members);
        if (!Array.isArray(members)) return false;
        return members.some(m => {
          const member = typeof m === 'string' ? JSON.parse(m) : m;
          return Number(member.id) === Number(userId);
        });
      } catch {
        return false;
      }
    });

    setFilteredGroups(groupsWithUser);
  }, [groups, userId]);

  // ── Fetch last messages for the sidebar preview ──────────────────────────
  const fetchLastMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await apiConfig.get('/lastMessages', { params: { userId } });
      if (response.data.status === 200) {
        const msgs = response.data.data.reduce((acc, msg) => {
          acc[String(msg.other_user_id)] = {
            ...msg,
            unread_count: Number(msg.unread_count) || 0,
          };
          return acc;
        }, {});
        setLastMessages(msgs);
      }
    } catch (error) {
      console.error('Error fetching last messages:', error);
    }
  }, [userId]);

  useEffect(() => { fetchLastMessages(); }, [fetchLastMessages]);

  useEffect(() => {
    const handler = () => fetchLastMessages();
    socket.on('receiveMessage', handler);
    return () => socket.off('receiveMessage', handler);
  }, [socket, fetchLastMessages]);

  // ── Open a DM conversation ───────────────────────────────────────────────
  const roomSet = async (selectedUser) => {
    const roomName = [user, selectedUser.username].sort().join('-');

    try {
      const response = await apiConfig.get('/createroom', {
        params: { room_name: roomName, isgroup: false },
      });
      if (response.data.status === 200) {
        setRoomId(response.data.data.room_id);
        switchRoom(response.data.data.room_name);
        setSelectedUser(selectedUser.username);
        setReceiverId(selectedUser.id);
        setIsGroup(false);
      } else {
        console.log("error in switchroom",response.data.data.room_name,"data:",response.data);
        console.log('Error creating/fetching room:', response.data.msg);
      }
    } catch (error) {
      console.error('Error creating/fetching room:', error);
    }

    try {
      await apiConfig.post('/markAsRead', { userId, senderId: selectedUser.id });
      await fetchLastMessages();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return (
    <div className='sidebar-chats'>
      {/* ── Group list ──────────────────────────────────────────────── */}
      {filteredGroups.map(group => (
        <div
          className="item"
          key={group.room_id}
          onClick={() => {
            setSelectedUser(group.group_name);
            setReceiverId(group.room_id);   // room_id used for group messaging
            setRoomId(group.room_id);
            setIsGroup(true);
            switchRoom(String(group.room_id)); // leave old room, join group room
          }}
        >
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

      {/* ── DM list ─────────────────────────────────────────────────── */}
      {Array.isArray(userData) && userData.map(selectedUser => {
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
