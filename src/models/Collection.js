const {Schema, model} = require('mongoose');

const schema = new Schema({
    name: {type: String, required: true},
    imgSrc: {type: String},
    description: {type: String, required: true},
    theme: {type: String, required: true},
    date: {type: String, required: true},
    items: [
        {type: Schema.Types.ObjectId, ref: 'Item'}
    ],
    // optionalField: {type: String, required: true},
});

module.exports = model('Collection', schema);



