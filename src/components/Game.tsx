import React, { useState, useEffect} from 'react';
import queryString from 'query-string';
// import { socket } from '../service/socket';
import GamePlayerList from './GamePlayerList';
import GameBoard from './GameBoard';
import io from 'socket.io-client';
const SOCKET_URL = 'http://localhost:4000/';

const socket = io(SOCKET_URL);


const Game: React.FC<any> = ({ location }) => {
    const [username, setUsername] = useState<any>('');
    const [room, setRoom] = useState<any>('');
    const [readyButtonState, setreadyButtonState] = useState<boolean>(false);
    const [gameStart, setGameStart] = useState<boolean>(false);
    const [playerTurn, setPlayerTurn] = useState<any>({id: '', username: ''});
    const [playerUpdateNumber, setPlayerUpdateNumber] = useState<string>('');
    const [playerSelectSendProps, setPlayerSelectSendProps] = useState<string>('');
    
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
        socket.on('startingPlayer', ( playerData: any ) => {
            setPlayerTurn({
                id: playerData.startingPlayer.id, 
                username: playerData.startingPlayer.username
            });
            setGameStart(true);
            console.log('All Players are ready!');
        });

        socket.on('updateTable', (nextTurnData: any) => {
            console.log('Chosen Number', nextTurnData.number);
            console.log('Next Player', nextTurnData.nextPlayer);
            setPlayerSelectSendProps(nextTurnData.number);
            setPlayerTurn({
                id: nextTurnData.nextPlayer.id,
                username: nextTurnData.nextPlayer.username
            });
        });
    }, []);

    const playerReady = (e: any) => {
        // console.log('Player Ready', e);
        setreadyButtonState(true);
        socket.emit('playerReady', { username });
    };

    const updateNumber = (e: any) => {
        setPlayerUpdateNumber(e.target.value);
    };
    const chooseNumber = () => {
        const number = playerUpdateNumber;
        setPlayerSelectSendProps(number);
        socket.emit('chooseNumber', {number, username, room});
    };

    const gameOver = (winner: string) => {
        console.log('Winner is ...', winner);
        socket.emit('gameOver', { username });
    };

    return (
        <main className="game-container">
            <h1>Welcome to {room} Room</h1>

            <GamePlayerList socket={socket} />

            <GameBoard username={username} room={room} chooseNumber={playerSelectSendProps} gameOver={gameOver}/>

            <section className="game-100-bingo-container">
                <div className="game-100-bingo"></div>
                {/* <button onclick="generateTable()">Generate Table</button> */}
                {/* <label>User Input: </label>
                <input className="game-100-bingo-select-number" disabled/> */}
                <div>
                    <p className="game-100-bingo-select-number-value">Chose Number:</p>
                    <input
                        type="text"
                        name="chooseNum"
                        id="chooseNum"
                        placeholder="Enter a number"
                        onChange={(event) => updateNumber(event)}
                        disabled={playerTurn.username !== username}
                    />
                    <button onClick={chooseNumber}>Enter</button>
                </div>
                <p className="game-100-bingo-player-turn">Player Turn: <span>{playerTurn.username}</span></p>
                <button type="submit" onClick={playerReady} disabled={readyButtonState}>Ready!</button>
                <p className="game-100-bingo-player-winner"></p>
            </section>
        </main>
    );
}

export default Game;