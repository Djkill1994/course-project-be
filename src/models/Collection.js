const {Schema, model} = require('mongoose');

const schema = new Schema({
    name: {type: String, required: true},
    imgSrc: {type: String, required: true},
    description: {type: String, required: true},
    theme: {type: String, required: true},
    // item: {type: String, required: true},
    // optionalField: {type: String, required: true},
});

module.exports = model('Collection', schema);



