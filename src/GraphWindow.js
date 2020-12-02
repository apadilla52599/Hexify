import React from "react";
import * as d3 from "d3";
import DummyData from "./DummyData/DummyArtists.json";
import TransactionStack from "./TransactionStack.js";
import Drawer from "@material-ui/core/Drawer";

import ArtistEditor from './ArtistEditor.js';
import PlaylistEditor from './Playlist_editor.js';
import Playback from './Playback.js'
import Input from '@material-ui/core/Input';
import { List, ListItem, ListItemAvatar} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import { request, gql } from 'graphql-request'

const cartesianToPixel = 20;
const selectedColor = "#B19CD9";
const hexRadius = cartesianToPixel;
const imageRadius = cartesianToPixel * .6;
const nodeBackground = "#d0d0d0";

const CREATE_GRAPH = gql`
    mutation CreateGraphicalPlaylist($name: String!, $privacyStatus: String!) {
      createGraphicalPlaylist(name: $name, privacyStatus: $privacyStatus) {
        id
      }
    }
`

const UPDATE_GRAPH = gql`
    mutation UpdateGraphicalPlaylist($id: String!, $name: String!, $artists: [artistInput], $nodes: [nodeInput], $privacyStatus: String!) {
    	updateGraphicalPlaylist(id: $id, name: $name, artists: $artists, nodes: $nodes, privacyStatus: $privacyStatus) {
    		id
    	}
    }
`

const RETRIEVE_GRAPHICAL_PLAYLIST = gql`
query RetrieveGraphicalPlaylist($id:String!){
    retrieveGraphicalPlaylist(id: $id){
      name
      id
      privacyStatus
      owner
      nodes{
        artistId
        q
        r
      }
      artists{
        id
        tracks {
          id
          name
          uri
        }
      }
      lastModified
    }
  }
`

const UPDATE_TRACKS = gql`
mutation($id:String!, $artistId: String!, $tracks: [trackInput]!){
    updateTracks(id: $id, artistId: $artistId, tracks: $tracks){
      id
    } 
  }
`

class GraphWindow extends React.Component {

    constructor(props) {
        super(props);
        DummyData.artists.forEach((artist) => {
            artist.image = null;
        });
        this.state = {
            trackIndex: 0,
            paused: true,
            selectedTracks: [],
            nodes: [],
            selectedNode: null,
        };
        this.selectedQuickArtist = null;
        this.transform = null;
        this.canvas = null;
        this.ctx = null;
        this.mouseCoord = null;
        this.adjacentRecommendedArtists = [];
        this.topRecommendedArtists = DummyData.artists.slice(0, 6);
        this.queryingSimilar = false;
        this.playerLoaded = false;
        this.neverStarted = true;
        this.trackEnded = false;
        this.state.drawer = false;
        this.state.quickAddSearchResults = [];
        this.skips = 0;
        this.position = 0;
        this.id = undefined;
        console.log("constructor");
        if (this.props.match && this.props.match.params)
            this.loadGraph(this.props.match.params.id);
    }

    axialToCart(coord) {
        return {
            x: Math.sqrt(3) * (coord.q + coord.r / 2.0) * cartesianToPixel,
            y: (3.0 / 2.0 * coord.r) * cartesianToPixel,
        }
    }

    cartToAxial(coord) {
        const q = (1.0 / Math.sqrt(3) * coord.x - 1.0 / 3.0 * coord.y) / cartesianToPixel;
        const r = 2.0 / 3.0 * coord.y / cartesianToPixel;
        const s = -q - r;

        var x = Math.round(q);
        var y = Math.round(r);
        const z = Math.round(s);

        const dx = Math.abs(x - q);
        const dy = Math.abs(y - r);
        const dz = Math.abs(z - s);

        if (dy > dx) {
            if (dx > dz) {
                if (q > x && r > y)
                    y += 1;
                else if (q < x && r < y)
                    y -= 1;
            }
            else {
                if (dy > dz && q > x && r > y)
                    y += 1;
                else if (dy > dz && q < x && r < y)
                    y -= 1;
            }
        }
        else {
            if (dz < dx) {
                if (q < x && r < y)
                    x -= 1;
                else if (q > x && r > y)
                    x += 1
            }
        }

        return {
            q: x,
            r: y,
        };
    }

