import React from "react";
import * as d3 from "d3";
import Artists from "./data/artists.json";

const cartesianToPixel = 20;
const selectedColor = "#7ae15e";
const hexRadius = cartesianToPixel;
const imageRadius = cartesianToPixel * .6;
const nodeBackground = "#d0d0d0";

class GraphWindow extends React.Component {

    constructor() {
        super();
        let randomArtist = Artists.artists[Math.floor(Artists.artists.length * Math.random())];
        this.nodes = [
            {
                ...randomArtist,
                coords: { q: 0, r: 0},
                image: null
            }
        ];
        this.transform = null;
        this.canvas = null;
        this.ctx = null;
        this.mouseCoord = null;
        this.selectedNode = null;
        this.adjacentRecommendedArtists = [];
        this.topRecommendedArtists = Artists.artists.slice(0, 6);
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
            img.src = node.images[node.images.length - 1].url;
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
        if (this.selectedNode != null) {
            if (this.adjacentRecommendedArtists.length === 0) {
                selectedNeighbors = [
                    {
                        q: this.selectedNode.coords.q + 1,
                        r: this.selectedNode.coords.r
                    },
                    {
                        q: this.selectedNode.coords.q + 1,
                        r: this.selectedNode.coords.r - 1
                    },
                    {
                        q: this.selectedNode.coords.q,
                        r: this.selectedNode.coords.r + 1
                    },
                    {
                        q: this.selectedNode.coords.q - 1,
                        r: this.selectedNode.coords.r
                    },
                    {
                        q: this.selectedNode.coords.q - 1,
                        r: this.selectedNode.coords.r + 1
                    },
                    {
                        q: this.selectedNode.coords.q,
                        r: this.selectedNode.coords.r - 1
                    }
                ];
            }
            else {
                this.adjacentRecommendedArtists.forEach((artistNode) => {
                    this.drawNodeImage(artistNode);
                });
            }
        }

        this.nodes.forEach((node) => {
            if (this.selectedNode != null &&
                this.selectedNode.coords.q === node.coords.q &&
                this.selectedNode.coords.r === node.coords.r)
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
                let randomArtist = Artists.artists[Math.floor(Artists.artists.length * Math.random())];
                const length = this.adjacentRecommendedArtists.push({
                    ...randomArtist,
                    coords: neighborCoords,
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

        this.canvas.onmouseleave = (e) => {
            this.mouseCoord = null;
            this.draw();
        }

        this.canvas.onclick = (e) => {
            const mouseCoords = this.pixelToAxial(e.clientX, e.clientY);
            var flag = false;
            this.adjacentRecommendedArtists.forEach((node) => {
                if (node.coords.q === mouseCoords.q && node.coords.r === mouseCoords.r) {
                    this.nodes.push(node);
                    this.selectedNode = node;
                    this.adjacentRecommendedArtists = [];
                    this.draw();
                    flag = true;
                }
            });
            if (flag === false) {
                this.nodes.forEach((node) => {
                    if (node.coords.q === mouseCoords.q && node.coords.r === mouseCoords.r) {
                        this.selectedNode = node;
                        this.adjacentRecommendedArtists = [];
                        this.draw();
                        flag = true;
                    }
                });
            }
            if (flag === false) {
                this.selectedNode = null;
                this.adjacentRecommendedArtists = [];
                this.draw();
            }
        }

        this.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
    }

    quickAddStyle(index, image) {
        console.log(image);
        const style = {
            width: "var(--sidebar-width)",
            height: "var(--sidebar-width)",
            position: "absolute",
            borderRadius: "50%",
            top: "calc(max(50%, 3 * (var(--sidebar-width) + var(--sidebar-margin)) + var(--titlebar-height)) + " + (index - 3) + " * (var(--sidebar-width) + var(--sidebar-margin)))",
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

    render() {
        var index = 0;
        return (
            <div id="graph_window">
                <div id="playlist_column">
                    <div id="playlist_editor" />
                    <div id="playback" />
                </div>
                <div id="sidebar_column">
                    <div
                        key={ index }
                        style={ this.quickAddStyle(index) }
                    >
                        <i class="fas fa-search" style={ { fontSize: "1.6em" } }></i>
                    </div>
                {
                    this.topRecommendedArtists.map((artist) => {
                        index += 1;
                        return (
                            <div
                                key={ index }
                                style={ this.quickAddStyle(index, Artists.artists[index - 1].images[0].url) }
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
