import React from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { Paper, GridList, GridListTile, GridListTileBar } from "@material-ui/core";
import img1 from "./DummyData/p1.JPG";
import img2 from "./DummyData/p2.JPG";
import img3 from "./DummyData/p3.JPG";
import img4 from "./DummyData/p4.JPG";
import img5 from "./DummyData/p5.JPG";
import img6 from "./DummyData/p6.JPG";
import img7 from "./DummyData/p7.JPG";
import img8 from "./DummyData/p8.JPG";
import img9 from "./DummyData/p9.JPG";



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
        var otherList = [img1,img2,img3,img4,img5,img6,img7,img8,img9];
        for(let i = 0; i < 9;i++){
            graphList[i].src = otherList[i];
        }
        console.log(graphList);
        this.setState({photos: graphList});
    }
    
    render() {
        return (
            <React.Fragment>
                <CssBaseline />
                <Container maxWidth="lg">
                        <div style={{flexGrow: 1, backgroundColor: 'white', height: "100%"}}>
                            <Paper style = {{textAlign: 'left', color:"white"}}>
                                <Typography variant='h2'  style={{backgroundColor: "black"}}>
                                    Browse
                                </Typography>
                                <div  style = {{display: "flex", justifyContent: "left", flexGrow: 1, marginTop: 10}}>
                                    <input style = {{height: 30, width:300}} type="text" placeholder="Search.." ></input>
                                </div>
                            </Paper>
                            <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', overflow:'hidden' }}>
                                <GridList cellHeight={"auto"} cols={4}>
                                    {this.state.photos.map((photos, index) => (
                                        <GridListTile key={index} cols={1}>
                                            <img src={photos.src} style={{width: "100%", height:"auto"}} alt={photos.name} />
                                            <GridListTileBar
                                            title={photos.name}
                                            titlePosition="bottom"
                                            />
                                        </GridListTile>
                                    ))}
                                </GridList>
                            </div>
                        </div>
                </Container>
            </React.Fragment>

        );
    }
}




export default Browse;
