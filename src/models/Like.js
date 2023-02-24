const {Schema, model} = require('mongoose');

const schema = new Schema({
    sender: [{type: String, required: true}],
    count: {type: Number, required: true}
});

module.exports = model('Like', schema);



