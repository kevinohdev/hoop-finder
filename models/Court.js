const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const courtSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a valid name'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
});

courtSchema.pre('save', function(next) {
  if(!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slug(this.name);
  next();
})

module.exports = mongoose.model('Court', courtSchema);