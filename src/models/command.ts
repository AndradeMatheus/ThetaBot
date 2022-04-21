export default class Command {
    public execute: Function;

    constructor(public name: string, public description: string, public help: string, public handler: Function){
        this.execute = handler;
    }
}