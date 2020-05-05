import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import queryString from 'query-string';

import AvailableRooms from './AvailableRooms';

const Lobby: React.FC<any> = ({ location }) => {
    const [username, setUsername] = useState<any>('Anonymous');
    const [room, setRoom] = useState<string>('');

    useEffect(() => {
        const { username } = queryString.parse(location.search);
        setUsername(username);
    });

    return (
        <main className="lobby-container">

            <AvailableRooms username={username}/>

            <section className="lobby-create-room">
                <h2>방 만들기</h2>
                <label >Room Name</label>
                <input 
                    type="text"
                    name="room"
                    id="room"
                    placeholder="Create a New Room"
                    onChange={(event) => setRoom(event.target.value)}
                    required
                />
                <Link onClick={e => (!username || !room) ? e.preventDefault() : null} to={ `/game?username=${username}&room=${room}` }>
                    <button type="submit" className="btn">방 만들기</button>
                </Link>
            </section>
        </main>
    );
}

export default Lobby;