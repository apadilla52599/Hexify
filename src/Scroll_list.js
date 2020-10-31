import React from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import Typography from '@material-ui/core/Typography'



export default function ArtistSongList() {
  const [checked, setChecked] = React.useState([-1]);
  const handleToggle = (index) => () => {
    const currentIndex = checked.indexOf(index);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(index);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };
  var json = require('./DummyData/DummyArtists.json');
  const songs = json.graphicalPlaylists[0].artistNodes[3].tracks;
  return (
  <div style = {{overflow: 'hidden', height: "calc(100% - 18rem)", position: "relative"}}>
    <List style = {{overflowY: "scroll", width:"100%", height: "100%", paddingRight: "3rem", boxSizing: "content-box"}}>
      {songs.map(({spotifyTrackId, name, image, album}) => {
        const labelId = `checkbox-list-secondary-label-${spotifyTrackId}`;
        return (
          <ListItem key={spotifyTrackId} button style={{marginLeft:"1rem"}} >
            <div>
              <img alt="Album Cover" style = {{height: "2rem", width: "2rem", marginRight: "1rem"}} src={image}/>
            </div>    
            <ListItemText id={labelId} 
            disableTypography
            primary={<Typography style={{ color: '#FFFFFF', fontSize: ".9rem" }}>{name}</Typography>}
            secondary={<Typography style={{color: 'gray', fontSize: ".75rem" }}>{album}</Typography>}
            />
          
            <ListItemSecondaryAction>
              <Checkbox
                icon={<FavoriteBorder style = {{width: "1.5rem", height: "1.5rem" }}/>}
                checkedIcon={<Favorite style = {{width: "1.5rem", height: "1.5rem" }}/>}
                edge="end"
                onChange={handleToggle(spotifyTrackId)}
                checked={checked.indexOf(spotifyTrackId) !== -1}
                inputProps={{ 'aria-labelledby': labelId }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
    </div>
  );
}
