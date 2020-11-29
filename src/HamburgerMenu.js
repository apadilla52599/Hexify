import React from "react";
import List from '@material-ui/core/List';
import MuiListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import AddCircleIcon from '@material-ui/icons/AddCircle'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import img1 from "./DummyData/p1.JPG";
import { Divider } from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import { request, gql } from 'graphql-request'

const RETRIEVE_USER = gql`
  query {
    user {
        id
        graphicalPlaylists {
            id
            name
        }
    }
  }
` 

const DELETE_GRAPH = gql`
    mutation DeleteGraphicalPlaylist($id: String!) {
      deleteGraphicalPlaylist(id: $id) {
        id
      }
    }
`

const ListItem = withStyles({
    root: {
      "&:hover": {
        backgroundColor: "rgb(56,56,56)",
      }
    }
  })(MuiListItem);

class HamburgerMenu extends React.Component {
    constructor(){
        super();
        // I added thumbnails for graphical playlists in the JSON object file
        this.inMutation = false;
        this.state = { 
            graphList: []
        }
    }
    componentDidMount(){
        request('/graphql', RETRIEVE_USER).then((data) => {
            console.log(data);
            if (data && data.user) {
                data.user.graphicalPlaylists.forEach(graph => graph.thumbnail = img1);
                this.setState({ graphList: data.user.graphicalPlaylists });
            }
        });
        /*var json = require('./DummyData/DummyArtists.json');
        var graphList = json.graphicalPlaylists.map(playlist => ({name: playlist.name}));
        var otherList = [img1,img2,img3,img4,img5,img6,img7,img8];
        for(let i = 0; i < otherList.length;i++){
            graphList[i].thumbnail = otherList[i];
        }
        this.setState({graphList: graphList});*/
    }

    deleteGraph(id) {
        console.log("2hello");
        request('/graphql', DELETE_GRAPH, { id: id }).then((data) => {
            console.log(data);
            if (data && data.deleteGraphicalPlaylist) {
                this.setState({ graphList: this.state.graphList.filter(graph => graph.id !== data.deleteGraphicalPlaylist.id) });
            }
        });
    }
    
    render() {
        return (
            <div id="hamburger_menu" style={{ display: "flex", width: "0%", height: "100vh", backgroundColor: "black", visibility:"hidden", position:"relative" }}>
                 <div id="scroll" style={{width: "100%"}}>
                    <List style={{ width: "100%", height: "auto"}}>
                    <ListItem className="ListItemHover" key="create-new" button={true} onClick={() => window.location.pathname = "/edit"}>
                        <ListItemAvatar style={{color: "white"}}>
                            <AddCircleIcon fontSize="large"/>
                        </ListItemAvatar>
                        <ListItemText style={{color: "white"}}>
                            Create new graph
                        </ListItemText>
                    </ListItem>
                    <Divider/>
                    <Typography variant="h6" style={{color:"black", backgroundColor: "blueviolet"}}>
                        GRAPHICAL PLAYLISTS
                    </Typography>
                    <Divider/>
                    {this.state.graphList.map( (graph, index) => (
                        <ListItem className="ListItemHover" button={true} key={index} onClick={() => window.location.pathname = "/edit/" + graph.id}>
                        <ListItemAvatar>
                            <Avatar sizes="large" src={graph.thumbnail}></Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={graph.name} style={{color: "white"}}
                            secondary={graph.dateModified}
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete" onClick={() => this.deleteGraph(graph.id)}>
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
