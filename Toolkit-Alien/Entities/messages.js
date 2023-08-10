class Messages {
    constructor() {
        this.messages = {};
    }
    add(message) {
        if(this.messages.length < 5){
            this.messages.push(message);
        } else {
            this.messages.shift();
            this.messages.push(message);
        }
    }
}

class message {
    constructor(role, message) {
        this.role = role;
        this.message = message;
    }
}