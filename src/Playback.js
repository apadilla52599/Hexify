import React from "react";
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography'

class Playback extends React.Component {
    constructor(props){
        super(props);
    }
    
    render() {
        var playing = this.props.tracks[0];
        function getVolume(value) {
            return `${value}`;
        }
        const TimeSlider = withStyles({
            root: {
              color: '#B19CD9',
              height: 8,
              marginLeft: "10%",
              width: "80%",
              marginTop: "28%",
              paddingTop: "2"
            },
            thumb: {
              height: 15,
              width: 15,
              backgroundColor: '#fff',
              border: '2px solid currentColor',
              marginTop: -4,
              marginLeft: -12,
              '&:focus, &:hover, &$active': {
                boxShadow: 'inherit',
              },
            },
            active: {},
            valueLabel: {
              left: 'calc(-50% + 4px)',
            },
            track: {
              height: 4,
              borderRadius: 4,
            },
            rail: {
              height: 4,
              borderRadius: 4,
            },
          })(Slider);
        return (
            <div id = 'playback'>
                {playing == null ? (
                    <div></div>
                ) : (     
                    <div> 
                        <div style={{position: "relative", padding: 0, margin: 0, left: "37.5%", top: "2vh"}}>
                            <IconButton style = {{position: "absolute", left:"-20.5%", margin:12, padding:0, top: ".5vh"}}>
                                <SkipPreviousIcon style = {{width: "6vh", height: "6vh"}}/>
                            </IconButton> 
                            <img className = "playbackimage"
                            alt="playbackImg" 
                            style = {{position: "absolute",opacity: ".25", width: "10vh", height: "10vh", borderRadius: "100%"}} 
                            src= {playing.album.images[0].url}/>
                            <IconButton style = {{position: "absolute", padding: 0}}>
                                <PlayCircleOutlineIcon style = {{width: "10vh", height: "10vh"}}/>
                            </IconButton>
                            <IconButton style = {{position: "absolute",left:"20.5%", margin:12, padding:0, top: ".5vh"}}>
                                <SkipNextIcon style = {{width: "6vh", height: "6vh"}}/>
                            </IconButton> 
                        </div>
                        <ListItemText style = {{position: "absolute", paddingLeft: "10"}} 
                            disableTypography
                            primary={<div>
                                <Typography style={{color: '#FFFFFF', fontSize: "70%"}}>{playing.name.length > 40 ? (playing.name.substring(0,40)+"...") : (playing.name)}</Typography>
                                <Typography style={{display:"inline-block", color: '#EABFB9', fontSize: "70%"}}>{playing.artist.name}</Typography>
                            </div>}
                         ></ListItemText>

                        <Slider style = {{height:"50%", marginTop: "10%", float: "right", color:"white"}}
                        orientation="vertical"
                        getAriaValueText={getVolume}
                        defaultValue={30}
                        aria-labelledby="vertical-slider"
                        />
                        <TimeSlider valueLabelDisplay="auto" defaultValue={0} />

                        <div style={{position: "absolute", bottom:"2.5%", right: "5%"}}>
                            <IconButton  style = {{margin:"5", padding: "0"}}>
                                <VolumeUpIcon style = {{width: "2vh", height: "2vh", color: "white"}}/>
                            </IconButton> 
                        </div>
                    </div>
                )}
            </div>
        );
      }
}

export default Playback;
