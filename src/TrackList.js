import React from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

function TrackList(props) {
    var i = -1;

    var play = () => {};
    if (props.player !== undefined) {
        play = ({
          spotify_uri,
          playerInstance: {
            _options: {
              getOAuthToken,
              id
            }
          }
        }) => {
          getOAuthToken(access_token => {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
              method: 'PUT',
              body: JSON.stringify({ uris: [spotify_uri] }),
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
              },
            });
          });
        };
    }

    return (
        <List id="scroll" style={{width: "90%", height: "100%", padding: "0px", backgroundColor: "#202020"}}>
            { props.tracks !== undefined &&
                props.tracks.map((track) => {
                    i++;
                    return (
                        <ListItem key={i} style={{padding: "0px", margin: "2px 0px 2px 0px"}}>
                                <div style={{display: "flex", alignItems: "center", flexGrow: 1, backgroundColor: "var(--background-color)" }}>
                                    <p onClick={() => play({ playerInstance: props.player, spotify_uri: track.uri})} style={{ cursor: "pointer", color: "white", cursor: "default", fontFamily: "monospace", fontSize: "15px", width: "100%", marginTop: "3px", marginBottom: "3px" }}>{track.name}</p>
                                    <p onClick={() => props.handleClick(track)} style={{cursor: "pointer", color: "white", fontFamily: "monospace", fontSize: "1.2rem", margin: "10 10 5 5" }}><i className={props.icon}></i></p>
                                </div>
                        </ListItem>
                    );
                })
            }
        </List>
    );
}

export default TrackList;
