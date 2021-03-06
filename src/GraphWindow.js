import React from "react";
import * as d3 from "d3";
//import DummyData from "./DummyData/DummyArtists.json";
import TransactionStack from "./TransactionStack.js";
import Drawer from "@material-ui/core/Drawer";
import AWS from 'aws-sdk';

import ArtistEditor from './ArtistEditor.js';
import PlaylistEditor from './Playlist_editor.js';
import Playback from './Playback.js'
import Input from '@material-ui/core/Input';
import { List, ListItem, ListItemAvatar} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import swal from 'sweetalert2';
import { request, gql } from 'graphql-request'

const cartesianToPixel = 20;
const selectedColor = "#B19CD9";
const hexRadius = cartesianToPixel;
const imageRadius = cartesianToPixel * .6;
const nodeBackground = "#d0d0d0";
const bucket = "hexifythumbnails";

const CREATE_GRAPH = gql`
    mutation CreateGraphicalPlaylist($name: String!, $privacyStatus: String!) {
      createGraphicalPlaylist(name: $name, privacyStatus: $privacyStatus) {
        id
        lastModified
      }
    }
`

const UPDATE_GRAPH = gql`
    mutation UpdateGraphicalPlaylist($id: String!, $name: String!, $artists: [artistInput], $nodes: [nodeInput], $genres: [dictionaryInput] $privacyStatus: String!) {
    	updateGraphicalPlaylist(id: $id, name: $name, artists: $artists, nodes: $nodes, genres: $genres privacyStatus: $privacyStatus) {
    		id
            lastModified
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
      genres { 
        key
        value
        }
      lastModified
    }
  }
`

