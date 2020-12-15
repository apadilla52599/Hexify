import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import Typography from '@material-ui/core/Typography'

export default function Playlist(props){
  var tracks = props.tracks;
  return (
          <List id="scroll" style = {{ width: "90%", height: "100%"}}>
            {tracks.map((track) => {
              return (
                <ListItem onClick={() => props.playTrack(track)} button key = {track.name} style={{margin:"0", paddingTop:"0", paddingBottom: "0"}} >
                  <div>
                    <img alt="Album Cover" style = {{height: "30", width: "30", marginRight: ".5vw"}} src={track.album.images[0].url}/>
                  </div>
                  <ListItemText 
                  disableTypography
                  primary={<div>
                    <Typography style={{color: '#FFFFFF', fontSize: "70%", whiteSpace: "nowrap"}}>{track.name.length > 27 ? (track.name.substring(0,27)+"...") : (track.name)}</Typography>
                    {/* <i className="fas fa-user-circle" style={{display:"inline-block", color: 'black', fontSize: "70%"}}></i> */}
                    <Typography style={{display:"inline-block", color: '#EABFB9', fontSize: "70%", whiteSpace: "nowrap"}}>{"🎤"+track.artist.name}</Typography>
                  </div>}
                  secondary={<div>
                        {/* <i className="fas fa-record-vinyl" style={{display:"inline-block", color: 'purple', fontSize: "8"}}></i> */}
                        <Typography style={{display:"inline-block", color: 'gray', fontSize: "70%", whiteSpace: "nowrap"}}>
                          {track.album.name.length > 27 ? ("💿"+track.album.name.substring(0,27)+"...") : ("💿"+track.album.name)}
                        </Typography>
                  </div>}>
                    
                  </ListItemText>
                
                    <ListItemSecondaryAction>
                       <IconButton onClick={() => props.delete(track)} edge="end" aria-label="delete" style = {{padding:"1vh"}}>
                          <DeleteIcon style = {{width: "20", height: "20" }}/>
                      </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
              );
              })}
          </List>
  );
}
