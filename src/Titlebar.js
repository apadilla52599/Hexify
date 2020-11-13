import React from 'react';
import PublicIcon from '@material-ui/icons/Public';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';


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
        const browsing = (window.location.pathname === "/browse");
        return (
            <div id="titlebar" style={{ ...this.props.style,minHeight: "3rem", display: "flex", alignItems: "center" }}>
                <div>
                    <p onClick={this.handleClick} style={{cursor: "pointer", color: "white", fontFamily: "monospace", fontSize: "1.2rem", paddingLeft: ".8rem" }}><i className="fas fa-bars"></i></p>
                </div>
                { !browsing &&
                    <Input placeholder="Untitled Graph" style = {{ marginLeft: "2rem", marginRight: "1rem", color: "var(--text-color-secondary)", fontSize: ".8rem"}} />
                }
                { !browsing &&
                    <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: ".8rem", width: "15vw" }}>Last Updated: Today 2:52pm</p>
                }
                
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <a href="/" style = {{textDecoration: "none"}}>
                        <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: "1.2rem" }}>Hexify</p>
                    </a>
                </div>

                { !browsing &&
                    <IconButton href="/browse" style = {{color: "white", marginLeft: "22vw"}}>
                        <PublicIcon style={{width:"1.5rem", height:"1.5rem"}}/>
                    </IconButton>
                }
                <Button id = "purple_text_background" variant="contained" color="default" style = {{marginRight: "1vw", marginLeft: "1vw", height: "2rem", fontSize: ".75rem"}}>
                    Log In
                </Button>
            </div>
        );
    }
}

export default Titlebar;
