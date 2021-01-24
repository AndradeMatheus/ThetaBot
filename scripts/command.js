module.exports = class Command {
    constructor(name, description, help, handler){
        this.name = name;
        this.description = description;
        this.help = help;
        this.execute = handler;
    }
}