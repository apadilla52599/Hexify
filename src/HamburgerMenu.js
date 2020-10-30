import React from "react";
import img1 from "./DummyData/p1.JPG";
import img2 from "./DummyData/p2.JPG";
import img3 from "./DummyData/p3.JPG";
import img4 from "./DummyData/p4.JPG";
import img5 from "./DummyData/p5.JPG";
import img6 from "./DummyData/p6.JPG";
import img7 from "./DummyData/p7.JPG";
import img8 from "./DummyData/p8.JPG";

class HamburgerMenu extends React.Component {
    constructor(){
        super();
        // I added thumbnails for graphical playlists in the JSON object file
        this.inMutation = false;
        this.state = { 
            graphList: [{name: null, thumbnail: null}]
        }
    }
    componentDidMount(){
        var json = require('./DummyData/DummyArtists.json');
        var graphList = json.graphicalPlaylists.map(playlist => ({name: playlist.name}));
        console.log(graphList);
        var otherList = [img1,img2,img3,img4,img5,img6,img7,img8];
        for(let i = 0; i < 8;i++){
            graphList[i].thumbnail = otherList[i];
        }
        this.setState({graphList: graphList});
    }
    
    render() {
        return (
            <div id="hamburger_menu" style={{ display: "flex", width: "0%", backgroundColor: "black", visibility:"hidden", position:"relative" }}>
                <table>
                    <tbody>
                    {this.state.graphList.map((graph,index) => (
                        <tr key={index}>
                            <td className="imgSpace">
                                <img className="thumb" alt="graphThumbnail" src={graph.thumbnail}></img>
                            </td>
                            <td className="titleSpace">
                                {graph.name}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default HamburgerMenu;
