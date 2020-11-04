import React from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import Typography from '@material-ui/core/Typography'



export default function ArtistSongList(props) {
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
  var songs = props.selected.tracks;
  return (
  // <div style = {{overflow: 'hidden', height: "calc(100% - 18rem)", position: "relative"}}>
    <List id="scroll" style = {{width:"100%", height: "calc(100% - 18rem)", boxSizing: "content-box"}}>
      {songs.map(({uri, name, album}) => {
        const labelId = `checkbox-list-secondary-label-${uri}`;
        return (
          <ListItem key={uri} button style={{marginLeft:"1rem"}} >
            <div>
              <img alt="Album Cover" style = {{height: "2rem", width: "2rem", marginRight: "1rem"}} src={album.images[0].url}/>
            </div>    
            <ListItemText id={labelId} 
            disableTypography
            primary={<Typography style={{ color: '#FFFFFF', fontSize: ".9rem" }}>{name}</Typography>}
            secondary={<Typography style={{color: 'gray', fontSize: ".75rem" }}>{album.name}</Typography>}
            />
          
            <ListItemSecondaryAction>
              <Checkbox
                icon={<FavoriteBorder style = {{width: "1.5rem", height: "1.5rem" }}/>}
                checkedIcon={<Favorite style = {{width: "1.5rem", height: "1.5rem" }}/>}
                edge="end"
                onChange={handleToggle(uri)}
                checked={checked.indexOf(uri) !== -1}
                inputProps={{ 'aria-labelledby': labelId }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
    // </div>
  );
}
