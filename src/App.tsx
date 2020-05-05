import React from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import io from 'socket.io-client';

import Intro from './components/Intro';
import Lobby from './components/Lobby';
import Game from './components/Game';

// const SocketContext = React.createContext();
// let socket;

const App: React.FC = () => {
  
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/lobby">Lobby</Link>
          <Link to="/game">Game</Link>
        </nav>
        <Route exact path="/" component={Intro} />
        <Route path="/lobby/" component={Lobby} />
        <Route path="/game/" component={Game} />
      </div>
    </BrowserRouter>
  );
}

export default App;
