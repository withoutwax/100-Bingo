import React, { useState, useEffect }from 'react';
import { Link } from 'react-router-dom';
// import { socket } from '../service/socket';

import io from 'socket.io-client';
const SOCKET_URL = 'http://localhost:4000/';

const socket = io(SOCKET_URL);

interface AvailableRoomsProps {
    username: string
}

const AvailableRooms: React.FC<AvailableRoomsProps> = (props) => {
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);

    useEffect(() => {

        console.log(availableRooms, availableRooms.length);
        if (availableRooms.length === 0) {
            console.log('There are no rooms!');
            socket.emit('roomList');
        }
        socket.on('receiveRoomList', (roomList: any) => {
            console.log(roomList);
            setAvailableRooms(roomList);
        });
    }, []);

    return (
        <section>
            <h2>Join Room</h2>
            <div>
                {availableRooms.map((room, index) => (
                    <Link onClick={e => (!props.username || !room) ? e.preventDefault() : null} to={ `/game?username=${props.username}&room=${room.name}` } key={index}>
                        <div>{room.name}</div>
                    </Link>
                ))}
                {availableRooms.length === 0 ? `... No room to join` : ''}
            </div>
        </section>
    );
}

export default AvailableRooms;