import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import Typography from '@material-ui/core/Typography'

export default function Playlist(props) {
  var artists = props.nodes;
  return (
          <div style = {{overflow: 'hidden', height: "75%", position: "relative",marginLeft: 0}}>
          <List style = {{overflowY: "scroll", width:"100%", height: "100%", paddingRight: "3vw", boxSizing: "content-box"}}>
            {artists.map((artistNode) => {
              return (
              artistNode.tracks.map(({name, album}) => {
              return (
                <ListItem button style={{margin:0, paddingTop: ".5vh", paddingBottom: ".5vh"}} >
                  <div>
                    <img alt="Album Cover" style = {{height: "2vw", width: "2vw", marginRight: ".5vw"}} src={artistNode.images[0].url}/>
                  </div>
                  <ListItemText 
                  disableTypography
                  primary={<div>
                    <Typography style={{display:"inline-block", color: '#FFFFFF', fontSize: "70%" }}>{name +"--"}</Typography>
                    <Typography style={{display:"inline-block", color: '#EABFB9', fontSize: "50%" }}>{artistNode.name}</Typography>
                  </div>}
                  secondary={<div>
                        <i class="fas fa-record-vinyl" style={{display:"inline-block", color: 'purple', fontSize: ".6vw"}}></i>
                        <Typography style={{display:"inline-block", color: 'gray', fontSize: ".6vw"}}>{album.name}</Typography>
                  </div>}>
                    
                  </ListItemText>
                
                    <ListItemSecondaryAction>
                       <IconButton edge="end" aria-label="delete" style = {{padding:"1vh"}}>
                          <DeleteIcon style = {{width: "1.5vw", height: "1.5vw" }}/>
                      </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
              );
              }));})}
          </List>
          </div>
  );
}