    pixelToCart(u, v) {
        return {
            x: (u - this.canvas.parentElement.offsetLeft - this.transform.x) / this.transform.k,
            y: (v - this.canvas.parentElement.offsetTop  - this.transform.y) / this.transform.k,
        }
    }

    pixelToAxial(u, v) {
        return this.cartToAxial(this.pixelToCart(u, v));
    }

    drawCursor() {
        this.ctx.strokeStyle = selectedColor;
        this.ctx.lineWidth = 5;
        const radius = hexRadius - Math.ceil(this.ctx.lineWidth / 2);
        // Draw hexagon
        this.ctx.beginPath();
        const omega = Math.PI / 3;
        const phi = Math.PI / 6;
        const {x, y} = this.axialToCart(this.mouseCoord);
        this.ctx.moveTo(x + radius * Math.cos(phi), y + radius * Math.sin(phi));
        // The end condition is 6 to avoid a janky corner
        for (let i = 0; i <= 6; i++) {
            this.ctx.lineTo(x + radius * Math.cos(omega * (i + 1) + phi), y + radius * Math.sin(omega * (i + 1) + phi));
        }
        this.ctx.stroke();
    }

    drawHex(node, backgroundColor) {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;

        // Draw hexagon
        this.ctx.beginPath();
        const omega = Math.PI / 3;
        const phi = Math.PI / 6;
        const {x, y} = this.axialToCart(node.coords);
        this.ctx.moveTo(x + hexRadius * Math.cos(phi), y + hexRadius * Math.sin(phi));
        // The end condition is 6 to avoid a janky corner
        for (let i = 0; i <= 6; i++) {
            this.ctx.lineTo(x + hexRadius * Math.cos(omega * (i + 1) + phi), y + hexRadius * Math.sin(omega * (i + 1) + phi));
        }

        this.ctx.fillStyle = backgroundColor;
        this.ctx.fill();
        this.ctx.stroke();

        // Draw artist image
        this.drawNodeImage(node);

        for (let i = 0; i < 6; i++) {
            const startX = x + hexRadius * Math.cos(omega * (i + 1) + phi);
            const endX = x + 2 * hexRadius * Math.cos(omega * (i + 1) + phi);
            const startY = y + hexRadius * Math.sin(omega * (i + 1) + phi);
            const endY = y + 2 * hexRadius * Math.sin(omega * (i + 1) + phi);

            this.ctx.beginPath();

            const grd = this.ctx.createLinearGradient(
                startX,
                startY,
                endX,
                endY
            );
            grd.addColorStop(0, "black");
            grd.addColorStop(1, "transparent");
            this.ctx.strokeStyle = grd;

            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);

            this.ctx.stroke();
        }
    }

    drawNodeImage(node) {
        const {x, y} = this.axialToCart(node.coords);
        const drawLoadedImage = () => {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x, y, imageRadius, 0, 2 * Math.PI);
            this.ctx.clip();
            this.ctx.drawImage(node.artist.image, x - imageRadius, y - imageRadius, 2 * imageRadius, 2 * imageRadius);
            this.ctx.restore();
        }
        if (node.artist.image == null || node.artist.image === undefined) {
            var img = new Image();
            img.addEventListener('load', () => {
                node.artist.image = img;
                drawLoadedImage();
            }, true);
            img.src = node.artist.images[0].url;
        }
        else {
            drawLoadedImage();
        }
    }

    draw() {
        // Correct the canvas dimensions if the window has been resized
        this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.transform.x * window.devicePixelRatio, this.transform.y * window.devicePixelRatio);
        this.ctx.scale(this.transform.k * window.devicePixelRatio, this.transform.k * window.devicePixelRatio);

        var selectedNeighbors = [];
        if (this.state.selectedNode != null) {
            if (this.adjacentRecommendedArtists.length === 0) {
                selectedNeighbors = [
                    {
                        q: this.state.selectedNode.coords.q + 1,
                        r: this.state.selectedNode.coords.r
                    },
                    {
                        q: this.state.selectedNode.coords.q + 1,
                        r: this.state.selectedNode.coords.r - 1
                    },
                    {
                        q: this.state.selectedNode.coords.q,
                        r: this.state.selectedNode.coords.r + 1
                    },
                    {
                        q: this.state.selectedNode.coords.q - 1,
                        r: this.state.selectedNode.coords.r
                    },
                    {
                        q: this.state.selectedNode.coords.q - 1,
                        r: this.state.selectedNode.coords.r + 1
                    },
                    {
                        q: this.state.selectedNode.coords.q,
                        r: this.state.selectedNode.coords.r - 1
                    }
                ];
            }
            else {
                this.adjacentRecommendedArtists.forEach((artistNode) => {
                    this.drawNodeImage(artistNode);
                });
            }
        }

        this.state.nodes.forEach((node) => {
            if (this.state.selectedNode != null &&
                this.state.selectedNode.coords.q === node.coords.q &&
                this.state.selectedNode.coords.r === node.coords.r)
                this.drawHex(node, selectedColor);
            else
                this.drawHex(node, nodeBackground);
            if (selectedNeighbors.length > 0) {
                var removed = 0;
                for (let i = 0; i < selectedNeighbors.length; i++) {
                    let index = Math.round(i - removed);
                    if (selectedNeighbors[index].q === node.coords.q &&
                        selectedNeighbors[index].r === node.coords.r) {
                        selectedNeighbors.splice(index, 1);
                        removed += 1;
                    }
                }
            }
        });

        if (this.state.selectedNode != null && this.adjacentRecommendedArtists.length === 0 && this.queryingSimilar === false) {
            // Draw the recommended artists
            this.queryingSimilar = true;
            fetch("/v1/artists/" + this.state.selectedNode.artist.id + "/related-artists").then((response) => {
                response.json().then(d => {
                    var i = 0;
                    selectedNeighbors.forEach((neighborCoords) => {
                        let artist = d.artists[i];
                        var flag = false;
                        for (let j = 0; j < DummyData.artists.length; j++) {
                            if (DummyData.artists[j].id === artist.id) {
                                flag = true;
                                artist = DummyData.artists[j];
                            }
                        }
                        if (flag === false) {
                            DummyData.artists.push(artist);
                        }
                        const length = this.adjacentRecommendedArtists.push({
                            artist: artist,
                            coords: neighborCoords,
                            image: null
                        });
                        this.drawNodeImage(this.adjacentRecommendedArtists[length - 1]);
                        i++;
                    });
                    this.queryingSimilar = false;
                });
            });
        }

        if (this.mouseCoord != null) {
            this.drawCursor();
        }
    }

    componentDidMount() {
        console.log("Graph Window mounted");
        window.onSpotifyWebPlaybackSDKReady = () => {
            fetch('/auth/token').then(response => response.json()).then(data => {
                const player = new window.Spotify.Player({
                    name: 'Web Playback SDK Quick Start Player',
                    getOAuthToken: cb => { cb(data.token); }
                });
                console.log(data.token)
                // Error handling
                player.addListener('initialization_error', ({ message }) => { console.error(message);});
                player.addListener('authentication_error', ({ message }) => {console.error(message);});
                player.addListener('account_error', ({ message }) => { console.error(message); });
                player.addListener('playback_error', ({ message }) => { console.error(message); });

                // Playback status updates
                //player.addListener('player_state_changed', state => { console.log(state); });

                // Ready
                player.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                    this.setState({ player: player});
                });

                // Not Ready
                player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                });

                // Connect to the player!
                player.connect();
            });
        };
        const selection = d3.select("#graph_canvas");
        this.canvas = selection.node();
        this.ctx = this.canvas.getContext("2d");
        this.transform = d3.zoomIdentity;
        selection.call(
            d3.zoom()
            //.extent([[0, 0], [1900, 1000]])
            .wheelDelta((event) => {
                if ((this.transform.k < 1 && event.deltaY > 0) || (this.transform.k > 8 && event.deltaY < 0)) {
                    event.preventDefault();
                    return 0;
                }
                else {
                    if(Math.abs(event.deltaY) < 5){
                        return -event.deltaY *  1 / 10;
                    }else{
                        return -event.deltaY *  1 / 500;
                    }
                }
            })
            .clickDistance(4)
            .on("zoom", ({transform}) => {
                this.transform = transform;
                /*this.transform.x *= window.devicePixelRatio;
                this.transform.y *= window.devicePixelRatio;
                this.transform.k *= window.devicePixelRatio;*/
                this.draw();
            })
        );

        // Draw the graph for the first time
        this.draw();

        // Redraw if the window size changes
        // TODO: replace this with a mutation observer
        window.onresize = () => this.draw();

        // Highlight the tile under the cursor
        this.canvas.onmousemove = (e) => {
            this.mouseCoord = this.pixelToAxial(e.clientX, e.clientY);
            this.draw();
            if(this.selectedQuickArtist !== null){
                this.selectedQuickArtist.coords = this.mouseCoord;
                this.drawNodeImage(this.selectedQuickArtist);
            }
        };

        this.canvas.onmouseleave = (e) => {
            this.mouseCoord = null;
            this.draw();
        }

        this.canvas.onclick = (e) => {
            const mouseCoords = this.pixelToAxial(e.clientX, e.clientY);
            if (this.state.selectedNode !== null &&
                this.state.selectedNode.coords.q === mouseCoords.q &&
                this.state.selectedNode.coords.r === mouseCoords.r) {
                this.adjacentRecommendedArtists = [];
                this.setState({selectedNode: null}, this.draw);
                return;
            }
            var flag = false;
            this.adjacentRecommendedArtists.forEach(async (node) => {
                if (node.coords.q === mouseCoords.q && node.coords.r === mouseCoords.r) {
                    flag = true;
                    console.log("add node from recommended artists");
                    if (this.transactionStack === undefined)
                        await this.createGraph();
                    const receipt = this.transactionStack.addNode(node)
                    if (receipt.update) {
                        this.adjacentRecommendedArtists = [];
                        this.setState({
                            selectedNode: node
                        }, this.draw);
                    }
                }
            });
            if (flag === false) {
                this.state.nodes.forEach((node) => {
                    if (node.coords.q === mouseCoords.q && node.coords.r === mouseCoords.r) {
                        flag = true;
                        this.adjacentRecommendedArtists = [];
                        this.setState({ selectedNode: node });
                        this.draw();
                    }
                });
            }
            if (flag === false) {
                this.adjacentRecommendedArtists = [];
                this.setState({ selectedNode: null });
                this.draw();
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && this.transactionStack) {
                if (e.key === 's') {
                    e.preventDefault();
                    const artists = [];
                    const nodes = this.state.nodes.map((node) => {
                        const index = artists.indexOf(artist => artist.id === node.artist.id);
                        if (index === -1)
                            artists.push({
                                id: node.artist.id,
                                name: node.artist.name,
                                tracks: this.state.selectedTracks.filter(track => track.artist.id === node.artist.id).map(track => {
                                    return {
                                        id: track.id,
                                        name: track.name,
                                        uri: track.uri
                                    }
                                })
                            });
                        return {
                            q: node.coords.q,
                            r: node.coords.r,
                            artistId: node.artist.id
                        }
                    });
                    request('/graphql', UPDATE_GRAPH,
                    {
                        id: this.id,
                        name: "Untitled graph",
                        artists: artists,
                        nodes: nodes,
                        privacyStatus: "private"
                    });
                }
                if (e.key === 'z') {
                    const receipt = this.transactionStack.undo();
                    if (receipt.update) {
                        this.adjacentRecommendedArtists = [];
                        let newIndex = this.state.trackIndex;
                        receipt.addedTracks.forEach(({index, track}) => {
                            this.state.selectedTracks.splice(index, 0, track);
                            if (index < this.state.trackIndex)
                                newIndex++;
                        });
                        [...receipt.removedTracks].reverse().forEach(({index, track}) => {
                            if (index < this.state.trackIndex)
                                newIndex--;
                            this.state.selectedTracks.splice(index, 1);
                        });
                        this.setState({
                            nodes: receipt.nodes,
                            selectedTracks: this.state.selectedTracks,
                            trackIndex: newIndex,
                            selectedNode: null
                        }, this.draw);
                    }
                }
                else if (e.key === 'y') {
                    const receipt = this.transactionStack.redo();
                    if (receipt.update) {
                        this.adjacentRecommendedArtists = [];
                        let newIndex = this.state.trackIndex;
                        receipt.addedTracks.forEach(({index, track}) => {
                            this.state.selectedTracks.splice(index, 0, track);
                            if (index < this.state.trackIndex)
                                newIndex++;
                        });
                        [...receipt.removedTracks].reverse().forEach(({index, track}) => {
                            if (index < this.state.trackIndex)
                                newIndex--;
                            this.state.selectedTracks.splice(index, 1);
                        });
                        this.setState({
                            nodes: receipt.nodes,
                            selectedTracks: this.state.selectedTracks,
                            trackIndex: newIndex,
                            selectedNode: null
                        }, this.draw);
                    }
                }
            }
            if (e.key === "Delete" && this.state.selectedNode != null) {
                this.removeNode(this.state.selectedNode);
                this.deselectNode();
            }
        });
    }

    createGraph = async () => {
        let data = await request('/graphql', CREATE_GRAPH, { name: "Untitled graph", privacyStatus: "private" });
        if (data && data.createGraphicalPlaylist) {
            this.id = data.createGraphicalPlaylist.id;
            this.props.graphIdCallback(data.createGraphicalPlaylist.id);
            this.transactionStack = new TransactionStack(this.state.nodes, this.state.selectedTracks, data.createGraphicalPlaylist.id);
        }
    }

    async loadGraph(id) {
        this.id = id;
        let data = await request('/graphql', RETRIEVE_GRAPHICAL_PLAYLIST, {id: id});
        var artistIds = data.retrieveGraphicalPlaylist.artists.map(artist => artist.id);
        var trackIds = data.retrieveGraphicalPlaylist.artists.map(artist => artist.tracks).flat().map(tracks=> tracks.id);

        var tracks = [];
        for(let i = 0; i < Math.ceil(trackIds.length/50); i++){
            let response = await fetch("/v1/tracks?" + new URLSearchParams({'ids': trackIds.slice(i*50, (i+1)*50)}));
            let d = await response.json();
            tracks.push(...d.tracks);
        }

        var artists = [];
        for(let i = 0; i < Math.ceil(artistIds.length/50); i++) {
            let response = await fetch("/v1/artists?" + new URLSearchParams({'ids': artistIds.slice(i*50, (i+1)*50)}));
            let d = await response.json();
            artists.push(...d.artists);
        }

        var selectedTracks = [];
        artists.forEach(artist => {
            data.retrieveGraphicalPlaylist.artists.find(savedArtist => artist.id === savedArtist.id)
                .tracks.forEach(artistTrack => {
                const trackIndex = tracks.findIndex(track => track.id === artistTrack.id);
                tracks[trackIndex].artist = artist;
                selectedTracks.push(...tracks.splice(trackIndex, 1));
            });
        });

        var nodes = data.retrieveGraphicalPlaylist.nodes.map(node => {
            const artist = artists.find(artist => artist.id === node.artistId);
            return {
                artist: artist,
                coords: {q: node.q, r: node.r}
            }
        });

        this.transactionStack = new TransactionStack(nodes, tracks, id);
        const currentTrack = (selectedTracks.length > 0) ? selectedTracks[0] : undefined;
        this.setState({nodes: nodes, selectedTracks: selectedTracks, currentTrack: currentTrack}, () => {
            this.props.graphIdCallback(id);
            this.draw();
        }); 
    }

    componentWillUnmount() {
        this.canvas.onmousemove = null;
        this.canvas.onmouseleave = null;
        this.canvas.onclick = null;
    }

    showPlaylist = () => {
        this.setState({
            selectedNode: null
        });
    }

    deselectNode = () => {
        this.adjacentRecommendedArtists = [];
        this.setState({ selectedNode: null }, this.draw);
    }

    quickAddStyle(index, image) {
        const style = {
            width: "var(--sidebar-width)",
            height: "var(--sidebar-width)",
            position: "absolute",
            borderRadius: "50%",
            top: "calc(max(var(--sidebar-offset), 3 * (var(--sidebar-width) + var(--sidebar-margin)) + var(--titlebar-height)) + " + (index - 3) + " * (var(--sidebar-width) + var(--sidebar-margin)))",
            marginTop: "var(--sidebar-margin)",
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "all"
        }
        if (image !== undefined)
            return {
                ...style, 
                backgroundImage: "url(" + image + ")",
                backgroundSize: "contain",
            };
        else
            return {
                ...style,
                backgroundColor: nodeBackground
            };
    }

    handleQuickAddDrag = (artist, e) => {
        e.preventDefault();
        const mouseCoords = this.pixelToAxial(e.clientX, e.clientY);
        var node = {
            artist: artist,
            coords: {q: mouseCoords.q, r: mouseCoords.r},
            image: artist.image
        }
        this.selectedQuickArtist = node;
        document.onmouseup =  async (e) => {
            if (this.transactionStack === undefined)
                await this.createGraph();
            const receipt = this.transactionStack.addNode(node);
            if (receipt.update){
                this.setState({
                    nodes: receipt.nodes,
                    selectedNode: node
                });
                this.selectedQuickArtist = null;
            }
            this.adjacentRecommendedArtists = [];
            this.draw();
            document.onmouseup = null;
        }
    }

    selectTrack = (track) => {
        this.state.selectedTracks.push(track);
        var selectedTracks = this.state.selectedTracks.map((track)=> 
        {
            let obj = {
                id: track.id,
                name: track.name,
                uri: track.uri
            };
            return obj
        });
        request('/graphql', UPDATE_TRACKS, {
            id: this.transactionStack.id,
            artistId: track.artist.id,
            tracks: selectedTracks
        });
        if (this.state.currentTrack)
            this.setState({ selectedTracks: this.state.selectedTracks });
        else
            this.setState({ selectedTracks: this.state.selectedTracks, currentTrack: track });
    }

    deselectTrack = (track) => {
        const index = this.state.selectedTracks.findIndex(selectedTrack => selectedTrack.id === track.id);
        this.state.selectedTracks.splice(index, 1);
        var selectedTracks = this.state.selectedTracks.map((track)=> 
        {
            let obj = {
                id: track.id,
                name: track.name,
                uri: track.uri
            };
            return obj
        });
        request('/graphql', UPDATE_TRACKS, {
            id: this.transactionStack.id,
            artistId: track.artist.id,
            tracks: selectedTracks
        });
        if (index < this.state.trackIndex)
            this.setState({ selectedTracks: this.state.selectedTracks, trackIndex: this.state.trackIndex - 1 });
        else
            this.setState({ selectedTracks: this.state.selectedTracks});
    }

    clearTracks = () => {
        if (this.state.player)
            this.state.player.pause();
        this.neverStarted = true;
        this.setState({ currentTrack: undefined, selectedTracks: [], paused: true });
    }

    removeNode = async (node) => {
        if (this.transactionStack === undefined)
            await this.createGraph();
        const receipt = this.transactionStack.removeNode(this.state.selectedNode);
        if (receipt.update) {
            this.adjacentRecommendedArtists = [];
            var newIndex = this.state.trackIndex;
            // console.log(receipt.removedTracks);
            [...receipt.removedTracks].reverse().forEach(({index, track}) => {
                if (index < this.state.trackIndex)
                    newIndex--;
                this.state.selectedTracks.splice(index, 1);
            });
            // console.log(receipt.removedTracks);
            var selectedNode = this.state.selectedNode;
            if (selectedNode.coords.q === node.coords.q && selectedNode.coords.r === node.coords.r)
                selectedNode = null;
            this.setState({
                nodes: receipt.nodes,
                trackIndex: newIndex,
                selectedNode: selectedNode
            }, this.draw);
        }
    }

    play = ({
      spotify_uri,
      playerInstance: {
        _options: {
          getOAuthToken,
          id
        }
      }
    }) => {
      getOAuthToken(access_token => {
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [spotify_uri] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          },
        });
      });
    };

    playTrack(track) {
        this.play({ spotify_uri: track.uri, playerInstance: this.state.player });
        this.setState({ currentTrack: track, paused: false });
    }

    playNextTrack(prev) {
        if (this.state.selectedTracks.length === 0)
            return;
        let nextIndex = (this.state.trackIndex + ((prev !== undefined) ? -1 : 1)) % this.state.selectedTracks.length;
        if (nextIndex < 0)
            nextIndex += this.state.selectedTracks.length;
        this.skips++;
        setTimeout(() => {
            if (this.skips === 1) {
                if (this.state.paused) {
                    this.neverStarted = true;
                }
                else {
                    this.play({ spotify_uri: this.state.selectedTracks[nextIndex].uri, playerInstance: this.state.player });
                }
            }
            this.skips--;
        }, 500);
        this.updatePosition = true;
        this.setState({ currentTrack: this.state.selectedTracks[nextIndex], trackIndex: nextIndex, paused: false });
    }

    openQuickAddSearchDrawer = () => {
        if (this.state.drawer === true){
            this.setState({drawer: false, quickAddSearchResults: []});
        }
        else{
            this.setState({drawer: true});
            this.setState({quickAddSearchText: ""});
        }
    }

    handleQuickAddSearch = (e) => {
        if(e.target.value !== ""){
            fetch("/v1/search?q=" + e.target.value + "&type=artist&limit=6").then((response) => {
                response.json().then(res => {
                    res.artists.items = res.artists.items.filter(item => item.images.length > 0);
                    this.setState({quickAddSearchResults: res.artists.items})
                });
            });
        }
    }

    endDrawer = (artist, e) => {
        this.setState({drawer: false, quickAddSearchResults: []});
        this.handleQuickAddDrag(artist, e)
    }

    seekPositionSong = (position) => {
        console.log("position");
        console.log(position)
        this.state.player.seek(position);
    }

    render() {
        var index = 0;
        if (this.state.selectedNode !== null && this.state.selectedNode.artist.tracks === undefined) {
            fetch("/v1/artists/" + this.state.selectedNode.artist.id + "/top-tracks?market=US").then((response) => {
                response.json().then(d => {
                    const selectedNode = {
                        ...this.state.selectedNode,
                    }
                    selectedNode.artist.tracks = d.tracks;
                    var flag = false;
                    for(let i = 0; i < this.state.nodes.length - 1; i++){
                        if(selectedNode.artist.id === this.state.nodes[i].artist.id){
                            flag = true;
                            selectedNode.artist = this.state.nodes[i].artist;
                        }
                    }
                    if(flag === false){
                        selectedNode.artist.selectedTracks = [];
                    }
                    this.setState({selectedNode: selectedNode});
                });
            });
        }
        if (this.playerLoaded === false && this.state.player) {
            this.playerLoaded = true;
            this.state.player.addListener('player_state_changed', (playerState) => {
                if (playerState.position === 0 && playerState.paused && !this.state.paused && this.state.selectedTracks.length > 1 && !this.trackEnded) {
                    this.trackEnded = true;
                    this.playNextTrack();
                }
                else if (this.trackEnded && !playerState.paused)
                    this.trackEnded = false;
            });
        }
        
        return (
            <div id="graph_window">
                <div id="playlist_column">
                    {this.state.selectedNode === null ? (
                        <PlaylistEditor player={this.state.selectedTracks.length > 0 ? this.state.player : undefined} tracks={this.state.selectedTracks} deselectTrack={this.deselectTrack} clearTracks={this.clearTracks} playTrack={(track) => this.playTrack(track)} />
                    ) : (
                        <ArtistEditor player={this.state.selectedTracks.length > 0 ? this.state.player : undefined} node={this.state.selectedNode} selectedTracks={this.state.selectedTracks} selectTrack={this.selectTrack} deselectTrack={this.deselectTrack} removeNode={this.removeNode} deselectNode={this.deselectNode} playTrack={(track) => this.playTrack(track)} />
                    )}
                    {this.state.selectedTracks.length > 0 && this.state.player &&
                        <Playback
                            player={this.state.player}
                            paused={this.state.paused}
                            play={() => {
                                var currentTrack;
                                if (this.state.selectedTracks.length > 0)
                                    currentTrack = this.state.selectedTracks[0];
                                if (this.state.currentTrack)
                                    currentTrack = this.state.currentTrack;
                                if (currentTrack) {
                                    if (this.neverStarted) {
                                        this.play({ spotify_uri: currentTrack.uri, playerInstance: this.state.player });
                                        this.neverStarted = false;
                                        this.setState({ paused: false, currentTrack: currentTrack });
                                    }
                                    else {
                                        this.state.player.resume();
                                        this.setState({ paused: false });
                                    }
                                }
                            }}
                            pause={() => {this.state.player.pause(); this.setState({ paused: true });}}
                            setVolume={(volume) => this.state.player.setVolume(volume)}
                            seekPosition={(position) => this.seekPositionSong(position)}
                            skip={() => this.playNextTrack()}
                            prev={() => this.playNextTrack(true)}
                            track={this.state.currentTrack}/>}
                </div>
                
                <div id="sidebar_column">
                    <div
                        key={ index }
                        style={ this.quickAddStyle(index) }
                        onClick= {this.openQuickAddSearchDrawer}
                    >
                        <i className="fas fa-search" style={ { fontSize: "1.5rem" } }></i>
                    </div>
                {
                    this.topRecommendedArtists.map((artist) => {
                        index += 1;
                        return (
                            <div
                                key={ index }
                                onMouseDown = { this.handleQuickAddDrag.bind(this, DummyData.artists[index - 1]) }

                                style={ this.quickAddStyle(index, DummyData.artists[index - 1].images[0].url) }
                            />
                        );
                    })
                }
                <Drawer anchor='right' open={this.state.drawer}  onClose={this.openQuickAddSearchDrawer}>
                    <Input onChange={this.handleQuickAddSearch} style={{height: "28px", color: "black", width: "100%", fontFamily: "monospace"}} placeholder= "Search for An Artist"></Input>
                    <List style={{width: "20vw"}}>
                        {this.state.quickAddSearchResults.map(artist =>
                            <ListItem onMouseDown={this.endDrawer.bind(this, artist)}>
                                <ListItemAvatar>
                                    <Avatar sizes="large" src={artist.images[0].url}></Avatar>
                                </ListItemAvatar>
                                {artist.name}
                            </ListItem>)}
                    </List>
                </Drawer>
                </div>
                <canvas id="graph_canvas" style={{ width: "100%", height: "100%" }}></canvas>
            </div>
        );
    }
}
export default GraphWindow;
