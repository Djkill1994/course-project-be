const {Schema, model} = require('mongoose');

const schema = new Schema({
    sender: {type: Schema.Types.ObjectId, ref: 'User'},
});

module.exports = model('Like', schema);



