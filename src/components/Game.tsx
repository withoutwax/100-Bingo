import React, { useState, useEffect} from 'react';
import queryString from 'query-string';
// import { socket } from '../service/socket';
import GamePlayerList from './GamePlayerList';
import io from 'socket.io-client';
const SOCKET_URL = 'http://localhost:4000/';

const socket = io(SOCKET_URL);


const Game: React.FC<any> = ({ location }) => {
    const [username, setUsername] = useState<any>('');
    const [room, setRoom] = useState<any>('');
    const [userLists, setUserLists] = useState<any[]>([]);
    
    useEffect(() => {
        const { username, room } = queryString.parse(location.search);
        setUsername(username);
        setRoom(room);

        socket.open();
        socket.emit('joinRoom', { username, room });

        return () => {
            socket.close();
        }
    }, ['http://localhost:4000/', location.search]);

    useEffect(() => {
        socket.on('roomUsers', ({ room, users }:{room: any, users: any}) => {
            console.log('Room Name:', room);
            console.log('List of Users:', users);

            setUserLists(users);
        });
    }, []);

    return (
        <main className="game-container">
            <h1>Welcome to {room} Room</h1>

            <GamePlayerList userLists={userLists} />

            <section className="game-100-bingo-container">
                <div className="game-100-bingo"></div>
                {/* <button onclick="generateTable()">Generate Table</button> */}
                <label>User Input: </label>
                <input className="game-100-bingo-select-number" disabled/>
                <p className="game-100-bingo-select-number-value">Current</p>
                <p className="game-100-bingo-player-turn">Player Turn: <span className="game-100-bingo-current-player"></span></p>
                {/* <button type="submit" className="game-100-bingo-player-ready" onClick="playerReady()">Ready!</button> */}
                <p className="game-100-bingo-player-winner"></p>
            </section>
        </main>
    );
}

export default Game;