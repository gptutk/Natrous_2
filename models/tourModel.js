const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const User = require('./userModel');
//trim removes all the white spaces
//here image is string as it will only have a name initially
//here images are a array of string
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A name can contain max 40 characters'],
      minLength: [10, 'A name must contain atleast 10 characters'],
      // validate: [bla.isAlpha, 'tour name must only contain characters'],
    },
    slug: {
      type: String,
    },

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },

    difficulty: {
      type: String,
      required: [true, ' A tour must have a difficulty '],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        _message: 'Difficulty is either easy, meduim and difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating must be above 1.0 atleast'],
      max: [5, 'A rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (arg) {
          return arg < this.price;
        },
        message: 'discount{{VALUE}} must be less than price',
      },
    },

    summary: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },

    imageCover: {
      type: String,
      required: [true, ' A tour must have a cover image'],
    },
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//We define a middleware on the schema

//this is gonna run before an actual event, here the event is save.
//DOCUMENT MIDDLEWARE : runs before .save() and .create()
tourSchema.pre('save', function (next) {
  //this here refers to the current doument.
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', (next) => {
  // console.log('Will save the doc');
  next();
});

//post has access to doc which was just saved to the database
// eslint-disable-next-line prefer-arrow-callback
tourSchema.post('save', function (doc, next) {
  //here this points to the current document.
  // console.log(doc);
  next();
});

//QUERY MIDDLEWARE
//A middleware that is gonna run, before any find query is executed.
//This points at the current query, not at the document.
//Secretive results.
//because of find it becomes a query middleware, not doc middleware.

tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next)
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: 'id name email role photo',
  });
  next();
});

//this runs after the query has executed and has accces to the docs
tourSchema.post(/^find/, function (docs, next) {
  //here this points to the current query
  console.log(`This query took ${Date.now() - this.start} miliseconds`);
  next();
});

//AGGREGATION MIDDLEWARE : Runs befor or after an aggregation.

tourSchema.pre('aggregate', function (next) {
  console.log('inside aggration ;');
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //here this points to the current aggregation object.
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// we can run commands between events.
//document, query, aggregate, model middleware.

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(
//     async (ele) => await User.findById(ele)
//   );
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
