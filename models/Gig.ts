import mongoose from 'mongoose';

const GigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  payment: { type: Number, required: true },
  isNegotiable: { type: Boolean, default: false },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  address: { type: String },
  status: { type: String, default: 'Open' }, // Open, Accepted, In-Progress, Completed
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

GigSchema.index({ location: '2dsphere' });

export default mongoose.models.Gig || mongoose.model('Gig', GigSchema);
