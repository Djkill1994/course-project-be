const {Schema, model} = require('mongoose');

const schema = new Schema({
    name: {type: String, required: true},
    imgSrc: {type: String},
    // comments: Comment[];
    // like: Like[];
    // tags: Tag[]
});

module.exports = model('Item', schema);



