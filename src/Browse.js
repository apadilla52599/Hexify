import React from "react";

class Browse extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            photos : [
            ]
        };
    }


    componentDidMount(){
        var json = require('./DummyData/DummyArtists.json');
        var graphList = json.graphicalPlaylists.map((thumbnails, index) => ({id: index, src: thumbnails.graphThumbnail}));
        console.log(graphList);
        this.setState({photos: graphList});
    }
    
    render() {
        return (
            <div>
            <div ref={this.element}>
                {this.state.photos.map(img => (<img src={img.src}/>))}
            </div>
            </div>
        );
    }
}




export default Browse;
