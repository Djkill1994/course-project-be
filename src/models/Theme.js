const {Schema, model} = require('mongoose');

const schema = new Schema({
    theme: {type: String, required: true}
});

module.exports = model('Theme', schema);



