const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title:  {
    type: String,
    required: true
  },
  body:   {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  saved: {
    type: Boolean,
    default: false
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comments"
    }
  ]
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;