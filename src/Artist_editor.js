import React from "react";
import ArtistSongList from './Scroll_list.js';

class Artist_editor extends React.Component {
    render() {
        return (
            <div id="playlist_editor" style = {{align: "center"}}>
                <div style={{display: "flex", alignItems: "center" }}>
                    <div  style={{paddingTop: 20, display: "flex", justifyContent: "center", flexGrow: 1}}>
					    <img style = {{height: 100, width: 100, borderRadius: "50%"}} src="https://i.scdn.co/image/a09144d21029bd159d1e3777cb9bea17ba73464a" class="img-responsive" alt=""/>
				    </div>
                </div>     
				
				<div style ={{textAlign: "center", marginTop: 20}}>
					<div style = {{color: "#5a7391", fontSize: 24,fontWeight: 600,marginBottom: 7}}>
						The Neighbourhood
					</div>
					<div style= {{texttransform: "uppercase", color: "#5b9bd1",fontsize: 12, fontWeight: 600,marginbottom: 15}}>
                        modern alternative rock
					</div>
				</div>
				<div style = {{display: "flex", justifyContent: "center", flexGrow: 1, marginTop: 10}}>
					<button type="button" style = {{backgroundColor: "ff726f", padding: 5}}>
                        Remove Artist
                    </button>
				</div>
                <div  style = {{display: "flex", justifyContent: "center", flexGrow: 1, marginTop: 10}}>
                    <input style = {{height: 30, width:300}} type="text" placeholder="Search.." ></input>
                </div>
                <div>
                    <ArtistSongList />
                </div>
            </div>
        );
      }
}

export default Artist_editor;
