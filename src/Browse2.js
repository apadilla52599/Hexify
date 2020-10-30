import PropTypes from 'prop-types';
import React from 'react';
import Gallery from 'react-grid-gallery';
import shuffleArray from "shuffle-array";
import img1 from "./DummyData/p1.JPG";
import img2 from "./DummyData/p2.JPG";
import img3 from "./DummyData/p3.JPG";
import img4 from "./DummyData/p4.JPG";
import img5 from "./DummyData/p5.JPG";
import img6 from "./DummyData/p6.JPG";
import img7 from "./DummyData/p7.JPG";
import img8 from "./DummyData/p8.JPG";
import img9 from "./DummyData/p9.JPG";

class Browse2 extends React.Component {
    constructor(props){
        super(props);
        var json = require('./DummyData/DummyArtists.json');
        var graphs = json.graphicalPlaylists.map(playlist => ({caption: playlist.name, tags: playlist.tags}));
        var imgList = [img1,img2,img3,img4,img5,img6,img7,img8, img9];
        for(let i = 0; i < imgList.length;i++){
            imgList[i] = {src: imgList[i],
                                thumbnail: imgList[i],
                                thumbnailWidth: imgList[i].width,
                                thumbnailHeight: imgList[i].height,
                                tags: graphs[i].tags,
                                caption: graphs[i].caption};
        }
        imgList = shuffleArray(imgList);
        this.state = {
            images: imgList
        };
    }

    setCustomTags (i) {
        return (
            i.tags.map((t) => {
                return (<div
                        key={t.value}
                        style={customTagStyle}>
                        {t.title}
                        </div>);
            })
        );
    }
    
    componentDidMount(){
        this.state.images = shuffleArray(this.state.images );
    }

    render () {
        var images =
                this.state.images.map((i) => {
                    i.customOverlay = (
                            <div style={captionStyle}>
                            <div>{i.caption}</div>
                            {i.hasOwnProperty('tags') &&
                             this.setCustomTags(i)}
                        </div>);
                    return i;
                });


        return (
                <div style={{
                    display: "block",
                    minHeight: "1px",
                    width: "100%",
                    border: "1px solid #ddd",
                    overflow: "hidden"}}>
                <form class="search">
                    <input type="text" placeholder="Search.." name="search"/>
                    <button type="submit"><i class="fa fa-search"></i></button>
                </form>
                <Gallery
            images={images}
            enableImageSelection={false}/>

                </div>
        );
    }
}

Browse2.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.shape({
            src: PropTypes.string.isRequired,
            thumbnail: PropTypes.string.isRequired,
            srcset: PropTypes.array,
            caption: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.element
            ]),
            // thumbnailWidth: PropTypes.number.isRequired,
            // thumbnailHeight: PropTypes.number.isRequired
        })
    ).isRequired
};

const captionStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    maxHeight: "240px",
    overflow: "hidden",
    position: "absolute",
    bottom: "0",
    width: "100%",
    color: "white",
    padding: "2px",
    fontSize: "90%"
};

const customTagStyle = {
    wordWrap: "break-word",
    display: "inline-block",
    backgroundColor: "white",
    height: "auto",
    fontSize: "75%",
    fontWeight: "600",
    lineHeight: "1",
    padding: ".2em .6em .3em",
    borderRadius: ".25em",
    color: "black",
    verticalAlign: "baseline",
    margin: "2px"
};


export default Browse2;