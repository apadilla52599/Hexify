import React from 'react';
import ReactDOM from "react-dom";
import GraphWindow from './GraphWindow.js';
import HamburgerMenu from './HamburgerMenu.js';
import Titlebar from './Titlebar.js';
import Browse from './Browse.js';
import '@fortawesome/fontawesome-free/js/all.js';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

function App() {
    //test2
    return (
        <Router>
            <div className="App" style={{ display: "flex", width: "100%", height: "100%" }}>
                <HamburgerMenu />
                <div style={{ flexGrow: 1 }}>
                    <Titlebar />
                    <Switch>
                        <Route path="/" exact component={GraphWindow} />
                        <Route path="/browse" exact component={Browse}/>
                    </Switch>
                </div>
            </div>
        </Router>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
