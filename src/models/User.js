const {Schema, model} = require('mongoose');

const schema = new Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    banned: {type: Boolean, default: false},
    avatarSrc: {type: String},
    role: {type: String},
    collections: [
        {type: Schema.Types.ObjectId, ref: 'Collection'}
    ],
});

module.exports = model('User', schema);
