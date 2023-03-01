const {Schema, model} = require('mongoose');

const schema = new Schema({
    author: {type: Object, required: true},
    name: {type: String, required: true},
    imgSrc: {type: String},
    date: {type: String, required: true},
    comments: [
        {type: Schema.Types.ObjectId, ref: 'Comment'}
    ],
    likes: {type: Schema.Types.ObjectId, ref: 'Like'},
    tags: [
        {type: Schema.Types.ObjectId, ref: 'Tag'}
    ],
    optionalFields: [{type: Object}]
});

module.exports = model('Item', schema);



