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
import IconButton from "@material-ui/core/IconButton";
import { request, gql } from 'graphql-request';
import Input from "@material-ui/core/Input";

const RETRIEVE_GRAPHS = gql`
    query{
        graphicalPlaylists{
            id
            owner
            name
        }
    }
` 
const SEARCH_GRAPHS = gql`
    query searchGraphicalPlaylists($name: String!){
        searchGraphicalPlaylists(name: $name){
        name
        id
        owner
        privacyStatus
        }
    }
` 

class Browse extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            text: ""
        };
    }
    
    handleSearchText = (e) => {
        this.setState({text: e.target.value});
    }

    handleSearch = () => {
        this.searchQuery();
    }

    async searchQuery(){
        request('/graphql', SEARCH_GRAPHS, {name: this.state.text}).then((response) =>{
            var graphList = []
            var data = response.searchGraphicalPlaylists;
            for(let i = 0; i < data.length; i++){
                if (data[i].privacyStatus === "public" || data[i].privacyStatus === undefined){
                    data[i].thumb = {name: data[i].name, id: data[i].id, src: img1}
                    graphList.push(data[i]);
                }
            }
            console.log(graphList);
            this.setState({graphs: graphList});
            const grid = document.querySelector('.grid');
            const masonry = new Masonry(grid, {
                itemSelector: '.grid-item',
                gutter: 10, 
            });
            imagesloaded(grid, function(){
                masonry.layout();
            });
        });
    }

    componentDidMount(){
        this.loadGraphs();
    }

    loadGraphs(){
        request('/graphql', RETRIEVE_GRAPHS).then((response) => {
            var data = response.graphicalPlaylists;
            var graphList = []
            for(let i = 0; i < data.length; i++){
                if (data[i].privacyStatus === "public" || data[i].privacyStatus === undefined){
                    data[i].thumb = {name: data[i].name, id: data[i].id, src: img1}
                    console.log(data[i]);
                    graphList.push(data[i]);
                }
                console.log(data[i].privacyStatus);
            }
            this.setState({graphs: graphList});
            const grid = document.querySelector('.grid');
            const masonry = new Masonry(grid, {
                itemSelector: '.grid-item',
                gutter: 20, 
            });
            imagesloaded(grid, function(){
                masonry.layout();
            })
        });
    }
    
    render() {
        return (
            <div style={{height: "calc(100% - 3rem)"}}>
                <div id="browse_search_section" style={{width: "20%", float: "left"}}>
                    <div style={{backgroundColor: "var(--background-color)", height: "100%"}}>
                        <div style={{fontSize: "5rem", color: "var(--text-color-purple)", fontFamily: "monospace", backgroundColor: "var(--background-color)" }}>Browse</div>
                        <div style ={{display: "flex", height: "7.5%", justifyContent: "center", backgroundColor: "var(--text-color-purple)"}}>
                            <Input onChange={this.handleSearchText} style={{height: "80%", width:"80%",color: "black",fontFamily: "monospace"}} placeholder= "Search Playlist"></Input>
                            <IconButton onClick={this.handleSearch}><i className="fas fa-search"></i></IconButton>
                        </div>     
                    </div>
                </div> 
                <div id="browse_gallery" style={{width: "80%", float: 'right'}}>
                    <div id="ScrollPaper" style={{backgroundColor: "white", width: "100%"}}>
                        <Typography ></Typography>
                         <div className="grid" style={{marginLeft: "35px", marginTop: "20px"}}>
                            {this.state.graphs === undefined? <div></div> : this.state.graphs.map(img => (<div className="grid-item"><div className="hvrbox"><img  alt="graph thumbnail" src= {img.thumb.src} style={{width: "100%", borderRadius: "15px", borderStyle: "solid", borderColor: "var(--text-color-purple)", borderWidth: "thick"}}/><div onClick={() => window.location.pathname = "/edit/" + img.thumb.id} className="hvrbox-layer_top"><div className="hvrbox-text">{img.thumb.name}</div></div></div> </div>))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}




export default Browse;
