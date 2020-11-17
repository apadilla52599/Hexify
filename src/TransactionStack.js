import { request, gql } from 'graphql-request'

const endpoint = "/graphql";

const UPDATE_NODE = gql`
  mutation UpdateNode($id: String!, $q: Int!, $r: Int!, $artistId: $String) {
    updateNode(id: $id, q: $q, r: $r, artistId: $artistId) {
        _id
    }
  }
`
const CREATE_PLAYLIST = gql`
  mutation CreatePlaylist($name: String!, $playlists: [String!], $privacyStatus: String!) {
    createGraphicalPlaylist(name: $name, playlists: $playlists, privacyStatus: $privacyStatus) {
        _id
    }
  }
`

class TransactionStack {
    constructor(nodes) {
        this.nodes = nodes;
        if (nodes === undefined || nodes === null)
            this.nodes = [];
        this.stack = [];
        this.topIndex = 0;
    }

    stackPush(transaction) {
        this.stack.splice(this.topIndex, this.stack.length - this.topIndex);
        this.stack.push(transaction);
        this.topIndex += 1;
    }

    addNode(node) {
        //request(endpoint, UPDATE_NODE, { id: "123", q: node.coords.q, r: node.coords.r, artistId: node.artist.id });
        request(endpoint, CREATE_PLAYLIST, { name: "helloo", playlists: [], privacyStatus: "public" });
        var flag = false;
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].coords.q === node.coords.q &&
                this.nodes[i].coords.r === node.coords.r) {
                this.stackPush({
                    type: "swap",
                    data: {
                        oldNode: this.nodes[i],
                        newNode: node
                    }
                });
                this.nodes[i] = node;
                flag = true;
            }
        }
        if (flag === false) {
            this.stackPush({
                type: "add",
                data: node
            });
            this.nodes.push(node);
        }
        return {
            update: true,
            nodes: this.nodes
        }
    }

    removeNode(node) {
        var update = false;
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].coords.q === node.coords.q &&
                this.nodes[i].coords.r === node.coords.r) {
                this.stackPush({
                    type: "remove",
                    data: node
                });
                this.nodes.splice(i, 1);
                update = true;
            }
        }
        return {
            update: update,
            nodes: this.nodes
        }
    }

    undo() {
        var update = false;
        if (this.topIndex > 0) {
            const transaction = this.stack[this.topIndex - 1];
            if (transaction.type === "add") {
                for (let i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i].coords.q === transaction.data.coords.q &&
                        this.nodes[i].coords.r === transaction.data.coords.r) {
                        this.nodes.splice(i, 1);
                        this.topIndex -= 1;
                        update = true;
                    }
                }
            }
            else if (transaction.type === "remove") {
                this.nodes.push(transaction.data);
                this.topIndex -= 1;
                update = true;
            }
            else if (transaction.type === "swap") {
                for (let i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i].coords.q === transaction.data.oldNode.coords.q &&
                        this.nodes[i].coords.r === transaction.data.oldNode.coords.r) {
                        this.nodes[i] = transaction.data.oldNode;
                        this.topIndex -= 1;
                        update = true;
                    }
                }
            }
        }
        return {
            update: update,
            nodes: this.nodes
        }
    }

    redo() {
        var update = false;
        if (this.topIndex < this.stack.length) {
            const transaction = this.stack[this.topIndex];
            if (transaction.type === "add") {
                this.nodes.push(transaction.data);
                this.topIndex += 1;
                update = true;
            }
            else if (transaction.type === "remove") {
                for (let i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i].coords.q === transaction.data.coords.q &&
                        this.nodes[i].coords.r === transaction.data.coords.r) {
                        this.nodes.splice(i, 1);
                        this.topIndex += 1;
                        update = true;
                    }
                }
            }
            else if (transaction.type === "swap") {
                for (let i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i].coords.q === transaction.data.oldNode.coords.q &&
                        this.nodes[i].coords.r === transaction.data.oldNode.coords.r) {
                        this.nodes[i] = transaction.data.newNode;
                        this.topIndex += 1;
                        update = true;
                    }
                }
            }
        }
        return {
            update: update,
            nodes: this.nodes
        }
    }
}

export default TransactionStack;
