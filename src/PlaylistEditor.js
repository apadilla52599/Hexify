import React from "react";
import TrackList from "./TrackList.js";
import Button from '@material-ui/core/Button';

function PlaylistEditor(props) {
    return (
        <div id="playlist_editor">
            <div style={{display: "flex", height: "64px", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: "20px" }}>Full Playlist</p>
            </div>
            <div style={{display: "flex", height: "calc(100% - 64px - 64px)", justifyContent: "center", flexGrow: 1 }}>
                <TrackList tracks={props.tracks} icon="fas fa-times" />
            </div>
            <div style={{display: "flex", height: "64px", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                <Button variant="contained" color="default" style = {{backgroundColor: "#c43636", width: "90%", height: "2rem", fontSize: ".75rem"}}>
                    <p style={{ color: "white" }} >Clear All Songs</p>
                </Button>
            </div>
        </div>
    );
}

export default PlaylistEditor;
