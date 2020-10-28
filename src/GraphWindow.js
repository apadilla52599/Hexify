import React from "react";
import Playlist_editor from './Playlist_editor.js';
import Artist_editor from './Artist_editor.js';
import * as d3 from "d3";
import SpotifyPlayer from 'react-spotify-web-playback';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

const cartesianToPixel = 20;

class GraphWindow extends React.Component {

    constructor() {
        super();
        this.state = {displayed: "Artist_editor"};
        console.log(this.state.displayed)
        this.nodes = [
            { q: 0, r: 0}
        ];
        this.transform = null;
        this.canvas = null;
        this.mouseCoord = null;
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

    drawHex(ctx, axialCoord, color, corona) {
        // Draw Hexagon
        var radius = cartesianToPixel;
        if (color === undefined || color === "black") {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
        }
        else {
            ctx.strokeStyle = color;
            ctx.lineWidth = 5;
            radius -= Math.ceil(ctx.lineWidth / 2);
        }
        ctx.beginPath();
        const omega = Math.PI / 3;
        const phi = Math.PI / 6;
        const {x, y} = this.axialToCart(axialCoord);
        ctx.moveTo(x + radius * Math.cos(phi), y + radius * Math.sin(phi));
        // The end condition is 6 to avoid a janky corner
        for (let i = 0; i <= 6; i++) {
            ctx.lineTo(x + radius * Math.cos(omega * (i + 1) + phi), y + radius * Math.sin(omega * (i + 1) + phi));
        }
        ctx.stroke();

        if (corona === true) {
            for (let i = 0; i < 6; i++) {
                const startX = x + radius * Math.cos(omega * (i + 1) + phi);
                const endX = x + 2 * radius * Math.cos(omega * (i + 1) + phi);
                const startY = y + radius * Math.sin(omega * (i + 1) + phi);
                const endY = y + 2 * radius * Math.sin(omega * (i + 1) + phi);

                ctx.beginPath();

                const grd = ctx.createLinearGradient(
                    startX,
                    startY,
                    endX,
                    endY
                );
                grd.addColorStop(0, color);
                grd.addColorStop(1, "transparent");
                ctx.strokeStyle = grd;

                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);

                ctx.stroke();
            }
        }
    }

    draw() {
        // Correct the canvas dimensions if the window has been resized
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        const ctx = this.canvas.getContext("2d");

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.translate(this.transform.x, this.transform.y);
        ctx.scale(this.transform.k, this.transform.k);

        this.nodes.forEach((node) => {
            this.drawHex(ctx, node, "black", true);
        });

        // Highlight the tile under the cursor
        if (this.mouseCoord != null) {
            this.drawHex(ctx, this.mouseCoord, "#7ae15e");
        }
    }

    componentDidMount() {
        const selection = d3.select("#graph_canvas");
        this.canvas = selection.node();
        this.transform = d3.zoomIdentity.translate(this.canvas.offsetWidth / 2, this.canvas.offsetHeight / 2);
        selection.call(
            d3.zoom()
            .scaleExtent([1, 8])
            .wheelDelta((event) => {
              return -event.deltaY * (event.deltaMode === 1 ? 0.1 : event.deltaMode ? 1 : 0.05);
            })
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
        };

        this.canvas.onmousedown = (e) => {
            this.nodes.push(this.pixelToAxial(e.clientX, e.clientY));
            this.draw();
        }

        this.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
    }

    handleClick = () => {
        var displayed = this.state.displayed;
        if(displayed == null){
            this.setState({displayed: "Artist_editor"});
        }else{
        var newDisplayed = displayed === 'Playlist_editor' ? 'Artist_editor' : 'Playlist_editor';
        this.setState({
            displayed: newDisplayed
        }
        );
        }
    };
    
    render() {
        return (
            <div id="graph_window">
                <div id="playlist_column">
                    <IconButton edge="end" onClick = {this.handleClick} style ={{marginLeft:30, marginTop:30, position: "absolute", display: "inline"}}>
                            <ArrowBackIosIcon />
                    </IconButton>
                    <div>
                        {this.state.displayed === 'Playlist_editor' ? (
                            <Playlist_editor />
                        ) : this.state.displayed  === 'Artist_editor' ? (
                            <Artist_editor />
                        ) : null}
                    </div>
                    <div id="playback">
                    <SpotifyPlayer
                        token="BQD-oy8TLNVI9NEO6g2gTnq0RCeUW0XiqIRMRYqLB0qONzHL8amxHSHPOQqNiloPde6i7nDjYVmH_OussSp2Xcy2_ot6p7pixJzyrvscdJKV4dq0uCfXtwCr_thXcpbz6JbJBXkmmr8zEAfrY7HPE51p65it8xXdz__0WT60DlBMq52sSwDjYCSQJnE"
                        uris={['spotify:playlist:37i9dQZF1DXcBWIGoYBM5M']}
                        />
                     </div>
                     </div>
                <div id="sidebar_column" />
                <canvas id="graph_canvas" style={{width: "100%", height: "100%" }}></canvas>
            
            </div>
        );
    }
}
export default GraphWindow;
