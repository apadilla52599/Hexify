import React from "react";
import TrackList from "./TrackList.js";
import Button from '@material-ui/core/Button';
import { render } from "@testing-library/react";
import { Input } from "@material-ui/core";

class ArtistEditor extends React.Component{
    constructor(props){
        super(props);
        this.state = {text: ""};
    }

    handleSearch = (e) => {
        this.setState({text: e.target.value});
    }


    render() {
        const imgStyle = {
            marginTop: "16px",
            width: "10vh",
            height: "10vh",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: "url(" + this.props.node.artist.images[0].url + ")",
            backgroundSize: "contain"
        };
        return (
            <div id="playlist_editor">
                <div style={{display: "flex", height: "min-content", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <div style={imgStyle} />
                </div>
                <div style={{display: "flex", height: "64px", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: "20px" }}>{this.props.node.artist.name}</p>
                </div>
                <div style={{display: "flex", height: "calc(50% - 100px - 5vh)", marginBottom: "16px", justifyContent: "center", flexGrow: 1 }}>
                    <TrackList tracks={this.props.node.artist.selectedTracks} icon="fas fa-times" handleClick={this.props.deselectTrack} />
                </div>
                <div style ={{display: "flex", height: "32px", justifyContent: "center", marginBottom: ""}}>
                    <Input onChange={this.handleSearch} style={{height: "28px", color: "white", width: "80%", fontFamily: "monospace"}} placeholder= "Search Playlist"></Input>
                </div>
                <div style={{display: "flex", height: "calc(50% - 90px - 5vh)", justifyContent: "center", flexGrow: 1 }}>
                    <TrackList tracks={this.props.node.artist.tracks === undefined ? [] : this.props.node.artist.tracks.filter(tracks => tracks.name.toUpperCase().indexOf(this.state.text.toUpperCase()) !== -1)} icon="fas fa-plus" handleClick={this.props.selectTrack} />
                </div>
                <div style={{display: "flex", height: "64px", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <Button variant="contained" onClick={() => this.props.removeNode(this.props.node)} color="default" style = {{backgroundColor: "#c43636", width: "90%", height: "2rem", fontSize: ".75rem"}}>
                        <p style={{ color: "white" }} >Delete Node</p>
                    </Button>
                </div>
            </div>
        );
    }
}

export default ArtistEditor;
