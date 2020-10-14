import React from 'react';
import ReactDOM from "react-dom";
import GraphWindow from './GraphWindow.js';

function App() {
    return (
        <div className="App">
            <GraphWindow />
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
