import React from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';

import songs from "./Neighbourhood.js";

// function convertTime (ms) {
//   ms = parseInt(ms);
//   var min = Math.floor((ms/1000/60) << 0);
//   var sec = Math.floor((ms/1000) % 60);
//   return min.toString() + ":" + sec.toString();
// };

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
  var index =-1;
  return (
    <div style = {{padding:20}}>
  <div style = {{overflow: 'hidden', height: "50%", position: "relative"}}>
    <List style = {{overflowY: "scroll", width:"200%", height: "100%", paddingRight: "3vw", boxSizing: "content-box"}}>
      {songs.map(({album, song, image, duration}) => {
        index ++;
        const labelId = `checkbox-list-secondary-label-${index}`;
        return (
          <ListItem key={index} button>
            <div>
              <img alt="Album Cover" style = {{height: 40, width: 40, marginRight: 20}} src={image}/>
            </div>
            <ListItemText id={labelId} primary={song} secondary={album}/>
            <ListItemSecondaryAction>
              <Checkbox
                icon={<FavoriteBorder />}
                checkedIcon={<Favorite />}
                edge="end"
                onChange={handleToggle(index)}
                checked={checked.indexOf(index) !== -1}
                inputProps={{ 'aria-labelledby': labelId }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
    </div>
    </div>
  );
}
