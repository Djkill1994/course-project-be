const {Schema, model} = require('mongoose');

const schema = new Schema({
    tag: {type: String, required: true},
});

module.exports = model('Tag', schema);



