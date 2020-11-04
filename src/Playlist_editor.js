import React from "react";
import Playlist from './Scroll_list2.js';
import Button from '@material-ui/core/Button'

class PlaylistEditor extends React.Component {
    render() {
        return (
            <div id="playlist_editor">
                <div style={{display: "flex", alignItems: "center"}}>
                        <p id = "purple_text" style={{fontFamily: "monospace", fontSize: "2.5vh",  display: "flex", justifyContent: "center", flexGrow: 1}}>Playlist Editor</p>
                </div>
                <div  style = {{display: "flex", justifyContent: "center", flexGrow: 1, marginTop: "0", marginBottom: "1vh"}}>
                    <input style = {{height: "2vh", width:"80%", fontSize: "1vh", marginTop: 0}} type="text" placeholder="Search.." ></input>
                </div>                    
                <div>
                    <Playlist nodes = {this.props.nodes}/>
                </div>
                <div style = {{display: "flex",justifyContent: "space-between", margin: "5%"}}>

                <Button variant="contained" color="primary"style = {{width: "30%", height: "1vw", fontSize: ".5vw"}}>
                    Public
                </Button>
                <Button variant="contained" style = {{width: "30%", height: "1vw", fontSize: ".5vw"}}>
                    Share
                </Button>
                <Button variant="contained" color="secondary"style = {{width: "30%", height: "1vw", fontSize: ".5vw"}}>
                     Clear
                </Button>
                </div>
            </div>
        );
      }
}

export default PlaylistEditor;