class GraphWindow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            trackIndex: 0,
            paused: true,
            selectedTracks: [],
            nodes: [],
            selectedNode: null,
            privacyStatus: "public",
            lastModified: "",
            topRecommendedArtists: [],
            loading: false
        };
        this.zoom = d3.zoom()
        this.loadedArtists = [];
        this.artistLookup = {};
        this.selectedQuickArtist = null;
        this.transform = null;
        this.canvas = null;
        this.ctx = null;
        this.mouseCoord = null;
        this.adjacentRecommendedArtists = [];
        this.queryingSimilar = false;
        this.playerLoaded = false;
        this.neverStarted = true;
        this.trackEnded = false;
        this.state.drawer = false;
        this.state.quickAddSearchResults = [];
        this.skips = 0;
        this.position = 0;
        this.id = undefined;
        this.graphName = "Untitled Graph";
        this.genreList = undefined;
        this.saving = false;
        this.saveAgain = false;
        this.uploading = false;
        this.uploadAgain = false;
        this.movingArtist = null;
        this.walking = false;
        this.transitioning = false;
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
            x: (u - this.canvas.offsetLeft - this.transform.x) / this.transform.k,
            y: (v - this.canvas.offsetTop  - this.transform.y) / this.transform.k,
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
        if (this.walking === false) {
            this.adjacentRecommendedArtists.forEach((node) => {
                if (node.coords.q === this.mouseCoord.q && node.coords.r === this.mouseCoord.r) {
                    var text = this.ctx.measureText(node.artist.name);
                    this.ctx.fillStyle = "white";
                    this.ctx.fillRect(x - 2, y - 12, text.width + 4, 16);
                    this.ctx.fillStyle = "black";
                    this.ctx.lineWidth = .5;
                    this.ctx.fillText(node.artist.name, x, y);
                }
            });
        }
    }

    drawHex(node, backgroundColor, ctx) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;

        // Draw hexagon
        ctx.beginPath();
        const omega = Math.PI / 3;
        const phi = Math.PI / 6;
        const {x, y} = this.axialToCart(node.coords);
        ctx.moveTo(x + hexRadius * Math.cos(phi), y + hexRadius * Math.sin(phi));
        // The end condition is 6 to avoid a janky corner
        for (let i = 0; i <= 6; i++) {
            ctx.lineTo(x + hexRadius * Math.cos(omega * (i + 1) + phi), y + hexRadius * Math.sin(omega * (i + 1) + phi));
        }

        ctx.fillStyle = backgroundColor;
        ctx.fill();
        ctx.stroke();

        // Draw artist image
        const imagePromise = this.drawNodeImage(node, ctx);

        for (let i = 0; i < 6; i++) {
            const startX = x + hexRadius * Math.cos(omega * (i + 1) + phi);
            const endX = x + 2 * hexRadius * Math.cos(omega * (i + 1) + phi);
            const startY = y + hexRadius * Math.sin(omega * (i + 1) + phi);
            const endY = y + 2 * hexRadius * Math.sin(omega * (i + 1) + phi);

            ctx.beginPath();

            const grd = this.ctx.createLinearGradient(
                startX,
                startY,
                endX,
                endY
            );
            grd.addColorStop(0, "black");
            grd.addColorStop(1, "transparent");
            ctx.strokeStyle = grd;

            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);

            ctx.stroke();
        }
        return imagePromise;
    }

    drawNodeImage(node, ctx) {
        if (ctx === undefined)
            ctx = this.ctx;
        const {x, y} = this.axialToCart(node.coords);
        const drawLoadedImage = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, imageRadius, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(node.artist.image, x - imageRadius, y - imageRadius, 2 * imageRadius, 2 * imageRadius);
            ctx.restore();
        }
        if (node.artist.image == null || node.artist.image === undefined) {
            return new Promise((resolve, reject) => {
                var img = new Image();
                img.crossOrigin = "Anonymous";
                img.addEventListener('load', () => {
                    node.artist.image = img;
                    drawLoadedImage();
                    resolve();
                }, true);
                img.addEventListener('error', reject, true);
                img.src = node.artist.images[0].url;
            });
        }
        else {
            drawLoadedImage();
        }
    }

    draw(canvas, ctx, transform, width, height) {
        const imagePromises = [];
        if (canvas === undefined || ctx === undefined || transform === undefined || width === undefined || height === undefined) {
            canvas = this.canvas;
            ctx = this.ctx;
            transform = this.transform;
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
        }
        // Correct the canvas dimensions if the window has been resized
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.translate(transform.x * window.devicePixelRatio, transform.y * window.devicePixelRatio);
        ctx.scale(transform.k * window.devicePixelRatio, transform.k * window.devicePixelRatio);

        var selectedNeighbors = [];
        if (canvas === this.canvas && this.state.selectedNode != null) {
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
            else if (this.walking === false) {
                this.adjacentRecommendedArtists.forEach((artistNode) => {
                    this.drawNodeImage(artistNode);
                });
            }
        }

        this.state.nodes.forEach((node) => {
            if (canvas === this.canvas &&
                this.state.selectedNode != null &&
                this.state.selectedNode.coords.q === node.coords.q &&
                this.state.selectedNode.coords.r === node.coords.r)
                this.drawHex(node, selectedColor, ctx);
            else
                imagePromises.push(this.drawHex(node, nodeBackground, ctx));
            if (canvas === this.canvas && selectedNeighbors.length > 0) {
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

        if (canvas === this.canvas && this.state.selectedNode != null && this.adjacentRecommendedArtists.length === 0 && this.queryingSimilar === false) {
            // Draw the recommended artists
            this.queryingSimilar = true;
            fetch("/v1/artists/" + this.state.selectedNode.artist.id + "/related-artists").then((response) => {
                response.json().then(d => {
                    var i = 0;
                    var filtered = d.artists.filter(artist => !(artist.id in this.artistLookup));
                    this.shuffleArtists(filtered);
                    //console.log("Shuffled", filtered);
                    var artistList = d.artists;
                    if(filtered.length >= 6){
                        artistList = filtered;
                        //console.log("in filtered");
                    }
                    artistList = artistList.filter(artist => !(artist.images === undefined || artist.images[0] === undefined || artist.images[0].url === undefined || artist.id === undefined));
                    selectedNeighbors.forEach((neighborCoords) => {
                        if(artistList.length - i > 0){
                            let artist = artistList[i];
                            this.artistLookup[artist.id] = artist;

                            const length = this.adjacentRecommendedArtists.push({
                                artist: artist,
                                coords: neighborCoords,
                                image: null
                            });
                            this.drawNodeImage(this.adjacentRecommendedArtists[length - 1]);
                            i++;
                        }
                    });
                    this.queryingSimilar = false;
                });
            });
        }

        if (canvas === this.canvas && this.mouseCoord != null) {
            this.drawCursor();
        }
        return imagePromises;
    }
    defaultSplash = (e) => {
        swal.fire({
            // title: 'Playlists Made Easy',
            allowOutsideClick: false,
            width: 500,
            padding: '0',
            showCancelButton: false,
            imageUrl: 'https://i.gyazo.com/257f44e08929fc1a0fc1d95301be456d.gif',
            // background: '#fff url()',
            confirmButtonText: `Login With Spotify`,
            confirmButtonColor: "#1DB954",
            backdrop: `
                rgba(0,0,123,0.4)
            `
          }).then((result) => {
            if (result.isConfirmed) {
                window.location.pathname = '/auth/spotify';
            }})
          //Original https://i.pinimg.com/originals/e0/94/d9/e094d9bb9a23354435ac138f3200e53d.gif
          //larger image https://i.gyazo.com/f1ee894e7f75081ec30b527dd3618847.gif
    }

    componentDidMount() {
        console.log("Graph Window mounted");
        window.onSpotifyWebPlaybackSDKReady = () => {
            fetch('/v1/me').then(userResp => {
                console.log(userResp);
                if (userResp.ok) {
                    userResp.json().then(userData => {
                        if (userData.product === "premium") {
                            fetch('/auth/token').then(response => response.json()).then(data => {
                                this.props.loginCallback(true);
                                const player = new window.Spotify.Player({
                                    name: 'Hexify.us',
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
                        }
                    });
                }
                else {
                    this.props.loginCallback(false);
                    this.defaultSplash();      
                }
            });
        };

        AWS.config.update({
            region: "us-east-1",
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: "us-east-1:3abb82ba-8894-4534-95c5-b7ba2a06cc76"
            })
        });

        this.s3 = new AWS.S3({
          apiVersion: "2006-03-01",
          params: { Bucket: bucket }
        });

        this.thumbCanvas = document.getElementById("thumb_canvas")

        const selection = d3.select("#graph_canvas");
        this.canvas = selection.node();
        this.ctx = this.canvas.getContext("2d");
        this.transform = d3.zoomIdentity;

        // Highlight the tile under the cursor
        const highlightCursor = (e) => {
            this.mouseCoord = this.pixelToAxial(e.clientX, e.clientY);
            this.draw();
            if(this.selectedQuickArtist !== null){
                this.selectedQuickArtist.coords = this.mouseCoord;
                this.drawNodeImage(this.selectedQuickArtist);
            }
        };
        this.canvas.onmousemove = highlightCursor;

        selection.call(
            this.zoom
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
            .on("zoom", (d3event) => {
                this.transform = d3event.transform;
                this.draw();
            })
        );
        let defaultTransform = this.transform;
        defaultTransform.k *= 2.5;
        selection.call(d3.zoom().transform, defaultTransform);

        // Draw the graph for the first time
        this.draw();

        // Redraw if the window size changes
        // TODO: replace this with a mutation observer
        window.onresize = () => this.draw();

        this.canvas.onmouseleave = (e) => {
            this.mouseCoord = null;
            this.draw();
        }

        this.canvas.onclick = (e) => {
            const mouseCoords = this.pixelToAxial(e.clientX, e.clientY);
            if (e.button === 0) {
                if (this.walking === true) {
                    this.state.nodes.forEach(node => {
                        if (node.coords.q === mouseCoords.q && node.coords.r === mouseCoords.r)
                            this.setState({selectedNode: node}, () => this.walkTheGraph(node));
                    });
                }
                else {
                    var flag = false;
                    this.adjacentRecommendedArtists.forEach(async (node) => {
                        if (node.coords.q === mouseCoords.q && node.coords.r === mouseCoords.r) {
                            flag = true;
                            console.log("add node from recommended artists");
                            this.updateGenres(node.artist.genres);

                            if (this.transactionStack === undefined)
                                await this.createGraph();
                            const receipt = this.transactionStack.addNode(node)
                            if (receipt.update) {
                                this.adjacentRecommendedArtists = [];
                                this.save();
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
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && this.transactionStack) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.save();
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
                        }, () => {
                            this.save();
                            this.draw();
                        });
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
                        }, () => {
                            this.save();
                            this.draw();
                        });
                    }
                }
            }
            if (e.key === "Delete" && this.state.selectedNode != null) {
                this.removeNode(this.state.selectedNode);
                this.deselectNode();
            }
            if (e.key === "Escape") {
                console.log("escaped");
                this.setState({selectedNode: null}, () => {
                    this.adjacentRecommendedArtists = [];
                    this.walking = false;
                    clearInterval(this.transitionInterval);
                    selection.call(
                        this.zoom
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
                        .on("zoom", (d3event) => {
                            this.transform = d3event.transform;
                            this.draw();
                        })
                    );
                });
            }
        });

        // Get the user's top artists
        fetch("/v1/me/top/artists?time_range=medium_term").then((response) => {
            console.log(response);
            response.json().then(d => {
                if (d.items !== undefined)
                    this.setState({ topRecommendedArtists: d.items });
            });
        });

        this.nameInterval = setInterval(() => {
            const newName = this.props.graphName();
            if (newName !== undefined && newName !== "" && newName !== this.graphName) {
                this.graphName = newName;
                this.save();
            }
        }, 1000);
    }

    async upload() {
        if (!this.uploading && this.thumbCanvas !== undefined && this.id !== undefined && this.s3 !== undefined && this.canvas !== undefined) {
            this.uploading = true;
            const Key = this.id + ".png";
            
            // Get signed URL from S3
            const s3Params = {
                Bucket: bucket,
                Key,
                Expires: 300,
                ContentType: 'image/png'
            }
            const uploadURL = await this.s3.getSignedUrlPromise('putObject', s3Params);

            var minQ = Number.MAX_VALUE;
            var minR = Number.MAX_VALUE;
            var maxQ = Number.MIN_VALUE;
            var maxR = Number.MIN_VALUE;
            this.state.nodes.forEach(node => {
                minQ = node.coords.q < minQ ? node.coords.q : minQ;
                minR = node.coords.r < minR ? node.coords.r : minR;
                maxQ = node.coords.q > maxQ ? node.coords.q : maxQ;
                maxR = node.coords.r > maxR ? node.coords.r : maxR;
            });
            const min = this.axialToCart({q: minQ, r: minR});
            const max = this.axialToCart({q: maxQ, r: maxR});
            const transform = {
                x: Math.ceil(4 * cartesianToPixel - min.x),
                y: Math.ceil(4 * cartesianToPixel - min.y),
                k: 1
            };
            const width = Math.ceil(max.x + 8 * cartesianToPixel - min.x);
            const height = Math.ceil(max.y + 8 * cartesianToPixel - min.y);
            this.thumbCanvas.style.width = width / 5;
            this.thumbCanvas.style.height = height / 5;
            Promise.all(this.draw(this.thumbCanvas, this.thumbCanvas.getContext("2d"), transform, width, height)).then(() => {
                this.thumbCanvas.toBlob(async (blob) => {
                    await fetch(uploadURL, {
                        method: 'PUT',
                        body: blob
                    });
                    this.uploading = false;
                    if (this.uploadAgain) {
                        this.uploadAgain = false;
                        this.upload();
                    }
                }, "image/png", .8);
            }).catch(() => {
                this.uploading = false;
                if (this.uploadAgain) {
                    this.uploadAgain = false;
                    this.upload();
                }
            });

        }
        else
            this.uploadAgain = true;
    }

    async save() {
        if (this.saving) {
            this.saveAgain = true;
        }
        else {
            this.saving = true;
            this.props.savingCallback(true);
            if (this.transactionStack === undefined)
                await this.createGraph();
            const artists = [];
            const nodes = this.state.nodes.map((node) => {
                const index = artists.findIndex(artist => artist.id === node.artist.id);
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
            console.log(nodes);
            console.log(artists);

            this.upload();
            request('/graphql', UPDATE_GRAPH,
            {
                id: this.id,
                name: this.graphName,
                artists: artists,
                nodes: nodes,
                privacyStatus: this.state.privacyStatus,
                genres: this.genreList,
            }).then(d => {
                this.saving = false;
                this.props.savingCallback(false, d.updateGraphicalPlaylist.lastModified);
                if (this.saveAgain || d === undefined || d.updateGraphicalPlaylist === undefined) {
                    setTimeout(() => {
                        this.saveAgain = false;
                        this.save();
                    }, 500);
                }
                
                if(d !== undefined && d.updateGraphicalPlaylist !== undefined){
                    // this.setState({lastModified: d.updateGraphicalPlaylist.lastModified});
                    this.lastModified = d.updateGraphicalPlaylist.lastModified;
                    this.artistLookup = {};
                    for(let i = 0; i < artists.length; i++){
                        this.artistLookup[artists[i].id] = artists[i];
                    }
                }
            });
        }
    }

    createGraph = async () => {
        let data = await request('/graphql', CREATE_GRAPH, { name: "Untitled graph", privacyStatus: this.state.privacyStatus});
        if (data && data.createGraphicalPlaylist) {
            this.id = data.createGraphicalPlaylist.id;
            this.props.savingCallback(false, data.createGraphicalPlaylist.lastModified);
            window.history.pushState({id: this.id}, data.createGraphicalPlaylist.name, "/edit/" + this.id);
            this.props.graphIdCallback(data.createGraphicalPlaylist.id);
            this.transactionStack = new TransactionStack(this.state.nodes, this.state.selectedTracks, data.createGraphicalPlaylist.id);
        }
    }

    async loadGraph(id) {
        var data;
        try {
            data = await request('/graphql', RETRIEVE_GRAPHICAL_PLAYLIST, {id: id});
            console.log(data);
        }
        catch (error) {
            window.location.pathname = "/edit";
        }
        this.props.savingCallback(false, data.retrieveGraphicalPlaylist.lastModified);
        this.id = data.retrieveGraphicalPlaylist.id;
        var artistIds = data.retrieveGraphicalPlaylist.artists.map(artist => artist.id);
        var trackIds = data.retrieveGraphicalPlaylist.artists.map(artist => artist.tracks).flat().map(tracks=> tracks.id);

        var tracks = [];
        for(let i = 0; i < Math.ceil(trackIds.length/50); i++){
            let response = await fetch("/v1/tracks?" + new URLSearchParams({'ids': trackIds.slice(i*50, (i+1)*50)}));
            let d = await response.json();
            tracks.push(...d.tracks);
        }
        console.log(tracks);

        var artists = [];
        for(let i = 0; i < Math.ceil(artistIds.length/50); i++) {
            let response = await fetch("/v1/artists?" + new URLSearchParams({'ids': artistIds.slice(i*50, (i+1)*50)}));
            let d = await response.json();
            artists.push(...d.artists);
        }
        console.log(artists);

        for(let i = 0; i < artists.length; i++){
            this.artistLookup[artists[i].id] = artists[i];
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
        console.log(selectedTracks);

        this.transactionStack = new TransactionStack(nodes, tracks, id);
        const currentTrack = (selectedTracks.length > 0) ? selectedTracks[0] : undefined;
        this.graphName = data.retrieveGraphicalPlaylist.name;
        this.genreList = data.retrieveGraphicalPlaylist.genres;
        this.props.graphNameCallback(this.graphName);
        this.setState({
            nodes: nodes,
            selectedTracks: selectedTracks,
            currentTrack: currentTrack,
            privacyStatus: data.retrieveGraphicalPlaylist.privacyStatus,
        }, () => {
            this.props.graphIdCallback(id);
            this.draw();
            this.upload();
        });
        this.lastModified = data.retrieveGraphicalPlaylist.lastModified; 
        // this.props.lastModifiedCallback(this.lastModified);
    }


    componentWillUnmount() {
        this.canvas.onmousemove = null;
        this.canvas.onmouseleave = null;
        this.canvas.onclick = null;
        clearInterval(this.nameInterval);
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
    updateGenres= (genres) => {
        if (this.genreList === undefined){
            this.genreList = [];
            genres.forEach((genre)=>{
                this.genreList.push({"key": genre, "value": 1});
             });
        }else{
           genres.forEach((genre)=>{
                let obj = this.genreList.find((o, i) => {
                    if (o.key === genre) {
                        this.genreList[i].value++;
                        return true; // stop searching
                    }
                });
                if(obj == undefined){
                    this.genreList.push({"key": genre, "value": 1});
                }
             });
        }
        this.genreList.sort((a, b) => b.value - a.value);
        console.log(this.genreList);
        console.log(this.genreList.slice(0,3));
    }

    handleQuickAddDrag = (artist, e) => {
        e.preventDefault();
        const mouseCoords = this.pixelToAxial(e.clientX, e.clientY);
        var node = {
            artist: artist,
            coords: {q: mouseCoords.q, r: mouseCoords.r},
            image: artist.image
        }
        console.log("add node from recommended artists");
        this.updateGenres(node.artist.genres);

        this.selectedQuickArtist = node;
        document.onmouseup =  async (e2) => {
            if (this.transactionStack === undefined)
                await this.createGraph();
            const receipt = this.transactionStack.addNode(node);
            if (receipt.update){
                this.selectedQuickArtist = null;
                this.setState({
                    nodes: receipt.nodes,
                    selectedNode: node
                }, () => {
                    this.save();
                    this.draw();
                });
            }
            this.adjacentRecommendedArtists = [];
            this.draw();
            document.onmouseup = null;
        }
    }

    selectTrack = (track) => {
        this.state.selectedTracks.push(track);
        if (this.state.currentTrack)
            this.setState({ selectedTracks: this.state.selectedTracks }, this.save);
        else
            this.setState({ selectedTracks: this.state.selectedTracks, currentTrack: track }, this.save);
    }

    deselectTrack = (track) => {
        const index = this.state.selectedTracks.findIndex(selectedTrack => selectedTrack.id === track.id);
        this.state.selectedTracks.splice(index, 1);
        if (index < this.state.trackIndex)
            this.setState({ selectedTracks: this.state.selectedTracks, trackIndex: this.state.trackIndex - 1 }, this.save);
        else
            this.setState({ selectedTracks: this.state.selectedTracks}, this.save);
    }

    clearTracks = async  () => {
        console.log(this.state.selectedTracks);
        if (this.state.player)
            this.state.player.pause();
        this.neverStarted = true;
        this.setState({ currentTrack: undefined, selectedTracks: [], paused: true }, this.save);
    }

    removeNode = async (node, keepTracks) => {
        if (this.transactionStack === undefined)
            await this.createGraph();
        const receipt = this.transactionStack.removeNode(this.state.selectedNode, keepTracks);
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
            this.save();
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

    populatePlaylist = async (id, tracks, token, URL, index) => {
        await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
            method: 'POST',
            body:JSON.stringify({ uris: tracks.slice(index*100,(index+1)*100).map(track => track.uri)}),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }});

        if(tracks.length > (100*(index+1))){
            console.log("RECALLING");
            await this.populatePlaylist(id, tracks, token, URL, index+1);
        }else{
            window.open(URL, '_blank');
        }
    };

    exportPlaylist = () => {
        this.state.player._options.getOAuthToken(access_token => {
            fetch(`https://api.spotify.com/v1/me/playlists`, {
            method: 'POST',
            body: JSON.stringify({ name: this.graphName,
             description: "Playlist Created Through Hexify",
             public : true}),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
            }}).then(res =>{res.json().then(res =>{console.log(res);
                this.populatePlaylist(res.id, this.state.selectedTracks, access_token, res.external_urls.spotify, 0)});
          });
        });
    };

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

    shuffleArtists = (array) => {
        var i = array.length,
            j = 0,
            temp;
        while (i--) {
            j = Math.floor(Math.random() * (i+1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    parseAlbums = async  (ids, tracks) =>{
        console.log(ids)
        var res = await fetch("/v1/albums/?ids="+ ids.toString());
        res = await res.json();
        console.log(res)
        if(res.albums !== undefined){
            for (var i = 0; i < res.albums.length; i++) {
                for (const track of res.albums[i].tracks.items) {
                    track['album'] = res.albums[i];
                }
                tracks = tracks.concat(res.albums[i].tracks.items);
            };
            return tracks;
        }
        return [];
    }  

    getAllTracks = async (node) => {
        const currentNode = {
            ...node,
        }
        var response = await fetch("/v1/artists/" + currentNode.artist.id + "/albums?market=US&include_groups=album,single&limit=50");
        var albums = await response.json();
        var ids = albums.items.map(a => a.id);
        var j = 0;
        var tracks = [];
        for(var j = 0; j < ids.length/20; j++){
            console.log(j)
            var tracks = await this.parseAlbums(ids.slice(j*20,(j+1)*20), tracks);
            console.log(tracks);
        }
        const seen = new Set();

        const filteredArr = tracks.filter(el => {
        const duplicate = seen.has(el.name);
        seen.add(el.name);
        return !duplicate;
        })

        // if(currentNode.artist.tracks === undefined){
            
        // }else{
        //     currentNode.artist.tracks= currentNode.artist.tracks.concat(filteredArr);
        // }
        currentNode.artist.detail = "all";
        currentNode.artist.tracks= filteredArr;
        if(this.state.selectedNode !== null){
            this.setState({selectedNode: currentNode});
        }
        return currentNode;
    }

    getTopTracks = async (node) => {
        const currentNode = {
            ...node,
        }
        var response = await fetch("/v1/artists/" + node.artist.id + "/top-tracks?market=US");
        var data = await response.json();
        var tracks = data.tracks;

        // if(currentNode.artist.tracks === undefined){
        //     currentNode.artist.tracks= tracks;
        // }else{
        //     currentNode.artist.tracks= currentNode.artist.tracks.concat(tracks);
        // }
        currentNode.artist.detail = "top";
        currentNode.artist.tracks= tracks;
        if(this.state.selectedNode !== null){
            this.setState({selectedNode: currentNode});
        }
        return currentNode;
    }
 

    selectRandomTracks =async (artist, artistTracks) => {
        if(artistTracks != undefined && this.state.selectedTracks != undefined){
            var count = 1 + Math.ceil(Math.random()*4);
            if(artistTracks.length < 5){
                count = artistTracks.length;
            }
            var ind = [];
            for(var i = 0; i< count; i++){
                console.log(artistTracks);
                var x = Math.floor(Math.random()*artistTracks.length);
                while(ind.includes(x)){
                    x = Math.floor(Math.random()*artistTracks.length);
                }
                ind = ind.concat(x);
                console.log(ind);
                var track = artistTracks[x];
                track.artist = artist;
                console.log(this.state.selectedTracks);
                console.log(track);
                //here
                this.selectTrack(track);
            }
        }
    }

    randomizePlaylist = async () => {
        await this.clearTracks();
        var nodesList = [];
        console.log(this.state.nodes);
        for (var node of this.state.nodes){
            var currentNode;
            if(node.artist.tracks === undefined){
                if(this.state.loading === false){
                    this.setState({loading:true})
                }
                //opted to just get top tracks here...more efficient plus better generation
                // currentNode = await this.getAllTracks(node);
                currentNode = await this.getTopTracks(node);
                console.log(currentNode);
            }else{
                currentNode = node;
            }
            nodesList = nodesList.concat(currentNode);
        }
        for (var node of nodesList){
            var artist = node.artist;
            var artistTracks = node.artist.tracks;
            await this.selectRandomTracks(artist,artistTracks);
        }
        console.log(this.state.selectedTracks);
        this.setState({nodes: nodesList, loading:false});    
    }  

    playRandomSong = async node => {
        const selectedTracks = this.state.selectedTracks.filter(track => track.artist.id === node.artist.id);
        if (node.artist.tracks === undefined)
            await this.getTopTracks(node);
        console.log(node.artist.tracks !== undefined);
        console.log(node.artist.tracks.length);
        if (selectedTracks.length > 0) {
            const randomTrack = selectedTracks[Math.floor(Math.random() * selectedTracks.length)];
            randomTrack.artist = node.artist;
            this.playTrack(randomTrack);
        }
        else if (node.artist.tracks !== undefined && node.artist.tracks.length > 0) {
            const randomTrack = node.artist.tracks[Math.floor(Math.random() * node.artist.tracks.length)];
            console.log(randomTrack);
            randomTrack.artist = node.artist;
            this.playTrack(randomTrack);
        }
    }

    walkTheGraph = (node) => {
        this.setState({selectedNode: node}, () => {
            if (this.state.currentTrack === undefined || this.state.currentTrack.artist.id !== node.artist.id)
                this.playRandomSong(node);
            this.walking = true;
            this.transitioning = true;
            const coords = this.axialToCart(node.coords);
            const n = 30;
            var count = 0;
            this.oldTransform = {...this.transform};
            if (this.transitionInterval !== undefined)
                clearInterval(this.transitionInterval);
            this.zoom.on("zoom", null);
            this.transitionInterval = setInterval(() => {
                const i = count / n;
                const k = this.oldTransform.k * (1 - i) + 8 * i;
                const x = this.oldTransform.x * (1 - i) + (this.canvas.width / 2 - coords.x * k) * i;
                const y = this.oldTransform.y * (1 - i) + (this.canvas.height / 2 - coords.y * k) * i;
                if (count < n) {
                    count += 1;
                    this.transform.x = x;
                    this.transform.y = y;
                    this.transform.k = k;
                    this.draw();
                }
                else {
                    clearInterval(this.transitionInterval);
                    this.transitioning = false;
                    this.transform.x = x;
                    this.transform.y = y;
                    this.transform.k = k;
                    this.draw();
                }
            }, 300 / n);
        });
    }

    render() {
        var index = 0;
        if (this.state.selectedNode !== null &&(this.state.selectedNode.artist.tracks === undefined || this.state.selectedNode.artist.detail === "top")){
            this.getAllTracks(this.state.selectedNode);
            //this.getAllTracks();
        }
        if (this.playerLoaded === false && this.state.player) {
            this.state.player.setVolume(.3);
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
                        <PlaylistEditor
                            privacyStatus={this.state.privacyStatus}
                            privacyCallback={(privacyStatus) => this.setState({privacyStatus: privacyStatus}, this.save)}
                            player={(this.state.selectedTracks.length > 0 || this.walking) ? this.state.player : undefined}
                            tracks={this.state.selectedTracks}
                            deselectTrack={this.deselectTrack}
                            clearTracks={this.clearTracks}
                            playTrack={(track) => this.playTrack(track)}
                            exportPlaylist ={() => {if(this.state.player != null){this.exportPlaylist()}}}
                            randomizePlaylist = {this.randomizePlaylist}
                            loading = {this.state.loading}
                        />
                    ) : (
                        <ArtistEditor player={(this.state.selectedTracks.length > 0 || this.walking) ? this.state.player : undefined}
                         node={this.state.selectedNode} 
                         selectedTracks={this.state.selectedTracks} 
                         selectTrack={this.selectTrack} 
                         deselectTrack={this.deselectTrack} 
                         walkTheGraph={this.walkTheGraph}
                         removeNode={this.removeNode} 
                         deselectNode={this.deselectNode} 
                         playTrack={(track) => this.playTrack(track)}
                         randomSelect = {this.selectRandomTracks}
                          />
                    )}
                    {(this.state.selectedTracks.length > 0 || this.walking) && this.state.player &&
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
                    this.state.topRecommendedArtists.filter(artist => !(artist.id in this.artistLookup)).slice(0, 6).map((artist) => {
                        index += 1;
                        return (
                            <div
                                key={ index }
                                onMouseDown = { this.handleQuickAddDrag.bind(this, artist) }

                                style={ this.quickAddStyle(index, artist.images[0].url) }
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
                <canvas id="thumb_canvas" style={{ backgroundColor: "white", marginLeft: "calc(var(--playlist-column-width))", marginTop: "var(--playlist-column-margin)", border: "solid", borderWidth: "2", borderRadius: "10px", borderColor: "gray", width: 100, height: 100, position: "absolute", pointerEvents: "none" }}></canvas>
            </div>
        );
    }
}
export default GraphWindow;
