import React from "react";

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
        var graphList = json.graphicalPlaylists.map(playlist => ({name: playlist.name, thumbnail: playlist.graphThumbnail}));
        console.log(graphList);
        this.setState({graphList: graphList});
    }
    
    render() {
        return (
            <div id="hamburger_menu" style={{ display: "flex", width: "0%", backgroundColor: "black", visibility:"hidden", position:"relative" }}>
                <table>
                    <tbody>
                    {this.state.graphList.map(graph => (
                        <tr key={graph.name}>
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
