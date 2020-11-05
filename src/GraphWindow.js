import React from "react";
import PlaylistEditor from './Playlist_editor.js';
import ArtistEditor from './Artist_editor.js';
import * as d3 from "d3";
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import DummyData from "./DummyData/DummyArtists.json";
import TransactionStack from "./TransactionStack.js";
import { mouse } from "d3";

const cartesianToPixel = 20;
const selectedColor = "#B19CD9";
const hexRadius = cartesianToPixel;
const imageRadius = cartesianToPixel * .6;
const nodeBackground = "#d0d0d0";

class GraphWindow extends React.Component {

    constructor() {
        super();
        let randomArtist = DummyData.artists[Math.floor(DummyData.artists.length * Math.random())];
        this.state = {
            nodes: [
                {
                    ...randomArtist,
                    coords: { q: 0, r: 0},
                    selectedTracks: [],
                    image: null
                }
            ],
            selectedNode: null,
        };
        this.selectedQuickArtist = null;
        this.transactionStack = new TransactionStack(this.state.nodes);
        this.transform = null;
        this.canvas = null;
        this.ctx = null;
        this.mouseCoord = null;
        this.adjacentRecommendedArtists = [];
        this.topRecommendedArtists = DummyData.artists.slice(0, 6);
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
            y: (v - this.canvas.parentElement.offsetTop - this.transform.y) / this.transform.k,
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
            this.ctx.drawImage(node.image, x - imageRadius, y - imageRadius, 2 * imageRadius, 2 * imageRadius);
            this.ctx.restore();
        }
        if (node.image == null) {
            var img = new Image();
            img.addEventListener('load', () => {
                node.image = img;
                drawLoadedImage();
            }, true);
            img.src = node.images[0].url;
        }
        else {
            drawLoadedImage();
        }
    }

    drawQuickArtist() {
        this.drawCursor();
        const {x, y} = this.axialToCart(this.mouseCoord);
        const drawLoadedImage = () => {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x, y, imageRadius, 0, 2 * Math.PI);
            this.ctx.clip();
            this.ctx.drawImage(this.selectedQuickArtist.image, x - imageRadius, y - imageRadius, 2 * imageRadius, 2 * imageRadius);
            this.ctx.restore();
        }
        if (this.selectedQuickArtist.image === null || this.selectedQuickArtist.image === undefined) {
            var img = new Image();
            img.addEventListener('load', () => {
                this.selectedQuickArtist.image = img;
                drawLoadedImage();
            }, true);
            img.src = this.selectedQuickArtist.images[0].url;
        }
        else {
            drawLoadedImage();
        }
    }

    draw() {
        // Correct the canvas dimensions if the window has been resized
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.transform.x, this.transform.y);
        this.ctx.scale(this.transform.k, this.transform.k);

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

        if (this.adjacentRecommendedArtists.length === 0) {
            // Draw the recommended artists
            selectedNeighbors.forEach((neighborCoords) => {
                let randomArtist = DummyData.artists[Math.floor(DummyData.artists.length * Math.random())];
                const length = this.adjacentRecommendedArtists.push({
                    ...randomArtist,
                    coords: neighborCoords,
                    selectedTracks: [],
                    image: null
                });
                this.drawNodeImage(this.adjacentRecommendedArtists[length - 1]);
            });
        }

        if (this.mouseCoord != null) {
            this.drawCursor();
        }
    }

    componentDidMount() {
        const selection = d3.select("#graph_canvas");
        this.canvas = selection.node();
        this.ctx = this.canvas.getContext("2d");
        this.transform = d3.zoomIdentity.translate(this.canvas.offsetWidth / 2, this.canvas.offsetHeight / 2);
        selection.call(
            d3.zoom()
            .scaleExtent([1, 8])
            .wheelDelta((event) => {
                if(Math.abs(event.deltaY) < 5){
                    return -event.deltaY *  1 / 10;
                }else{
                    return -event.deltaY *  1 / 500;
                }
                
            })
            .clickDistance(4)
            .on("zoom", ({transform}) => {
                this.transform = transform;
                this.transform = this.transform.translate(this.canvas.offsetWidth / 2, this.canvas.offsetHeight / 2);
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
                this.drawQuickArtist();
            }
        };

        this.canvas.onmouseleave = (e) => {
            this.mouseCoord = null;
            this.draw();
        }

        this.canvas.onclick = (e) => {
            const mouseCoords = this.pixelToAxial(e.clientX, e.clientY);
            var flag = false;
            this.adjacentRecommendedArtists.forEach((node) => {
                if (node.coords.q === mouseCoords.q && node.coords.r === mouseCoords.r) {
                    const receipt = this.transactionStack.addNode(node)
                    if (receipt.update) {
                        this.setState({
                            selectedNode: node
                        });
                        this.adjacentRecommendedArtists = [];
                        this.draw();
                    }
                    flag = true;
                }
            });
            if (flag === false) {
                this.state.nodes.forEach((node) => {
                    if (node.coords.q === mouseCoords.q && node.coords.r === mouseCoords.r) {
                        this.setState({ selectedNode: node });
                        this.adjacentRecommendedArtists = [];
                        this.draw();
                        flag = true;
                    }
                });
            }
            if (flag === false) {
                this.setState({ selectedNode: null });
                this.adjacentRecommendedArtists = [];
                this.draw();
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                if (e.key === 'z') {
                    const receipt = this.transactionStack.undo();
                    if (receipt.update) {
                        this.adjacentRecommendedArtists = [];
                        this.setState({
                            nodes: receipt.nodes,
                            selectedNode: null
                        }, this.draw);
                    }
                }
                else if (e.key === 'y') {
                    const receipt = this.transactionStack.redo();
                    if (receipt.update) {
                        this.adjacentRecommendedArtists = [];
                        this.setState({
                            nodes: receipt.nodes,
                            selectedNode: null
                        }, this.draw);
                    }
                }
            }
            if (e.key === "Delete" && this.state.selectedNode != null) {
                const receipt = this.transactionStack.removeNode(this.state.selectedNode);
                if (receipt.update) {
                    this.adjacentRecommendedArtists = [];
                    this.setState({
                        nodes: receipt.nodes,
                        selectedNode: null
                    }, this.draw);
                }
            }
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
        this.selectedQuickArtist = artist;
        document.onmouseup =  (e) => {
            const mouseCoords = this.pixelToAxial(e.clientX, e.clientY);
            var node = {
                ...artist,
                coords: {q: mouseCoords.q, r: mouseCoords.r},
                selectedTracks: [],
                image: artist.image
            }
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

    render() {
        var index = 0;
        return (
            <div id="graph_window">
                <div id="playlist_column">
                    {this.state.selectedNode === null ? (
                        <PlaylistEditor nodes = {this.state.nodes}/>
                    ) : (
                        <div>
                        <IconButton edge="end" onClick = {this.showPlaylist} style ={{marginLeft:30, marginTop:30, position: "absolute", display: "inline"}}>
                            <ArrowBackIosIcon style = {{width: "2.5vh", height: "2.5vh" }}></ArrowBackIosIcon>
                        </IconButton>
                        <ArtistEditor selected = {this.state.selectedNode}/>
                        </div>
                    )}
                </div>
                <div id="sidebar_column">
                    <div
                        key={ index }
                        style={ this.quickAddStyle(index) }
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
                </div>
                <canvas id="graph_canvas" style={{ width: "100%", height: "100%" }}></canvas>
            </div>
        );
    }
}
export default GraphWindow;
