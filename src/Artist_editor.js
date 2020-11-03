import React from "react";
import ArtistSongList from './Scroll_list.js';
import Button from '@material-ui/core/Button'

class ArtistEditor extends React.Component {
    render() {
        var json = require('./DummyData/DummyArtists.json');
        var artist = json.artists[0];
        return (
            <div id="playlist_editor" style = {{align: "center"}}>
                <div style={{display: "flex", alignItems: "center" }}>
                    <div  style={{paddingTop: "1.5rem", display: "flex", justifyContent: "center", flexGrow: 1}}>
					    <img style = {{width: "6rem", height: "6rem", borderRadius: "50%"}} src= {artist.images[2].url} className="img-responsive" alt=""/>
				    </div>
                </div>     
				
				<div style ={{textAlign: "center", marginTop: ".5rem"}}>
					<div style = {{color: "B19CD9", fontSize: "1.5rem",fontWeight: "600", marginBottom: ".25rem", fontFamily: "monospace"}}>
						{artist.name}
					</div>
					<div style= {{color: "white",fontSize: "1rem", fontWeight: "200",marginbottom: "1rem", fontFamily: "monospace"}}>
                        {artist.genres[0]}
					</div>
				</div>

                <div  style = {{display: "flex", justifyContent: "center", flexGrow: 1, marginTop: "1rem"}}>
                    <input style = {{height: "2rem", width: "90%", fontSize: "1rem"}} type="text" placeholder="Search.." ></input>
                </div>
                <ArtistSongList />
                <div style = {{display: "flex", justifyContent: "center", flexGrow: 1, marginTop: "1rem"}}>
                    <Button variant="contained" color="default" style = {{backgroundColor: "#c43636", width: "90%", height: "2rem", fontSize: ".75rem"}}>
                        Remove Artist
                    </Button>
				</div>
            </div>
        );
      }
}

export default ArtistEditor;
