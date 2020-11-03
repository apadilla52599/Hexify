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
            data: {...node}
        });
        this.nodes.push(node);
        return this.nodes;
    }

    removeNode(node) {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i] === node) {
                this.stackPush({
                    type: "remove",
                    data: {...node}
                });
                this.nodes.splice(i, 1);
            }
        }
        return this.nodes;
    }
}

export default TransactionStack;
