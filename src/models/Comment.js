const {Schema, model} = require('mongoose');

const schema = new Schema({
    date: {type: String, required: true},
    sender: {type: Schema.Types.ObjectId, ref: 'User'},
    text: {type: String, required: true},
});

module.exports = model('Comment', schema);



