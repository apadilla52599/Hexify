import React from "react";
import ArtistSongList from './Scroll_list.js';
import Button from '@material-ui/core/Button'

class Artist_editor extends React.Component {
    render() {
        var json = require('./DummyData/DummyArtists.json');
        var artist = json.graphicalPlaylists[0].artistNodes[3];
        return (
            <div id="playlist_editor" style = {{align: "center"}}>
                <div style={{display: "flex", alignItems: "center" }}>
                    <div  style={{paddingTop: ".5vh", display: "flex", justifyContent: "center", flexGrow: 1}}>
					    <img style = {{width: "5vw", height: "5vw", borderRadius: "50%"}} src= {artist.imageURL} className="img-responsive" alt=""/>
				    </div>
                </div>     
				
				<div style ={{textAlign: "center", marginTop: ".5vh"}}>
					<div style = {{color: "B19CD9", fontSize: "1.5vw",fontWeight: "600", marginBottom: ".25vh", fontFamily: "monospace"}}>
						{artist.name}
					</div>
					<div style= {{color: "white",fontSize: "1vw", fontWeight: "200",marginbottom: "1vh", fontFamily: "monospace"}}>
                        {artist.genres[0]}
					</div>
				</div>

                <div  style = {{display: "flex", justifyContent: "center", flexGrow: 1, marginTop: "2vh", marginBottom: "1vh"}}>
                    <input style = {{height: "2vw", width:"15vw", fontSize: "1vw"}} type="text" placeholder="Search.." ></input>
                </div>
                <div style = {{marginBottom: "2vh"}}> 
                    <ArtistSongList />
                </div>
                <div style = {{display: "flex", justifyContent: "center", flexGrow: 1, marginTop: ".5vh"}}>
                    <Button variant="contained" color="secondary"style = {{width: "10vw", height: "2vw", fontSize: ".75vw"}}>
                        Remove Artist
                    </Button>
				</div>
            </div>
        );
      }
}

export default Artist_editor;
