import React from "react";
import Playlist from './PlaylistScroll.js';
import Button from '@material-ui/core/Button'
import { Input } from "@material-ui/core";

class PlaylistEditor extends React.Component {
    constructor(props){
        super(props);
        this.state = {text: ""};
    }
    handleSearch = (e) => {
        this.setState({text: e.target.value});
    }
    render() {
        return (
            <div id="playlist_editor">
                <div style={{display: "flex", alignItems: "center", height: "7.5%"}}>
                        <p id = "purple_text" style={{fontFamily: "monospace", fontSize: "2.5vh",  display: "flex", justifyContent: "center", flexGrow: 1}}>Playlist Editor</p>
                </div>
                <div style ={{display: "flex", height: "7.5%", justifyContent: "center"}}>
                    <Input onChange={this.handleSearch} style={{height: "80%", width:"80%",color: "white",fontFamily: "monospace"}} placeholder= "Search Playlist"></Input>
                </div>                  
                <div style ={{height: "75%"}}>
                    <Playlist player={this.props.player} tracks = {this.props.tracks.filter(tracks => tracks.name.toUpperCase().indexOf(this.state.text.toUpperCase()) !== -1)} delete = {this.props.deselectTrack} />
                </div>
                <div style = {{display: "flex",justifyContent: "space-between", height: "10%", padding: "2%"}}>
                    <Button variant="contained" color="primary"style = {{top: "40%",width: "30%", height: "1vw", fontSize: ".5vw"}}>
                        Public
                    </Button>
                    <Button variant="contained" style = {{top: "40%",width: "30%", height: "1vw", fontSize: ".5vw"}}>
                        Share
                    </Button>
                    <Button onClick={this.props.clearTracks} variant="contained" color="secondary"style = {{top: "40%",width: "30%", height: "1vw", fontSize: ".5vw"}}>
                        Clear
                    </Button>
                </div>
            </div>
        );
      }
}

export default PlaylistEditor;
