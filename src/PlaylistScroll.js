import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import Typography from '@material-ui/core/Typography'
import PersonIcon from '@material-ui/icons/Person';

export default function Playlist(props){
  var tracks = props.tracks;
  return (
          <List id="scroll" style = {{height: "100%"}}>
            {tracks.map((track) => {
              return (
                <ListItem onClick={() => props.playTrack(track)} button key = {track.name} style={{margin:"0", paddingTop:"0", paddingBottom: "0"}} >
                  <div>
                    <img alt="Album Cover" style = {{height: "2vw", width: "2vw", marginRight: ".5vw"}} src={track.album.images[0].url}/>
                  </div>
                  <ListItemText 
                  disableTypography
                  primary={<div>
                    <Typography style={{color: '#FFFFFF', fontSize: "70%"}}>{track.name.length > 40 ? (track.name.substring(0,40)+"...") : (track.name)}</Typography>
                    <i className="fas fa-user-circle" style={{display:"inline-block", color: 'black', fontSize: "70%"}}></i>
                    <Typography style={{display:"inline-block", color: '#EABFB9', fontSize: "70%"}}>{track.artist.name}</Typography>
                  </div>}
                  secondary={<div>
                        <i className="fas fa-record-vinyl" style={{display:"inline-block", color: 'purple', fontSize: ".6vw"}}></i>
                        <Typography style={{display:"inline-block", color: 'gray', fontSize: ".6vw"}}>
                          {track.album.name.length > 35 ? (track.album.name.substring(0,35)+"...") : (track.album.name)}
                        </Typography>
                  </div>}>
                    
                  </ListItemText>
                
                    <ListItemSecondaryAction>
                       <IconButton onClick={() => props.delete(track)} edge="end" aria-label="delete" style = {{padding:"1vh"}}>
                          <DeleteIcon style = {{width: "1.5vw", height: "1.5vw" }}/>
                      </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
              );
              })}
          </List>
  );
}
