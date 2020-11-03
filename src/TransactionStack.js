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
        this.stackPush({
            type: "add",
            data: node
        });
        this.nodes.push(node);
        return {
            update: true,
            nodes: this.nodes
        }
    }

    removeNode(node) {
        var update = false;
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].coords === node.coords) {
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
                    if (this.nodes[i].coords === transaction.data.coords) {
                        this.nodes.splice(i, 1);
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
        }
        return {
            update: update,
            nodes: this.nodes
        }
    }
}

export default TransactionStack;
