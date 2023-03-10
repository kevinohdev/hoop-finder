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
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: 'You must supply an author'
  }
  }, {
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
  }
);

courtSchema.index({
  name: 'text', 
  description: 'text'
});

courtSchema.index({
  location: '2dsphere'
});

courtSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next();
    return; 
  }
  this.slug = slug(this.name);
  // find stores with duplicate slugs, make them unique
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

courtSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

courtSchema.virtual('reviews', {
  ref: 'Review', 
  localField: '_id', 
  foreignField: 'court'
});

courtSchema.statics.getTopCourts = function() {
  return this.aggregate([
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' }},
    // Filter for courts with at least 2 reviews
    { $match: { 'reviews.1': { $exists: true } } },
    // Add the average reviews field
    { $project: {
      photo: '$$ROOT.photo',
      name: '$$ROOT.name',
      reviews: '$$ROOT.reviews',
      slug: '$$ROOT.slug',
      averageRating: { $avg: '$reviews.rating' }
    } },
    { $sort: { averageRating: -1 }},
    { $limit: 10 }
  ]);
};

function autopopulate(next) {
  this.populate('reviews');
  next();
}

courtSchema.pre('find', autopopulate);
courtSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Court', courtSchema);