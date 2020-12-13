import React from "react";
import TrackList from "./TrackList.js";
import Button from '@material-ui/core/Button';
import {Input, FormControlLabel, FormGroup, Switch} from "@material-ui/core";

class ArtistEditor extends React.Component{
    constructor(props){
        super(props);
        this.state = {text: "",selectedPage:1, nonSelectedPage: 1};
    }

    handleSearch = (e) => {
        this.setState({nonSelectedPage: 1, text: e.target.value});
    }

    handlePageChange1 = (e,v) => {
        this.setState({nonSelectedPage: v});
    }
    handlePageChange2 = (e,v) => {
        this.setState({selectedPage: v});
    }


    render() {
        const imgStyle = {
            marginTop: "8px",
            width: "9vh",
            height: "9vh",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: "url(" + this.props.node.artist.images[0].url + ")",
            backgroundSize: "contain"
        };
        const tracks = this.props.node.artist.tracks === undefined ? [] : [...this.props.node.artist.tracks];
        const selectedTracks = [];
        this.props.selectedTracks.filter(selectedTrack => selectedTrack.artist.id === this.props.node.artist.id).forEach(selectedTrack => {
            selectedTracks.push(selectedTrack);
            tracks.splice(tracks.findIndex(track => track.id === selectedTrack.id), 1);
        });
        return (
            <div id="playlist_editor" style={{ width: "calc(var(--playlist-column-width) - 2 * var(--playlist-column-margin))", height: this.props.player ? "max(25rem, calc(100% - 3 * var(--playlist-column-margin) - var(--playback-height)))" : "max(25rem, calc(100% - 2 * var(--playlist-column-margin)))" }}>
                <div onClick={this.props.deselectNode} style={{cursor: "pointer", color: "white", fontSize: "3vh", position: "absolute", marginLeft: "30", marginTop: "2vh"}}>
                    <i className="fas fa-chevron-left"></i>
                </div>

                <div onClick={() =>{this.setState({nonSelectedPage: 1});this.props.randomSelect(this.props.node.artist, tracks.filter(tracks => 
                            tracks.name.toUpperCase().indexOf(this.state.text.toUpperCase()) !== -1))}} 
                            style={{cursor: "pointer", color: "white", fontSize: "3vh", 
                            position: "absolute", marginLeft: "calc(.75*var(--playlist-column-width))", marginTop: "2vh"}}>
                    <i className="fas fa-dice"></i>
                </div>
                
                <div style={{display: "flex", height: "min-content", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <div style={imgStyle} />
                </div>
                <div style={{display: "flex", height: "32px", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: "20px" }}>{this.props.node.artist.name}</p>
                </div>

                <div style={{display: "flex", height: "calc(50% - 100px - 5vh)", marginBottom: "16px", justifyContent: "center", flexGrow: 1 }}>
                    <TrackList 
                    player={this.props.player} 
                    tracks={selectedTracks} 
                    icon="fas fa-times" 
                    handleClick={this.props.deselectTrack} 
                    playTrack={this.props.playTrack}
                    handlePageChange = {this.handlePageChange2} 
                    page = {this.state.selectedPage} />
                </div>
                <div style ={{display: "flex", height: "32px", justifyContent: "center", marginBottom: ""}}>
                    <Input onChange={this.handleSearch} style={{height: "28px", color: "white", width: "80%", fontFamily: "monospace"}} placeholder= "Search Playlist"></Input>
                </div>
                <div style={{display: "flex", height: "calc(50% - 90px - 5vh)", justifyContent: "center", flexGrow: 1 }}>
                    <TrackList 
                    tracks={
                        tracks.filter(tracks => 
                            tracks.name.toUpperCase().indexOf(this.state.text.toUpperCase()) !== -1)} 
                        icon="fas fa-plus" 
                        handleClick={track => {track.artist = this.props.node.artist; this.props.selectTrack(track);}}
                        handlePageChange = {this.handlePageChange1} 
                        page = {this.state.nonSelectedPage}
                        />
                        
                </div>
                <div style={{marginTop: "10",display: "flex", height: "48px", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <Button variant="contained" onClick={() => this.props.removeNode(this.props.node)} color="default" style = {{backgroundColor: "#c43636", width: "90%", height: "2rem", fontSize: ".75rem"}}>
                        <p style={{ color: "white" }} >Delete Node</p>
                    </Button>
                </div>
            </div>
        );
    }
}

export default ArtistEditor;
