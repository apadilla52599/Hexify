import React from 'react';
import PublicIcon from '@material-ui/icons/Public';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';


class Titlebar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            graphName: "Untitled Graph"
        };
    }

    componentDidMount() {
        this.savingInterval = setInterval(() => {
            this.setState(this.props.saving);
        }, 1000);
        this.nameInterval = setInterval(() => {
            const newName = this.props.graphName();
            if (newName !== undefined && newName !== "" && newName !== this.graphName) {
                this.setState({graphName: newName});
                clearInterval(this.nameInterval);
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.savingInterval);
        clearInterval(this.nameInterval);
    }

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

    handleBrowseSearch = () => {
        const bss = document.getElementById("browse_search_section");
        const bg = document.getElementById("browse_gallery");
        if (bss !== undefined) {
            if (bss.style.width === "0%") {
                bss.style.width = "20%";
                bg.style.width = "80%";
                bss.style.visibility = "visible";
            }
            else {
                bss.style.width = "0%";
                bg.style.width = "100%";
                bss.style.visibility = "hidden";
            }
            // TODO: replace this with a mutation observer in the graph window
            window.dispatchEvent(new Event('resize'));
        }
    }
    render() {
        const browsing = (window.location.pathname === "/browse");
        var lastModified = "";
        if (this.state.saving)
            lastModified = "Saving...";
        else if (this.state.date) {
            lastModified = "Last updated: " + this.state.date.toLocaleDateString() + " at " + this.state.date.toLocaleTimeString();
        }
        return (
            <div id="titlebar" style={{ ...this.props.style,minHeight: "3rem", display: "flex", alignItems: "center" }}>
                <div>
                    <p onClick={this.handleClick} style={{cursor: "pointer", color: "white", fontFamily: "monospace", fontSize: "1.2rem", paddingLeft: ".8rem" }}><i className="fas fa-bars"></i></p>
                </div>
                { browsing &&
                    <div>
                        <p onClick={this.handleBrowseSearch} style={{cursor: "pointer", color: "white", fontFamily: "monospace", fontSize: "1.2rem", paddingLeft: ".8rem" }}><i className="fas fa-search"></i></p>
                    </div>
                }
                { !browsing &&
                    <Input value={this.state.graphName} onChange={(e) => {this.setState({graphName: e.target.value}); this.props.graphNameCallback(e.target.value)}} style = {{ marginLeft: "2rem", marginRight: "1rem", color: "var(--text-color-secondary)", fontSize: ".8rem"}} />
                }
                { !browsing &&
                    <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: ".8rem", width: "15vw" }}>{lastModified}</p>
                }
                
                    <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                        <a href="/edit">
                            <img height= "50" width= "75" alt="Logo"
                            src="https://i.gyazo.com/79142564837963c719e4300531af2e64.png" ></img>
                        </a>
                    </div>
                { !browsing &&
                    <IconButton href="/browse" style = {{color: "white" }}>
                        <PublicIcon style={{marginLeft: "22vw", width:"1.5rem", height:"1.5rem"}}/>
                    </IconButton>
                }
                {this.props.signedIn() === false ? 
                <Button href="/auth/spotify" id="purple_text_background" variant="contained" color="default" style = {{marginRight: "1vw", marginLeft: "1vw", height: "2rem", fontSize: ".75rem"}}>
                    Log In
                </Button>
                 :
                <Button href="/logout" id="purple_text_background" variant="contained" color="default" style = {{marginRight: "1vw", height: "2rem", fontSize: ".75rem"}}>
                    Log out
                </Button>
                }
                {/* <Button href="/auth/spotify" id="purple_text_background" variant="contained" color="default" style = {{marginRight: "1vw", marginLeft: "1vw", height: "2rem", fontSize: ".75rem"}}>
                    Log In
                </Button> */}
            </div>
        );
    }
}

export default Titlebar;
