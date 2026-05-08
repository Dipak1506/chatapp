import React, { useState } from 'react';
import { MessageSquare, MoreVertical, Search, Users } from 'react-feather';
import '../css/side-content.css';
import 'bootstrap/dist/css/bootstrap.css'
import AvatarComponent from '../utils/Avatar';
import SidebarChats from './SidebarChats';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import apiConfig from '../utils/apiConfig';





const SideContent = (props) => {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [groupChatUsers, setGroupChatUsers] = useState([]);
    const [isGroupChatCreation, setIsGroupChatCreation] = useState(false);



    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleGroupChatCreation = () => {
        // props.handleGroupChatCreation(groupChatUsers);
        // setIsGroupChatCreation(false);
        const allGroupUsers = [...groupChatUsers, { id: props.userId, username: props.user }];
        props.handleGroupChatCreation(allGroupUsers);
        setIsGroupChatCreation(false);
    };

    const handleUserSelection = (user) => {
        if (groupChatUsers.includes(user)) {
            setGroupChatUsers(groupChatUsers.filter(u => u !== user));
        } else {
            setGroupChatUsers([...groupChatUsers, user]);
        }
    };

    const logOut = async () => {

        await apiConfig.get("/auth/logout");
        sessionStorage.clear();
        props.setIsLogIn(false);
        window.location.reload();
        
    };

    return (
        <div className='side-content'>
            <div className="header">
                <div className="avatar-container">

                    <AvatarComponent username={props.user} className="avatar" />
                    <>  {props.user ? props.user : 'Guest'} </>
                </div>
                <div className="icons ">
                    <Users />
                    <MessageSquare />
                    <MoreVertical onClick={toggleDropdown} />
                </div>
            </div>
            {isDropdownOpen && (
                <div className="dropdown-content">
                    <p onClick={() => {setIsGroupChatCreation(true);setIsDropdownOpen(false)}}>New Group</p>
                    <p> Starred messages</p>
                    <p onClick={() => logOut()}>Log Out</p>
                </div>
            )}
            <div className="search">
                <div className="searchbar">
                    <Search />
                    <input className='searchInput' type='text' placeholder='search' />
                </div>

            </div>
            {isGroupChatCreation ? (
                <div className="group-chat-creation">
                    <h5>Select Users</h5>
                    {props.userData.map(user => (
                        <div key={user.id} className="user-selection">
                            <input
                                className='chkbox'
                                type="checkbox"
                                checked={groupChatUsers.includes(user)}
                                onChange={() => handleUserSelection(user)}
                            />
                            <span>{user.username}</span>
                        </div>
                    ))}
                    <button className="create-group-btn" onClick={()=>handleGroupChatCreation()}>
                        <FontAwesomeIcon icon={faPlus} /> Create Group
                    </button>
                </div>
            ) : <SidebarChats
                user={props.user}
                setRoom={props.setRoom}
                userData={props.userData}
                userId={props.userId}
                setSelectedUser={props.setSelectedUser}
                setReceiverId={props.setReceiverId}
                setRoomId={props.setRoomId}
                messages={props.messages}
                receiverId={props.receiverId}
                groups={props.groups}
                setIsGroup={props.setIsGroup}
            />}

        </div >
    )
}

export default SideContent;
