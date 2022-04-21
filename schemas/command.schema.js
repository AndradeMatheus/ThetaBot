const { default: mongoose } = require('mongoose');
const { Schema } = require('mongoose');

const CommandSchema = new Schema({
    alias: String,
    value: String,
});


const CommandModel = mongoose.model('commands', CommandSchema)

module.exports = {
    CommandSchema,
    CommandModel
}