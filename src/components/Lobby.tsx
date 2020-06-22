import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../service/firestore';

import AvailableRooms from './AvailableRooms';

interface gameDataProps {
	gameData: any;
	updateRoomGlobal: any;
}

const Lobby: React.FC<gameDataProps> = (props) => {
	const [username, setUsername] = useState<string>('Anonymous');
	const [createNewRoom, setCreateNewRoom] = useState<string>('') 

	useEffect(() => {
		setUsername(props.gameData.username);
	});

	const updateNewRoomTitle = () => {
		// Create a new room
		db.collection('rooms').doc().set({
			roomName: createNewRoom,
			numOfPlayers: 0,
			players: []
		});

		// Update a global room variable
		props.updateRoomGlobal(createNewRoom);
	}

	return (
		<main className="lobby-container">
			<section>
			<h2>Current User: <span>{username}</span></h2>
			</section>
			<AvailableRooms gameData={props.gameData} updateRoomGlobal={props.updateRoomGlobal}/>

			<section className="lobby-create-room">
				<h2>방 만들기</h2>
				<label >Room Name</label>
				<input 
					type="text"
					name="room"
					id="room"
					placeholder="Create a New Room"
					onChange={(event) => setCreateNewRoom(event.target.value)}
					required
				/>
				<Link onClick={e => (!username) ? e.preventDefault() : null} to={ `/game&room=${createNewRoom}` }>
					<button type="submit" className="btn" onClick={updateNewRoomTitle} >방 만들기</button>
				</Link>
			</section>
		</main>
	);
}

export default Lobby;