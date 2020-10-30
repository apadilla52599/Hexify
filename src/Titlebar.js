import React from 'react';
import PublicIcon from '@material-ui/icons/Public';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';

class Titlebar extends React.Component {
    handleClick = () => {
        const menu = document.getElementById("hamburger_menu");
        if (menu !== undefined) {
            if (menu.style.width === "0%") {
                menu.style.width = "20%";
                menu.style.visibility = "visible";
            }
            else {
                menu.style.width = "0%";
                menu.style.visibility = "hidden";
            }
            // TODO: replace this with a mutation observer in the graph window
            window.dispatchEvent(new Event('resize'));
        }
    }

    render() {
        var a = (window.location.pathname === "/browse");
        var b;
        if(a){
            a = "hidden";
            b = "inline";
        }else{
            a = "visible";
            b = "none";
        }
        return (
            <div id="titlebar" style={{ ...this.props.style,minHeight: "5vh", display: "flex", alignItems: "center" }}>
                <div>
                    <p onClick={this.handleClick} style={{cursor: "pointer", color: "white", fontFamily: "monospace", fontSize: "1.5vh", paddingLeft: "2vw" }}><i className="fas fa-bars"></i></p>
                </div>
                <Input placeholder="Untitled Graph" style = {{marginTop: ".25vh", marginLeft: "3vw", marginRight:"1vw", color: "white", fontSize: "1.5vh",visibility:a}} />
                <p style={{ color: "gray", cursor: "default", fontFamily: "monospace", fontSize: "1.5vh",width: "15vw", visibility:a }}>Last Updated: Today 2:52pm</p>
                
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <a href="/" style = {{textDecoration: "none"}}>
                        <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: "3vh" }}>Hexify</p>
                    </a>
                </div>

                <IconButton href="/browse" style = {{color: "white", visibility:a, paddingLeft: "22vw"}}>
                    <PublicIcon style={{width:"2.5vh", height:"2.5vh"}}/>
                </IconButton>
                <a href="/browse2" style = {{textDecoration: "none"}}>
                        <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: "1vh", display: b }}>Second Browse</p>
                </a>
                <button style = {{fontSize: "1.5vh", borderColor:"B19CD9", backgroundColor: "B19CD9", marginRight:"2vw", marginLeft:"1vw"}}>
                    Login
                </button>
            </div>
        );
    }
}

export default Titlebar;
