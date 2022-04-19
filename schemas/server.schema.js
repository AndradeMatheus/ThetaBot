const { Schema, model } = require('mongoose');
const { CommandSchema } = require('./command.schema');

const ServerSchema = new Schema({
    uid: String,
    commands: [CommandSchema]
});


const ServerModel = model('servers', ServerSchema)

module.exports = {
    ServerSchema,
    ServerModel
}