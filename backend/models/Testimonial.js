import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide testimonial content'],
    trim: true,
    maxlength: [1000, 'Testimonial cannot be more than 1000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A testimonial must belong to a user']
  },
  name: {
    type: String,
    required: [true, 'Please provide your name']
  },
  role: {
    type: String,
    default: 'Member'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
testimonialSchema.index({ user: 1, createdAt: -1 });
testimonialSchema.index({ status: 1, createdAt: -1 });

// Static method to get average rating
testimonialSchema.statics.calcAverageRatings = async function() {
  const stats = await this.aggregate([
    {
      $match: { status: 'approved' }
    },
    {
      $group: {
        _id: null,
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // TODO: Save these stats to a separate collection or use them as needed
  console.log(stats);
};

// Call calcAverageRatings after save
testimonialSchema.post('save', function() {
  this.constructor.calcAverageRatings();
});

// Call calcAverageRatings after update/delete
testimonialSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) await doc.constructor.calcAverageRatings();
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
