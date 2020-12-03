import React from "react";
import Playlist from './PlaylistScroll.js';
import Button from '@material-ui/core/Button'
import { Input } from "@material-ui/core";
import MuiMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from "@material-ui/core/styles";

const Menu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
    })((props) => (
        <MuiMenu
            elevation={0}
            getContentAnchorEl={null}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            {...props}
        />
));

class PlaylistEditor extends React.Component {
    constructor(props){
        super(props);
        this.state = {text: ""};
    }
    handleSearch = (e) => {
        this.setState({text: e.target.value});
    }
    render() {
        const menuOpen = this.state.target !== undefined;
        return (
            <div id="playlist_editor" style={{ height: this.props.player ? "max(25rem, calc(100% - 3 * var(--playlist-column-margin) - var(--playback-height)))" : "max(25rem, calc(100% - 2 * var(--playlist-column-margin)))" }}>
                <div style={{display: "flex", alignItems: "center", height: "7.5%"}}>
                        <p id = "purple_text" style={{fontFamily: "monospace", fontSize: "2.5vh",  display: "flex", justifyContent: "center", flexGrow: 1}}>Playlist Editor</p>
                </div>
                <div style ={{display: "flex", height: "7.5%", justifyContent: "center"}}>
                    <Input onChange={this.handleSearch} style={{height: "80%", width:"80%",color: "white",fontFamily: "monospace"}} placeholder= "Search Playlist"></Input>
                </div>                  
                <div style ={{height: "75%"}}>
                    <Playlist player={this.props.player} tracks = {this.props.tracks.filter(tracks => tracks.name.toUpperCase().indexOf(this.state.text.toUpperCase()) !== -1)} delete = {this.props.deselectTrack} playTrack={this.props.playTrack} />
                </div>
                <div style = {{display: "flex",justifyContent: "space-between", height: "10%", padding: "2%"}}>
                    <Button onClick={(event) => this.setState({target: event.target})} variant="contained" color="primary"style = {{top: "40%",width: "30%", height: "1vw", fontSize: ".5vw"}}>
                        {this.props.privacyStatus}
                    </Button>
                    <Button variant="contained" style = {{top: "40%",width: "30%", height: "1vw", fontSize: ".5vw"}}>
                        Share
                    </Button>
                    <Button onClick={this.props.clearTracks} variant="contained" color="secondary"style = {{top: "40%",width: "30%", height: "1vw", fontSize: ".5vw"}}>
                        Clear
                    </Button>
                    <Menu
                        id="simple-menu"
                        open={menuOpen}
                        keepMounted
                        anchorEl={this.state.target}
                        onClose={() => this.setState({target: undefined})}
                    >
                        {["Public", "Private", "Unlisted"].map(str => <MenuItem key={str} onClick={() => {this.setState({target: undefined}, this.props.privacyCallback(str.toLowerCase()))}}>{str}</MenuItem>)}
                    </Menu>
                </div>
            </div>
        );
      }
}

export default PlaylistEditor;
