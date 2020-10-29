import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';

import songs from "./Songs.js";

export default function Playlist() {
  return (
          <div className="scroller">
            <List style = {{margin: 0, paddingLeft: "2vw",paddingRight: "2vw", overflow: 'auto'}}>
            {songs.map(({artist, song, image }) => {
              return (
                  <ListItem style = {{margin: 0, padding: 5}}>
                    <ListItemAvatar>
                      <Avatar>
                        <img alt="Artist" src={image}/>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary= {song}
                      secondary={artist}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>  
              );
            })}
            </List>
          </div>
  );
}
