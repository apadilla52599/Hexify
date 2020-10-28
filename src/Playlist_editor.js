import React from "react";
import Playlist from './Scroll_list2.js';

class Playlist_editor extends React.Component {
    render() {
        return (
            <div id="playlist_editor">
                <div style={{display: "flex", alignItems: "center" }}>
                        <p style={{ color: "Black", fontFamily: "monospace", fontSize: "1.5em",  display: "flex", justifyContent: "center", flexGrow: 1}}>Playlist Editor</p>
                </div>                    
                <div>
                    <Playlist />
                </div>
            </div>
        );
      }
}

export default Playlist_editor;
