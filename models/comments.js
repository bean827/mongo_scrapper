const mongoose = require('mongoose');

const CommentsSchema = new mongoose.Schema({
    articleComment: String
});

const Comments = mongoose.model('Comments', CommentsSchema);

module.exports = Comments;