const {Schema, model} = require('mongoose');

const schema = new Schema({
    //todo или {type: Schema.Types.ObjectId, ref: 'User'}
    sender: {type: String, required: true},
    comment: {type: String, required: true},
});

module.exports = model('Comment', schema);



