import React, { useState } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';

import Intro from './components/Intro';
import Lobby from './components/Lobby';
import Game from './components/Game';

interface gameDataProps {
  [key: string]: string;
}

const App: React.FC = () => {
  const [gameData, setGameData] = useState<gameDataProps>({ 
    username: 'player 1',
    room: '' 
  });

  const updateUsername = ( username: string ) => {
    setGameData({ username });
  }
  const updateRoomName = ( room: string ) => {
    setGameData({ room });
  }

  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/lobby">Lobby</Link>
          <Link to="/game">Game</Link>
        </nav>
        <Route exact path="/" render={() => (
          <Intro gameData={gameData} updateUsernameGlobal={updateUsername}/>
        )} />
        <Route path="/lobby/" render={() => (
          <Lobby gameData={gameData} updateRoomGlobal={updateRoomName}/>
        )} />
        <Route path="/game/" render={() => (
          <Game gameData={gameData} />
        )}/>
      </div>
    </BrowserRouter>
  );
}

export default App;
