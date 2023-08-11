const message = {
    role: "",
    context: "",
    constructor(role, context) {
        this.role = role;
        this.context = context;
    }
}

module.exports.message = message;