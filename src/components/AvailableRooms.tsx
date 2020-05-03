import React, { useState, useEffect }from 'react';
import { socket } from '../service/socket';

const AvailableRooms: React.FC = () => {
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);

    useEffect(() => {
        socket.emit('roomList');
    }, []);
    useEffect(() => {
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
                    <div key={index}>{room.name}</div>
                ))}
                ... No room to join
            </div>
        </section>
    );
}

export default AvailableRooms;