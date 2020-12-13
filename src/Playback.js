import React from "react";
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography'
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';

class Playback extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            time: 0,
            volume: 30,
            muted: false,
        };
        this.dragPosition = false;
        // this.timeslider = React.createRef();
    }
    componentDidMount(){
        this.interval = setInterval(() =>{
            if (this.dragPosition === false && this.props.player && this.props.paused === false) {
                this.props.player.getCurrentState().then(state => {
                    if (state) {
                        this.setState({ time: state.position });
                    }
                });
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }
    mute = () => {
        if(this.state.muted === false){
            this.props.setVolume(0);
            this.setState({muted: true});
        }else{
            this.props.setVolume(this.state.volume/100);
            this.setState({muted: false});
        }
    }
    render() {
        var playing = this.props.track;
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
                paddingTop: "2",
                marginBottom:"0"
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
                {playing === null || playing === undefined ? (
                    <div></div>
                ) : (     
                    <div> 
                        {/* Center Controls (Previous, Pause, Play, Next) */}
                        <div style={{position: "relative", padding: 0, marginLeft: "-30", left: "50%", top: "25"}}>
                            {/* Previous Button */}
                            <IconButton style = {{position: "absolute", left:"-40", top:"10", padding:0}} onClick={this.props.prev}>
                                <SkipPreviousIcon style = {{color: "gray",width: "40", height: "40"}}/>
                            </IconButton>
                            {/* Next Button */}
                            <IconButton style = {{position: "absolute",left:"60", top:"10", padding:0}} onClick={this.props.skip}>
                                <SkipNextIcon style = {{color: "gray",width: "40", height: "40"}}/>
                            </IconButton> 
                            {/* Album Image Spinning */}
                            <img className = {this.props.paused === false ? ("playbackimage") :("")}
                            alt="playbackImg" 
                            style = {{position: "absolute",opacity: ".5", width: "60", height: "60", borderRadius: "100%"}} 
                            src= {playing.album.images[0].url}/>
                            {/* Play Button */}{/* Pause Button */}
                            <IconButton id = "player button" style = {{position: "absolute", padding: 0}}>
                                {this.props.paused === true ? (
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
                        onChange={(e, val) => 
                            {this.props.setVolume(val / 100);
                            if(val === 0){
                                this.setState({volume: val, muted: true});
                            }else{
                                this.setState({volume: val, muted:false});
                            }
                            }}
                        orientation="vertical"
                        getAriaValueText={getVolume}
                        defaultValue={this.state.volume}
                        aria-labelledby="vertical-slider"
                        />

                        {/* Time Slider + labels  */}
                        <TimeSlider ref = {this.timeslider}
                            valueLabelDisplay="auto"
                            onChange={(e, val) => {
                                this.dragPosition = true;
                            }}
                            onChangeCommitted ={ (e, val) =>  
                                {this.setState({time:val*this.props.track.duration_ms/100});
                                  this.dragPosition = false;
                                this.props.seekPosition(val*this.props.track.duration_ms/100)}} 
                            defaultValue={100*this.state.time/this.props.track.duration_ms}
                            marks={[
                                {value: 5,label: getDuration(this.state.time)},
                                {value: 95,label: getDuration(playing.duration_ms)},
                              ]}
                            valueLabelFormat= {(x) => getDuration(x/100 * playing.duration_ms)}
                        />
                        {/* Volume Button*/}
                        <IconButton  style = {{position: "absolute",margin:"0", padding: "0",float: "right", marginTop:"80", marginLeft:"8"}}>
                            {this.state.muted === true ? (
                                <VolumeOffIcon onClick = {() =>this.mute()} style = {{width: "20", height: "20", color: "white"}}/>
                                ) : (   
                                <VolumeUpIcon onClick = {() =>this.mute()} style = {{width: "20", height: "20", color: "white"}}/>)}
                        </IconButton> 


                    </div>
                )}
            </div>
        );
      }
}

export default Playback;
