import React from "react";
import Playlist from './PlaylistScroll.js';
import Button from '@material-ui/core/Button'
import { Input } from "@material-ui/core";
import swal from 'sweetalert2';

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
            }else if(result.dismiss == "cancel") {
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
        return (
            <div id="playlist_editor" style={{ height: this.props.player ? "max(25rem, calc(100% - 3 * var(--playlist-column-margin) - var(--playback-height)))" : "max(25rem, calc(100% - 2 * var(--playlist-column-margin)))" }}>
                <div style={{display: "flex", alignItems: "center", height: "7.5%"}}>
                        <p id = "purple_text" style={{fontFamily: "monospace", fontSize: "20",  display: "flex", justifyContent: "center", flexGrow: 1}}>Playlist Editor</p>
                </div>
                <div style ={{display: "flex", height: "7.5%", justifyContent: "center"}}>
                    <Input onChange={this.handleSearch} style={{height: "80%", width:"80%",color: "white",fontFamily: "monospace"}} placeholder= "Search Playlist"></Input>
                </div>                  
                <div style ={{height: "77.5%"}}>
                    <Playlist player={this.props.player} tracks = {this.props.tracks.filter(tracks => tracks.name.toUpperCase().indexOf(this.state.text.toUpperCase()) !== -1)} delete = {this.props.deselectTrack} playTrack={this.props.playTrack} />
                </div>
                <div style = {{display: "flex",justifyContent: "space-between", height: "5%", paddingLeft: "2%", paddingRight: "2%"}}>
                    <Button variant="contained" color="primary"style = {{width: "30%", height: "20", fontSize: "12"}}>
                        Public
                    </Button>
                    <Button onClick = {this.share} variant="contained" style = {{width: "30%", height: "20", fontSize: "12"}}>
                        Share
                    </Button>
                    <Button onClick={this.props.clearTracks} variant="contained" color="secondary"style = {{width: "30%", height: "20", fontSize: "12"}}>
                        Clear
                    </Button>
                </div>
            </div>
        );
      }
}

export default PlaylistEditor;
