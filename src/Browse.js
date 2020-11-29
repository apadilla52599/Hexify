import React from "react";
import Typography from '@material-ui/core/Typography';
import imagesloaded from 'imagesloaded';
import Masonry from 'masonry-layout';
import img1 from "./DummyData/p1.JPG";
import img2 from "./DummyData/p2.JPG";
import img3 from "./DummyData/p3.JPG";
import img4 from "./DummyData/p4.JPG";
import img5 from "./DummyData/p5.JPG";
import img6 from "./DummyData/p6.JPG";
import img7 from "./DummyData/p7.JPG";
import img8 from "./DummyData/p8.JPG";


class Browse extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            photos : [
                {name: null, id: null, src: null}
            ]
        };
    }

    componentDidMount(){
        var json = require('./DummyData/DummyArtists.json');
        var graphList = json.graphicalPlaylists.map((thumbnails, index) => ({name: thumbnails.name, id: index}));
        var otherList = [img1,img2,img3,img4,img5,img6,img7,img8];
        for(let i = 0; i < otherList.length;i++){
            graphList[i].src = otherList[i];
        }
        for(let i = 0; i < otherList.length;i++){
            graphList.push({name: "fake", id: i, src: img7});
        }
        for(let i = 0; i < otherList.length;i++){
            graphList.push({name: "fake", id: i, src: img7});
        }
        this.setState({photos: graphList});        
        window.onload = () => {
            const grid = document.querySelector('.grid');
            const masonry = new Masonry(grid, {
                itemSelector: '.grid-item',
                gutter: 10, 
            });
            imagesloaded(grid, function(){
                masonry.layout();
            })
        };
    }
    
    render() {
        return (
            <div style={{height: "calc(100% - 3rem)"}}>
                <div id="browse_search_section" style={{width: "20%", float: "left"}}>
                    <div style={{backgroundColor: "black", height: "100%"}}>
                    </div>
                </div> 
                <div id="browse_gallery" style={{width: "80%", float: 'right'}}>
                    <div id="ScrollPaper" style={{backgroundColor: "blueviolet", width: "100%"}}>
                        <Typography ></Typography>
                         <div className="grid" >
                            {this.state.photos.map(img => (<div className="grid-item"><img alt="graph thumbnail" src= {img.src} style={{width: "100%"}}/> </div>))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}




export default Browse;
