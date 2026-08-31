import mongoose from 'mongoose';

const GigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  payment: { type: Number, required: true },
  status: { type: String, default: 'Open' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Gig || mongoose.model('Gig', GigSchema);
