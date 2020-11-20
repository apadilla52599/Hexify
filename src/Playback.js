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
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline';

class Playback extends React.Component {
    constructor(props){
        super(props);
    }
    
    render() {
        var playing = this.props.track;
        console.log(playing);
        function getVolume(value) {
            return `${value}`;
        }
        function getDuration(duration) {
            var mil = parseInt(duration);
            var minutes = Math.floor(mil / 60000);
            var seconds = ((mil % 60000) / 1000).toFixed(0);
            return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        }
        const TimeSlider = withStyles({
            root: {
                color: '#B19CD9',
                height: 8,
                marginLeft: "10%",
                width: "80%",
                marginTop: "88",
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
            markLabel:{
                    top: 5,
                    padding:0,
                    color: "gray"
            },
            mark: {
                    visibility: "hidden"
            }
          })(Slider);
        return (
            <div id = 'playback'>
                {playing == null ? (
                    <div></div>
                ) : (     
                    <div> 
                        {/* Center Controls (Previous, Pause, Play, Next) */}
                        <div style={{position: "relative", padding: 0, margin: 0, left: "40%", top: "25"}}>
                            {/* Previous Button */}
                            <IconButton style = {{position: "absolute", left:"-40", top:"10", padding:0}} onClick={this.props.prev}>
                                <SkipPreviousIcon style = {{color: "gray",width: "40", height: "40"}}/>
                            </IconButton>
                            {/* Next Button */}
                            <IconButton style = {{position: "absolute",left:"60", top:"10", padding:0}} onClick={this.props.skip}>
                                <SkipNextIcon style = {{color: "gray",width: "40", height: "40"}}/>
                            </IconButton> 
                            {/* Album Image Spinning */}
                            <img className = {this.props.paused == false ? ("playbackimage") :("")}
                            alt="playbackImg" 
                            style = {{position: "absolute",opacity: ".5", width: "60", height: "60", borderRadius: "100%"}} 
                            src= {playing.album.images[0].url}/>
                            {/* Play Button */}{/* Pause Button */}
                            <IconButton id = "player button" style = {{position: "absolute", padding: 0}}>
                                {this.props.paused == true ? (
                                    <PlayCircleOutlineIcon onClick={this.props.play} style = {{width: "60", height: "60"}}/>
                                    ) : (   
                                    <PauseCircleOutlineIcon onClick={this.props.pause} style = {{width: "60", height: "60"}}/>)}
                            </IconButton>
                            

                        </div>
                        {/* Song/Artist Labels  */}
                        <ListItemText style = {{position: "absolute", paddingLeft: "10"}} 
                            disableTypography
                            primary={<div>
                                <Typography style={{color: '#FFFFFF', fontSize: "70%"}}>{playing.name.length > 40 ? (playing.name.substring(0,40)+"...") : (playing.name)}</Typography>
                                <Typography style={{display:"inline-block", color: '#EABFB9', fontSize: "70%"}}>{playing.artist.name.length > 18 ? (playing.artist.name.substring(0,16)+"...") : (playing.artist.name)}</Typography>
                            </div>}
                         ></ListItemText>
                        
                        {/* Volume Slider*/}
                        <Slider style = {{height:"50%", marginTop: "15", float: "right", color:"white"}}
                        onChange={(e, val) => this.props.setVolume(val / 100)}
                        orientation="vertical"
                        getAriaValueText={getVolume}
                        defaultValue={30}
                        aria-labelledby="vertical-slider"
                        />

                        {/* Time Slider + labels  */}
                        <TimeSlider 
                            valueLabelDisplay="auto" 
                            defaultValue={0}
                            marks={[
                                {value: 5,label: '0:00'},
                                {value: 95,label: getDuration(playing.duration_ms)},
                              ]}
                            valueLabelFormat= {(x) => getDuration(x/100 * playing.duration_ms)}
                        />
                        {/* Volume Button*/}
                        <IconButton  style = {{position: "absolute",margin:"0", padding: "0",float: "right", marginTop:"80", marginLeft:"8"}}>
                                <VolumeUpIcon style = {{width: "20", height: "20", color: "white"}}/>
                        </IconButton> 


                    </div>
                )}
            </div>
        );
      }
}

export default Playback;
