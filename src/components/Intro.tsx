import React, { useState } from 'react';

import { Link } from 'react-router-dom';

const Intro: React.FC = () => {
    const [username, setUsername] = useState('Anonymous');

    const storeUsername = (e: any) => {
        localStorage.setItem( 'username', username );
    }

    return (
        <main className="intro-container">
            <header>
				<h1>100 빙고 게임 🎲</h1>
			</header>
			<section>
                <label>게임 아이디</label>
                <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Enter Username"
                    onChange={(event) => setUsername(event.target.value)}
                    required
                />
                <Link onClick={e => (!username) ? e.preventDefault() : storeUsername(e)} to={ `/lobby?username=${username}` }>
                    <button type="submit" className="btn">게임 하기</button>
                </Link>
			</section>
        </main>
    );
}

export default Intro;