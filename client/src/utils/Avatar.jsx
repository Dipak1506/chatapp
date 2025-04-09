import React from 'react';
import Avatar from 'react-avatar';


const AvatarComponent = ({ username }) => (
    <Avatar name={username} size="35" round={true} className='avatar' />
);

export default AvatarComponent;
