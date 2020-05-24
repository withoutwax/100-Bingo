import React, { useState, useEffect} from 'react';

interface GamePlayerListProps {
    socket: any;
    winner: string;
}

const GamePlayerList: React.FC<GamePlayerListProps> = ({ socket, winner }) => {
    const [userLists, setUserLists] = useState<any[]>([]);
    const [readyUser, setReadyUser] = useState<string[]>([]);

    useEffect(() => {
        socket.on('roomUsers', ({ room, users }:{room: any, users: any}) => {
            console.log('Room Name:', room);
            console.log('List of Users:', users);

            setUserLists(users);
        });

        socket.on('updatePlayerReady', ( readyUsername : string) => {
            console.log('Who is ready?', readyUsername);
            
            setReadyUser(readyUser => [...readyUser, readyUsername]);
        });
    }, []);

    return (
        <section>
            <p>Current Players:</p>
            <ul className="game-playerlist">
                {userLists.map((user, index) => (
                    <li key={index}>{user.username}
                        <span>{readyUser.includes(user.username) ? ' - Ready!' : ''}</span>
                        <span>{winner === user.username ? ' is a WINNER!' : ''}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default GamePlayerList;