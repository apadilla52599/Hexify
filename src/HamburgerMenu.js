import React from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import AddCircleIcon from '@material-ui/icons/AddCircle'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import img1 from "./DummyData/p1.JPG";
import img2 from "./DummyData/p2.JPG";
import img3 from "./DummyData/p3.JPG";
import img4 from "./DummyData/p4.JPG";
import img5 from "./DummyData/p5.JPG";
import img6 from "./DummyData/p6.JPG";
import img7 from "./DummyData/p7.JPG";
import img8 from "./DummyData/p8.JPG";
import { Divider } from "@material-ui/core";

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
                 <div>
                    <List style={{overflowY: "scroll", width: "100%", height: "100%"}}>
                    <ListItem key="create-new">
                        <ListItem button={true}>
                        <ListItemAvatar style={{color: "white"}}>
                            <AddCircleIcon fontSize="large"/>
                        </ListItemAvatar>
                        <ListItemText style={{color: "white"}}>
                            Create new graph
                        </ListItemText>
                        </ListItem>
                    </ListItem>
                    <Divider/>
                    <Typography variant="h6" style={{color:"black", backgroundColor: "blueviolet"}}>
                        GRAPHICAL PLAYLISTS
                    </Typography>
                    <Divider/>
                    {this.state.graphList.map( (graph, index) => (
                        <ListItem button={true} key={index}>
                        <ListItemAvatar>
                            <Avatar sizes="large" src={graph.thumbnail}></Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={graph.name} style={{color: "white"}}
                            secondary={graph.dateModified}
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete">
                            <DeleteIcon style={{color:"white"}}/>
                            </IconButton>
                        </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    </List>
                </div>
            </div>
        );
    }
}

export default HamburgerMenu;
