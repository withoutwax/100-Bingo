import React, { useState, useEffect} from 'react';
import { socket } from '../service/socket';

const GamePlayerList: React.FC = () => {
    const [userLists, setUserLists] = useState<any[]>([]);

    useEffect(() => {
        
        socket.on('roomUsers', ({ room, users }:{room: any, users: any}) => {
            console.log('Room Name:', room);
            console.log('List of Users:', users);

            setUserLists(users);
        });

    });

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