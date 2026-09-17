import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false }, // [longitude, latitude]
  },
  avgRating: { type: Number, default: 0 },
  studentId: { type: String },
  isVerified: { type: Boolean, default: false },
  age: { type: Number },
  session: { type: String },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ location: '2dsphere' });

export default mongoose.models.User || mongoose.model('User', UserSchema);
