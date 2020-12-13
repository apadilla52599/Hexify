import React from "react";
import Typography from '@material-ui/core/Typography';
import imagesloaded from 'imagesloaded';
import Masonry from 'masonry-layout';
import IconButton from "@material-ui/core/IconButton";
import { request, gql } from 'graphql-request';
import Input from "@material-ui/core/Input";
import img1 from "./DummyData/p1.JPG";
import img2 from "./DummyData/p2.JPG";
import img3 from "./DummyData/p3.JPG";
import img4 from "./DummyData/p4.JPG";
import img5 from "./DummyData/p5.JPG";
import img6 from "./DummyData/p6.JPG";
import img7 from "./DummyData/p7.JPG";
import img8 from "./DummyData/p8.JPG";

const RETRIEVE_GRAPHS = gql`
    query{
        graphicalPlaylists{
            id
            owner
            name
            privacyStatus
            genres { 
                key
                value
            }
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
        genres { 
            key
            value
            }
        }
    }
` 

class Browse extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            text: ""
        };
        this.images = [
            img1,
            img2,
            img3,
            img4,
            img5,
            img6,
            img7,
            img8
        ];
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
                data[i].img = new Image();
                graphList.push(data[i]);
            }
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
        request('/graphql', RETRIEVE_GRAPHS).then(async (response) => {
            var data = response.graphicalPlaylists;
            this.setState({graphs: data}, () => {
                const grid = document.querySelector('.grid');
                this.masonry = new Masonry(grid, {
                    itemSelector: '.grid-item',
                    gutter: 20, 
                });
                this.masonry.layout();
            });
        });
    }
    getColor(genre) {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            if(genre.length <= i){
                color += letters[Math.floor((genre.charCodeAt(i-genre.length)-65)/122 * 16)];
            }else{
                color += letters[Math.floor((genre.charCodeAt(i))/122 * 16)];
            }
          
        }
        console.log(color)
        return color;
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
                         <div className="grid" style={{marginLeft: "35px", marginTop: "20px"}}>
                            {this.state.graphs === undefined? 
                            <div></div> : 
                            this.state.graphs.map(graph => (
                            <div className="grid-item">
                                <div className="hvrbox">
                                    {graph.genres.slice(0,3).map((genre, index) => (
                                        <div className = "genre" style = {{cursor: "pointer",zIndex: "1",borderStyle: "solid",borderColor: "black", borderWidth: "3",
                                        position: "absolute",marginTop: (22*(index+1) + "px"), marginBottom: "0%", marginLeft: "92%", height: "20px",width: "20px",backgroundColor: this.getColor(genre.key),borderRadius: "50%", }}>
                                            <div className="genre-text" style = {{position: "absolute",zIndex: "2", color: "white"}}>
                                                {genre.key}
                                           </div>
                                        </div>
                                    ))}
                                    <img alt="graph thumbnail" 
                                    src={"https://hexifythumbnails.s3.amazonaws.com/" + graph.id + ".jpg"} 
                                    onError={(e) => {e.target.onerror = null; 
                                    e.target.src=this.images[Math.floor(Math.random() * 8)];}} 
                                    onLoad={(e) => {e.target.onload = null; if (this.masonry) this.masonry.layout()}} 
                                    style={{width: "100%", borderRadius: "15px", borderStyle: "solid", borderColor: "var(--text-color-purple)", borderWidth: "thick"}}/>
                                    <div onClick={() => window.location.pathname = "/edit/" + graph.id} className="hvrbox-layer_top">
                                        <div className="hvrbox-text">
                                            {graph.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
        );
    }
}




export default Browse;
