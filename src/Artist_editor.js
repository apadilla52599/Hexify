import React from "react";
import ArtistSongList from './Scroll_list.js';

class Artist_editor extends React.Component {
    render() {
        return (
            <div id="playlist_editor" style = {{align: "center"}}>
                <div style={{display: "flex", alignItems: "center" }}>
                    <div  style={{paddingTop: ".5vh", display: "flex", justifyContent: "center", flexGrow: 1}}>
					    <img style = {{width: "5vw", height: "5vw", borderRadius: "50%"}} src="https://i.scdn.co/image/a09144d21029bd159d1e3777cb9bea17ba73464a" class="img-responsive" alt=""/>
				    </div>
                </div>     
				
				<div style ={{textAlign: "center", marginTop: ".5vh"}}>
					<div style = {{color: "black", fontSize: "1.5vw",fontWeight: "600", marginBottom: ".25vh", fontFamily: "monospace"}}>
						The Neighbourhood
					</div>
					<div style= {{color: "gold",fontSize: "1vw", fontWeight: "200",marginbottom: "1vh", fontFamily: "monospace"}}>
                        modern alternative rock
					</div>
				</div>

                <div  style = {{display: "flex", justifyContent: "center", flexGrow: 1, marginTop: "2vh", marginBottom: "1vh"}}>
                    <input style = {{height: "2vw", width:"15vw", fontSize: "1vw"}} type="text" placeholder="Search.." ></input>
                </div>
                <div style = {{marginBottom: "2vh"}}> 
                    <ArtistSongList />
                </div>
                <div style = {{display: "flex", justifyContent: "center", flexGrow: 1, marginTop: ".5vh"}}>
					<button type="button" style = {{width: "10vw", height: "3vh",fontSize: "1vw", backgroundColor: "ff726f", borderWidth: ".25vw"}}>
                        Remove Artist
                    </button>
				</div>
            </div>
        );
      }
}

export default Artist_editor;
