module.exports = class Command {
    constructor(name, description, handler){
        this.name = name;
        this.description = description;
        this.execute = handler;
    }
}