const {Schema, model} = require('mongoose');
const atlasPlugin = require('mongoose-atlas-search');

const schema = new Schema({
    author: {type: Object, required: true},
    name: {type: String, required: true},
    imgSrc: {type: String},
    date: {type: String, required: true},
    comments: [{
        sender: {type: Object, required: true},
        comment: {type: String, required: true},
        date: {type: String, required: true}}
    ],
    likes: {type: Schema.Types.ObjectId, ref: 'Like'},
    tags: [
        {type: Schema.Types.ObjectId, ref: 'Tag'}
    ],
    optionalFields: [{type: Object}]
});

const ItemModel = model('Item', schema);

atlasPlugin.initialize({
    model: ItemModel,
    overwriteFind: true,
    searchKey: 'search',
    searchFunction: query => {
        return {
            'wildcard': {
                'query': `${query}*`,
                'path': ['name', 'author.userName', 'optionalFields.name', 'optionalFields.value', 'comments.comment', 'tags.tag'],
                'allowAnalyzedField': true
            }
        }
    }

});

module.exports = ItemModel;



