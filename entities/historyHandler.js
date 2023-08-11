const historyHandler = {
    messages: [],
    add(message) {
        if(this.messages.length < 5){
            this.messages.push(message);
        } else {
            this.messages.shift();
            this.messages.push(message);
        }
    }
}

module.exports = historyHandler;