import React from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { Grid, Paper, GridList, GridListTile, GridListTileBar } from "@material-ui/core";
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
// import tileData from './tileData';



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
        var graphList = json.graphicalPlaylists.map((thumbnails, index) => ({name: thumbnails.name, id: index, src: thumbnails.graphThumbnail}));
        console.log(graphList);
        this.setState({photos: graphList});
    }
    
    render() {
        return (
            <React.Fragment>
                <CssBaseline />
                <Container maxWidth="lg">
                    <Typography component="div" style={{ backgroundColor: 'white', height: '95vh'}}>
                        {/*this is where i will put the header*/}
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
                                        <GridList cellHeight={"150px"} style={{transform: "translateZ(0)"}} cols={4}>
                                            {this.state.photos.map((photos) => (
                                                <GridListTile key={photos.src} cols={1}>
                                                    <img src={photos.src} style={{width: "100%", maxHeight:"auto"}} alt={photos.name} />
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
{/* <div>
<div style={{position: "relative"}}>
{this.state.photos.map(img => (
<div className="gallery">
    <img src={img.src}/> 
    <div classname="desc"> {img.name}</div>
</div>))}
</div>
</div> */}




export default Browse;
