import React from "react";
import Button from '@material-ui/core/Button'
import { Input } from "@material-ui/core";
import swal from 'sweetalert2';
import MuiMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from "@material-ui/core/styles";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import Typography from '@material-ui/core/Typography'

const Menu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
    })((props) => (
        <MuiMenu
            elevation={0}
            getContentAnchorEl={null}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            {...props}
        />
));

class PlaylistEditor extends React.Component {
    constructor(props){
        super(props);
        this.state = {text: ""};
    }
    handleSearch = (e) => {
        this.setState({text: e.target.value});
    }
    share = (e) => {
        swal.fire({
            // title: '',
            width: 600,
            padding: '5em',
            showCancelButton: true,
            imageUrl: 'https://i.gyazo.com/95347b0e7b98ef83b611754ecefbbcb0.gif',
            confirmButtonText: `Export To Spotify`,
            cancelButtonText: `Copy Link`,
            backdrop: `
                rgba(0,0,123,0.4)
            `
          }).then((result) => {
            if (result.isConfirmed) {
                this.props.exportPlaylist();
                swal.fire('Created!', '', 'success')
            }else if(result.dismiss === "cancel") {
                var temp = document.createElement('input'),
                text = window.location.href;
                document.body.appendChild(temp);
                temp.value = text;
                temp.select();
                document.execCommand('copy');
                document.body.removeChild(temp);
                swal.fire('Copied!', '', 'success')
            }
            })
          //Original https://i.pinimg.com/originals/e0/94/d9/e094d9bb9a23354435ac138f3200e53d.gif
          //larger image https://i.gyazo.com/f1ee894e7f75081ec30b527dd3618847.gif
    }

    render() {
        const menuOpen = this.state.target !== undefined;
        const clearOpen = this.state.target2 !== undefined;
        var tracks = this.props.tracks.filter(tracks => tracks.name.toLowerCase().search(this.state.text.toLowerCase()) !== -1);
        return (
            <div id="playlist_editor" style={{ width: "calc(var(--playlist-column-width) - 2 * var(--playlist-column-margin))", height: this.props.player ? "max(25rem, calc(100% - 3 * var(--playlist-column-margin) - var(--playback-height)))" : "max(25rem, calc(100% - 2 * var(--playlist-column-margin)))" }}>
                <div onClick={() =>{this.props.randomizePlaylist()}} 
                    style={{cursor: "pointer", color: "white", fontSize: "3vh", 
                    position: "absolute", marginLeft: "calc(.75*var(--playlist-column-width))", marginTop: "2vh"}}>
                        <i className="fas fa-dice"></i>
                </div>
                <div style={{display: "flex", alignItems: "center", height: "7.5%"}}>
                        <p id = "purple_text" style={{fontFamily: "monospace", fontSize: "20",  display: "flex", justifyContent: "center", flexGrow: 1}}>Playlist Editor</p>
                </div>
                <div style ={{display: "flex", height: "7.5%", justifyContent: "center"}}>
                    <Input onChangeCapture={this.handleSearch} style={{height: "80%", width:"80%",color: "white",fontFamily: "monospace"}} placeholder= "Search Playlist"></Input>
                </div>                
                <div style ={{display: "flex", justifyContent: "center", height: "70%"}}>
                {this.props.loading === false ? (
                        <List id="scroll" style = {{ width: "90%", height: "100%"}}>
                            {tracks.map((track) => {
                            return (
                            <ListItem onClick={() => this.props.playTrack(track)} button key = {track.id} style={{margin:"0", paddingTop:"0", paddingBottom: "0"}} >
                                    <div>
                                    <img alt="Album Cover" style = {{height: "30", width: "30", marginRight: ".5vw"}} src={track.album.images[0].url}/>
                                    </div>
                                    <ListItemText 
                                    disableTypography
                                    primary={<div>
                                    <Typography style={{color: '#FFFFFF', fontSize: "70%", whiteSpace: "nowrap"}}>{track.name.length > 27 ? (track.name.substring(0,27)+"...") : (track.name)}</Typography>
                                    <Typography style={{display:"inline-block", color: '#EABFB9', fontSize: "70%", whiteSpace: "nowrap"}}>{"🎤"+track.artist.name}</Typography>
                                    </div>}
                                    secondary={<div>
                                    <Typography style={{display:"inline-block", color: 'gray', fontSize: "70%", whiteSpace: "nowrap"}}>
                                    {track.album.name.length > 27 ? ("💿"+track.album.name.substring(0,27)+"...") : ("💿"+track.album.name)}
                                    </Typography>
                                    </div>}
                                    >
                                    </ListItemText>
                                    <ListItemSecondaryAction>
                                    <IconButton onClick={() => this.props.deselectTrack(track)} edge="end" aria-label="delete" style = {{padding:"1vh"}}>
                                    <DeleteIcon style = {{width: "20", height: "20" }}/>
                                    </IconButton>
                                    </ListItemSecondaryAction>
                            </ListItem>
                            );
                            })}
                        </List>):(
                            <div id="loading" >
                                <div style={{marginTop: "5%",display: "flex", alignItems: "center"}}>
                                        <p id = "purple_text" style={{fontFamily: "monospace", fontSize: "15",  display: "flex", justifyContent: "center", flexGrow: 1}}>Hexify Is Loading Your Custom Playlist</p>
                                </div>
                                <img id="loadGif" src="https://i.gyazo.com/ef5e74e3865be354f2060c5e40e1b86e.gif" alt="Please Wait, Playlist Loading..." 
                                style = {{
                                    width: "100%",
                                    height: "60%",
                                    marginTop: "10%",
                                }}/>
                                <div style={{display: "flex", alignItems: "center", height: "5%"}}>
                                        <p id = "purple_text" style={{fontFamily: "monospace", fontSize: "20",  display: "flex", justifyContent: "center", flexGrow: 1}}>Please Wait</p>
                                </div>
                            </div>
                        )}
                </div>
                <div style = {{display: "flex",justifyContent: "space-between", marginTop: "10%", paddingLeft: "2%", paddingRight: "2%"}}>
                    <Button onClick={(event) => this.setState({target: event.target})} variant="contained" color="primary" style={{width: "30%", height: "20", fontSize: "12"}}>
                        {this.props.privacyStatus}
                    </Button>
                    <Button onClick = {this.share} variant="contained" style = {{width: "30%", height: "20", fontSize: "12"}}>
                        Share
                    </Button>
                    <Button onClick={(event) => this.setState({target2: event.target})}variant="contained" color="secondary"style = {{width: "30%", height: "20", fontSize: "12"}}>
                        Clear
                    </Button>
                    <Menu
                        id="simple-menu"
                        open={menuOpen}
                        keepMounted
                        anchorEl={this.state.target}
                        onClose={() => this.setState({target: undefined})}
                    >
                        {["Public", "Private", "Unlisted"].map(str => <MenuItem key={str} onClick={() => {this.setState({target: undefined}, this.props.privacyCallback(str.toLowerCase()))}}>{str}</MenuItem>)}
                    </Menu>

                    <Menu
                    id="clear-menu"
                    open={clearOpen}
                    keepMounted
                    anchorEl={this.state.target2}
                    onClose={() => this.setState({target2: undefined})}
                >
                    <MenuItem onClick={() => {this.props.clearTracks();  this.setState({target2: undefined})}}>Clear</MenuItem>
                    <MenuItem onClick={() => this.setState({target2: undefined})}>Cancel</MenuItem>
                    </Menu>
                </div>
            </div>
        );
      }
}

export default PlaylistEditor;
