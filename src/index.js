import React from 'react';
import ReactDOM from "react-dom";
import GraphWindow from './GraphWindow.js';
import HamburgerMenu from './HamburgerMenu.js';
import Titlebar from './Titlebar.js';
import '@fortawesome/fontawesome-free/js/all.js';

function App() {
    return (
        <div className="App" style={{ display: "flex", width: "100%", height: "100%" }}>
            <HamburgerMenu />
            <div style={{ flexGrow: 1 }}>
                <Titlebar />
                <GraphWindow />
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
