import React from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Pagination from '@material-ui/lab/Pagination';

function TrackList(props) {
    var i = -1;
    return (
        <div style={{width: "90%", height: "100%", marginBottom: "5"}}>
        <List id="scroll" style={{width: "100%", height: "90%", padding: "0px", backgroundColor: "#202020"}}>
            {props.tracks !== undefined &&
                props.tracks.slice(20*(props.page-1),20*props.page).map((track) => {
                    i++;
                    return (
                        <ListItem key={i} style={{padding: "0px", margin: "2px 0px 2px 0px"}}>
                                <div>
                                    <img alt="Album Cover" style = {{height: "30", width: "30"}} src={track.album.images[0].url}/>
                                </div>
                                <div style={{display: "flex", alignItems: "center", flexGrow: 1, backgroundColor: "var(--background-color)"}}>
                                    <p style={{cursor: "pointer", color: "white", fontFamily: "monospace", fontSize: "15px", width: "100%", marginTop: "3px", marginBottom: "3px", paddingLeft: "5"}}
                                    onClick={() => props.playTrack(track)}>{track.name}</p>
                                    <p style={{cursor: "pointer", color: "white", fontFamily: "monospace", fontSize: "1.2rem", margin: "10 10 5 5" }}
                                    onClick={() => props.handleClick(track)}><i className={props.icon}></i></p>
                                </div>
                        </ListItem>
                        
                    );
                })
            }
            </List>
            {Math.ceil(props.tracks.length/20) <= 1 ? ( <div></div>):(      
                <Pagination 
                style={{ marginTop: "5", display: "flex",justifyContent: "center", alignItems: "center", flexGrow: 1 }}
                color="primary"
                onChange={(e, v) => {props.handlePageChange(e,v)}} 
                count={Math.ceil(props.tracks.length/20)} 
                defaultPage={props.page}
                size = "small" />
            )}

        </div>
    );
}

export default TrackList;
