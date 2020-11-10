import React from "react";
import TrackList from "./TrackList.js";
import Button from '@material-ui/core/Button';

function ArtistEditor(props) {
    const imgStyle = {
        marginTop: "16px",
        width: "10vh",
        height: "10vh",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url(" + props.artist.images[0].url + ")",
        backgroundSize: "contain"
    };
    return (
        <div id="playlist_editor">
            <div style={{display: "flex", height: "min-content", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                <div style={imgStyle} />
            </div>
            <div style={{display: "flex", height: "64px", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: "20px" }}>{props.artist.name}</p>
            </div>
            <div style={{display: "flex", height: "calc(50% - 90px - 5vh)", marginBottom: "16px", justifyContent: "center", flexGrow: 1 }}>
                <TrackList tracks={props.artist.selectedTracks} icon="fas fa-times" handleClick={props.deselectTrack} />
            </div>
            <div style={{display: "flex", height: "calc(50% - 72px - 5vh)", justifyContent: "center", flexGrow: 1 }}>
                <TrackList tracks={props.artist.tracks} icon="fas fa-plus" handleClick={props.selectTrack} />
            </div>
            <div style={{display: "flex", height: "64px", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                <Button variant="contained" color="default" style = {{backgroundColor: "#c43636", width: "90%", height: "2rem", fontSize: ".75rem"}}>
                    <p style={{ color: "white" }} >Delete Node</p>
                </Button>
            </div>
        </div>
    );
}

export default ArtistEditor;
