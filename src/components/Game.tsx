import React, { useState, useEffect} from 'react';
import queryString from 'query-string';
import { socket } from '../service/socket';

import GamePlayerList from './GamePlayerList';

const Game: React.FC<any> = ({ location }) => {
    const [username, setUsername] = useState<any>('');
    const [room, setRoom] = useState<any>('');
    
    useEffect(() => {
        const { username, room } = queryString.parse(location.search);

        setUsername(username);
        setRoom(room);

        socket.emit('joinRoom', { username, room });
    });

    

    return (
        <main className="game-container">
            <h1>Welcome to {room} Room</h1>

            <GamePlayerList />

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