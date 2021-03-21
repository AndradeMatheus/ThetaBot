export default class Command {
    constructor(name, description, handler, help){
        this.name = name;
        this.description = description;        
        this.execute = handler;
        this.help = help;
    }
}