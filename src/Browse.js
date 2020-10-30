import React from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { Grid, Paper, GridList, GridListTile, GridListTileBar } from "@material-ui/core";
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
        for(let i = 0; i < 8;i++){
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
                    <Typography component="div" style={{ backgroundColor: 'white', height: '95vh'}}>
                        <div style={{flexGrow: 1}}>
                            <Grid container spacing = {1} >
                                <Grid item xs = {12}>
                                    <Paper style = {{textAlign: 'left'}}>
                                        <Typography variant='h2' gutterbottom>
                                            Browse
                                        </Typography>
                                        <div  style = {{display: "flex", justifyContent: "left", flexGrow: 1, marginTop: 10}}>
                                            <input style = {{height: 30, width:300}} type="text" placeholder="Search.." ></input>
                                        </div>
                                    </Paper>
                                </Grid>
                                <Grid item xs = {12}>
                                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', overflow:'hidden', }}>
                                        <GridList cellHeight={"auto"} cols={4}>
                                            {this.state.photos.map((photos) => (
                                                <GridListTile key={photos.src} cols={1}>
                                                    <img src={photos.src} style={{width: "100%", height:"auto"}} alt={photos.name} />
                                                    <GridListTileBar
                                                    title={photos.name}
                                                    titlePosition="bottom"
                                                    />
                                                </GridListTile>
                                            ))}
                                        </GridList>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    </Typography>
                </Container>
            </React.Fragment>

        );
    }
}




export default Browse;
