import React, { useState, useEffect }from 'react';
import { Link } from 'react-router-dom';
import { socket } from '../service/socket';

interface AvailableRoomsProps {
    username: string
}

const AvailableRooms: React.FC<AvailableRoomsProps> = (props) => {
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);

    useEffect(() => {
        console.log('efeg');
        // socket.emit('roomList');
        console.log(availableRooms.length);
        if (availableRooms.length === 0) {
            console.log('There are no rooms!');
            socket.emit('roomList');
        }

        socket.on('receiveRoomList', (roomList: any) => {
            console.log(roomList);
            setAvailableRooms(roomList => [...roomList, roomList]);
        });
    });

    return (
        <section>
            <h2>Join Room</h2>
            <div>
                {availableRooms.map((room, index) => (
                    <Link onClick={e => (!props.username || !room) ? e.preventDefault() : null} to={ `/game?username=${props.username}&room=${room.name}` } key={index}>
                        <div>{room.name}</div>
                    </Link>
                ))}
                ... No room to join
            </div>
        </section>
    );
}

export default AvailableRooms;