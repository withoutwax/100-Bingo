import React, { useState, useEffect }from 'react';
import { Link } from 'react-router-dom';
import { db } from '../service/firestore';
// import { socket } from '../service/socket';

// import io from 'socket.io-client';
// const SOCKET_URL = 'http://localhost:4000/';

// const socket = io(SOCKET_URL);

interface AvailableRoomsProps {
	gameData: any;
	updateRoomGlobal: any;
}

const AvailableRooms: React.FC<AvailableRoomsProps> = (props) => {
	const [availableRooms, setAvailableRooms] = useState<any[]>([]);

	useEffect(() => {
		db.collection('rooms').onSnapshot((querySnapshot) => {
			let roomLists: Array<object> = [];
			querySnapshot.forEach(doc => {
				roomLists.push(doc.data());
			});
			setAvailableRooms(roomLists);
		});
	}, [availableRooms]);
	// useEffect(() => {
	//     console.log(props);
	//     // console.log(availableRooms, availableRooms.length);
	//     // if (availableRooms.length === 0) {
	//     //     console.log('There are no rooms!');
	//     //     socket.emit('roomList');
	//     // }
	//     // socket.on('receiveRoomList', (roomList: any) => {
	//     //     console.log(roomList);
	//     //     setAvailableRooms(roomList);
	//     // });
	// }, []);

	return (
		<section>
			<h2>Available Room:</h2>
			<div>
				{availableRooms.map((room, index) => (
					<Link onClick={props.updateRoomGlobal(room.roomName)} to={ `/game&room=${room.roomName}` } key={index}>
						<div>{room.roomName}</div>
					</Link>
				))}
				{availableRooms.length === 0 ? `... No room to join` : ''}
			</div>
		</section>
	);
}

export default AvailableRooms;