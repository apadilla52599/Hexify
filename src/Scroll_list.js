import React from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import Typography from '@material-ui/core/Typography'


import songs from "./DummyData/Neighbourhood.js";

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
  <div style = {{overflow: 'hidden', height: "60%", position: "relative"}}>
    <List style = {{overflowY: "scroll", width:"100%", height: "100%", paddingRight: "3vw", boxSizing: "content-box"}}>
      {songs.map(({album, song, image, duration}) => {
        index ++;
        const labelId = `checkbox-list-secondary-label-${index}`;
        return (
          <ListItem key={index} button style={{marginTop: "1vh", marginBottom:"1vh", marginRight:"5vw", marginLeft:"1vw"}} >
            <div>
              <img alt="Album Cover" style = {{height: "2vw", width: "2vw", marginRight: "1vw"}} src={image}/>
            </div>    
            <ListItemText id={labelId} 
            disableTypography
            primary={<Typography style={{ color: '#FFFFFF', fontSize: "1.25vw" }}>{song}</Typography>}
            secondary={<Typography style={{color: '#FFFFFF', fontSize: ".75vw" }}>{album}</Typography>}
            />
          
            <ListItemSecondaryAction>
              <Checkbox
                icon={<FavoriteBorder style = {{width: "1.5vw", height: "1.5vw" }}/>}
                checkedIcon={<Favorite style = {{width: "1.5vw", height: "1.5vw" }}/>}
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
  );
}
