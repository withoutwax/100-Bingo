import React, { useState, useEffect} from 'react';
// import { socket } from '../service/socket';

// import io from 'socket.io-client';
// const SOCKET_URL = 'http://localhost:4000/';

// const socket = io(SOCKET_URL);

interface GamePlayerListProps {
    userLists: any[];
}

const GamePlayerList: React.FC<GamePlayerListProps> = ({ userLists }) => {
    console.log(userLists);
    return (
        <section>
            <p>Current Players:</p>
            <ul className="game-playerlist">
                {userLists.map((user, index) => (
                    <li key={index}>{user.username}</li>
                ))}
            </ul>
        </section>
    );
}

export default GamePlayerList;