import { request, gql } from 'graphql-request'

const UPDATE_NODE = gql`
  mutation UpdateNode($id: String!, $q: Int!, $r: Int!, $artistId: String!, $artistName: String!) {
    updateNode(id: $id, q: $q, r: $r, artistId: $artistId, artistName: $artistName) {
        id
    }
  }
`
const DELETE_NODE = gql`
  mutation DeleteNode($id: String!, $q: Int!, $r: Int!) {
    deleteNode(id: $id, q: $q, r: $r) {
        id
    }
  }
`

class TransactionStack {
    constructor(nodes, selectedTracks, id) {
        this.nodes = nodes;
        this.selectedTracks = selectedTracks;
        this.id = id;
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

    async updateNode(node) {
        await request('/graphql', UPDATE_NODE,
            {
                id: this.id,
                q: node.coords.q,
                r: node.coords.r,
                artistId: node.artist.id,
                artistName: node.artist.name
            });
    }

    async deleteNode(node) {
        await request('/graphql', DELETE_NODE,
            {
                id: this.id,
                q: node.coords.q,
                r: node.coords.r,
            });
    }

    async addNode(node) {
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
                await this.updateNode(node);
                flag = true;
            }
        }
        if (flag === false) {
            this.stackPush({
                type: "add",
                data: node
            });
            this.nodes.push(node);
            await this.updateNode(node);
        }
        return {
            update: true,
            nodes: this.nodes,
        }
    }

    async removeNode(node) {
        var update = false;
        var removedTracks = [];
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].coords.q === node.coords.q &&
                this.nodes[i].coords.r === node.coords.r) {
                for (let i = 0; i < this.selectedTracks.length; i++)
                    if (this.selectedTracks[i].artist.id === node.artist.id)
                        removedTracks.push({ index: i, track: this.selectedTracks[i] });
                this.stackPush({
                    type: "remove",
                    removedTracks: removedTracks,
                    data: node
                });
                await this.deleteNode(node);
                this.nodes.splice(i, 1);
                update = true;
            }
        }
        return {
            update: update,
            nodes: this.nodes,
            removedTracks: removedTracks
        }
    }

    undo() {
        var update = false;
        var addedTracks = [];
        var removedTracks = [];
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
                for (let i = 0; i < this.selectedTracks.length; i++)
                    if (this.selectedTracks[i].artist.id === transaction.data.artist.id)
                        removedTracks.push({ index: i, track: this.selectedTracks[i] });
                transaction.removedTracks = removedTracks;
            }
            else if (transaction.type === "remove") {
                this.nodes.push(transaction.data);
                this.topIndex -= 1;
                update = true;
                addedTracks = transaction.removedTracks;
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
            nodes: this.nodes,
            addedTracks: addedTracks,
            removedTracks: removedTracks,
        }
    }

    redo() {
        var update = false;
        var addedTracks = [];
        var removedTracks = [];
        if (this.topIndex < this.stack.length) {
            const transaction = this.stack[this.topIndex];
            if (transaction.type === "add") {
                console.log(this.stack);
                this.nodes.push(transaction.data);
                addedTracks = transaction.removedTracks;
                this.topIndex += 1;
                update = true;
            }
            else if (transaction.type === "remove") {
                for (let i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i].coords.q === transaction.data.coords.q &&
                        this.nodes[i].coords.r === transaction.data.coords.r) {
                        removedTracks = transaction.removedTracks;
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
            nodes: this.nodes,
            addedTracks: addedTracks,
            removedTracks: removedTracks
        }
    }
}

export default TransactionStack;
