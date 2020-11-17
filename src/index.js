import React, { Component } from 'react';
import ReactDOM from "react-dom";
import GraphWindow from './GraphWindow.js';
import HamburgerMenu from './HamburgerMenu.js';
import Titlebar from './Titlebar.js';
import Browse from './Browse.js';
import '@fortawesome/fontawesome-free/js/all.js';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import './style.css';

class App extends Component {
    constructor() {
        super();
        this.state = {
            player: undefined
        }
        window.onSpotifyWebPlaybackSDKReady = () => {
            console.log(window.location.search);
            if (window.location.search === undefined)
                window.location = window.location.origin + "/auth/spotify";
            const token = window.location.search.split("=")[1];
            console.log(token);
            const player = new window.Spotify.Player({
                name: 'Web Playback SDK Quick Start Player',
                getOAuthToken: cb => { cb(token); }
            });

            // Error handling
            player.addListener('initialization_error', ({ message }) => { console.error(message); });
            player.addListener('authentication_error', ({ message }) => { console.error(message); });
            player.addListener('account_error', ({ message }) => { console.error(message); });
            player.addListener('playback_error', ({ message }) => { console.error(message); });

            // Playback status updates
            player.addListener('player_state_changed', state => { console.log(state); });

            // Ready
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            // Not Ready
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            // Connect to the player!
            player.connect();
            this.setState({ player: player });
            window.theplayer = player;
        };
    }

    componentDidMount() {
    }

    render() {
        return (
            <Router>
                <div className="App" style={{ display: "flex", width: "100%", height: "100%" }}>
                    <HamburgerMenu />
                    <div style={{ flexGrow: 1 }}>
                        <Titlebar />
                        <Switch>
                            <Route path="/edit" exact component={() => <GraphWindow player={this.state.player} />} />
                            <Route path="/browse" exact component={Browse}/>
                        </Switch>
                    </div>
                </div>
            </Router>
        );
    }
}

ReactDOM.render(<App />, document.getElementById("root"));
