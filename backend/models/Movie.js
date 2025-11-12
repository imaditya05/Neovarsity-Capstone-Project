const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a movie title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a movie description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  genre: {
    type: [String],
    required: [true, 'Please provide at least one genre'],
    enum: [
      'Action',
      'Adventure',
      'Animation',
      'Biography',
      'Comedy',
      'Crime',
      'Documentary',
      'Drama',
      'Family',
      'Fantasy',
      'Film-Noir',
      'History',
      'Horror',
      'Music',
      'Musical',
      'Mystery',
      'Romance',
      'Sci-Fi',
      'Sport',
      'Thriller',
      'War',
      'Western'
    ]
  },
  language: {
    type: String,
    required: [true, 'Please provide a language'],
    default: 'English'
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please provide movie duration'],
    min: [1, 'Duration must be at least 1 minute']
  },
  releaseDate: {
    type: Date,
    required: [true, 'Please provide a release date']
  },
  rating: {
    type: String,
    enum: ['U', 'U/A', 'A', 'S', 'G', 'PG', 'PG-13', 'R', 'NC-17'],
    required: [true, 'Please provide a rating']
  },
  posterUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x450?text=No+Poster'
  },
  trailerUrl: {
    type: String
  },
  cast: [{
    name: String,
    role: String
  }],
  director: {
    type: String,
    required: [true, 'Please provide director name']
  },
  producers: [String],
  // Movie statistics
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // Status
  status: {
    type: String,
    enum: ['coming_soon', 'now_showing', 'ended'],
    default: 'now_showing'
  },
  // Who added this movie
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // For theater owners - which theater owns this movie
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster searches
// Use 'none' for language_override to prevent MongoDB from using the 'language' field for text search
movieSchema.index({ title: 'text', description: 'text' }, { default_language: 'english', language_override: 'none' });
movieSchema.index({ genre: 1 });
movieSchema.index({ status: 1 });
movieSchema.index({ releaseDate: -1 });

// Virtual for formatted duration
movieSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return `${hours}h ${minutes}m`;
});

// Ensure virtuals are included in JSON
movieSchema.set('toJSON', { virtuals: true });
movieSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Movie', movieSchema);

