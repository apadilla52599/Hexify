import React from "react";
import TrackList from "./TrackList.js";
import Button from '@material-ui/core/Button';
import { Input } from "@material-ui/core";

class PlaylistEditor extends React.Component {
    constructor(props){
        super(props);
        this.state = {text: ""};
    }

    handleSearch = (e) => {
        this.setState({text: e.target.value});
    }

    render(){
        //TODO: when filtering, take care of when string is null/empty. Also, better matching for filter.
        return (
            <div id="playlist_editor">
                <div style={{display: "flex", height: "64px", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: "20px" }}>Full Playlist</p>
                </div>
                <div style ={{display: "flex", height: "32px", justifyContent: "center", marginBottom: ""}}>
                    <Input onChange={this.handleSearch} style={{height: "28px", color: "white", width: "80%", fontFamily: "monospace"}} placeholder= "Search Playlist"></Input>
                </div>
                <div style={{display: "flex", height: "calc(100% - 64px - 64px - 32px)", justifyContent: "center", flexGrow: 1 }}>
                    <TrackList tracks={this.props.tracks.filter(tracks => tracks.name.toUpperCase().indexOf(this.state.text.toUpperCase()) !== -1)} handleClick={this.props.deselectTrack} icon="fas fa-times" />
                </div>
                <div style={{display: "flex", height: "64px", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <Button variant="contained" onClick={this.props.clearTracks} color="default" style = {{backgroundColor: "#c43636", width: "90%", height: "2rem", fontSize: ".75rem"}}>
                        <p style={{ color: "white" }} >Clear All Songs</p>
                    </Button>
                </div>
            </div>
        );
    }
}

export default PlaylistEditor;
