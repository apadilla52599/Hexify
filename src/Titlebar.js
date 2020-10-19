import React from 'react';

class Titlebar extends React.Component {
    handleClick = () => {
        const menu = document.getElementById("hamburger_menu");
        if (menu !== undefined) {
            if (menu.style.width === "0%") {
                menu.style.width = "20%";
            }
            else {
                menu.style.width = "0%";
            }
            // TODO: replace this with a mutation observer in the graph window
            window.dispatchEvent(new Event('resize'));
        }
    }

    render() {
        return (
            <div id="titlebar" style={{ ...this.props.style, display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex" }}>
                    <p onClick={this.handleClick} style={{ cursor: "pointer", color: "white", fontFamily: "monospace", fontSize: "1.5em", paddingLeft: "10px" }}><i className="fas fa-bars"></i></p>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <p style={{ color: "white", cursor: "default", fontFamily: "monospace", fontSize: "1.5em" }}>Hexify</p>
                </div>
            </div>
        );
    }
}

export default Titlebar;
