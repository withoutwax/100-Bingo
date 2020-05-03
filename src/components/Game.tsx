import React, { useState, useEffect} from 'react';
import queryString from 'query-string';
import { socket } from '../service/socket';

const Game: React.FC<any> = ({ location }) => {
    const [username, setUsername] = useState<any>('');
    const [room, setRoom] = useState<any>('');
    
    useEffect(() => {
        const { username, room } = queryString.parse(location.search);

        setUsername(username);
        setRoom(room);

        socket.emit('joinRoom', { username, room });
    }, []);

    return (
        <div>
            Game
        </div>
    );
}

export default Game;