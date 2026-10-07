/**
 * Seed script: Add 10 gigs for Gomti Nagar, Lucknow
 * Run: node scripts/seedGomtiNagarGigs.mjs
 *
 * Gomti Nagar, Lucknow approximate coordinates:
 *   Latitude:  26.8467 ~ 26.8600
 *   Longitude: 80.9462 ~ 80.9700
 */

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/quickgig';

const GigSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  category:     { type: String, required: true },
  payment:      { type: Number, required: true },
  isNegotiable: { type: Boolean, default: false },
  image:        { type: String, required: false },
  postedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  address:   { type: String },
  status:    { type: String, default: 'Open' },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

GigSchema.index({ location: '2dsphere' });

const Gig = mongoose.models.Gig || mongoose.model('Gig', GigSchema);

// Dummy poster ObjectId (replace with a real user _id if needed)
const dummyPoster = new mongoose.Types.ObjectId('000000000000000000000001');

// expiresAt = 5 days from now
const expiresAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

const gigs = [
  // 1. Delivery
  {
    title: 'Pick up & Deliver Documents from Vibhuti Khand to Shaheed Path',
    description:
      'Need a reliable person with a bike to collect signed property documents from our office in Vibhuti Khand, Gomti Nagar and deliver them to a law firm on Shaheed Path. Confidentiality required.',
    category: 'Delivery',
    payment: 320,
    isNegotiable: false,
    address: 'Vibhuti Khand, Gomti Nagar, Lucknow',
    location: { type: 'Point', coordinates: [80.9512, 26.8528] },
    status: 'Open',
    expiresAt,
    postedBy: dummyPoster,
  },

  // 2. Moving
  {
    title: 'Help Shift 2-Room Flat Belongings Within Gomti Nagar (Ground Floor)',
    description:
      'Moving from one flat to another in the same colony (200m apart). Need 2–3 people to help carry furniture and packed boxes. Ground floor only, no stairs. Approx 3 hours work.',
    category: 'Moving',
    payment: 1200,
    isNegotiable: true,
    address: 'Sector 4, Gomti Nagar, Lucknow',
    location: { type: 'Point', coordinates: [80.9480, 26.8545] },
    status: 'Open',
    expiresAt,
    postedBy: dummyPoster,
  },

  // 3. Tutoring
  {
    title: 'Class 12 Maths Doubt Clearing – Calculus & Vectors (2 Sessions)',
    description:
      'Looking for a patient and knowledgeable tutor to help my daughter with Calculus (Limits, Derivatives, Integration) and Vectors for her board exams. Preferred Hindi-medium explanation. Meeting at our home in Gomti Nagar.',
    category: 'Tutoring',
    payment: 800,
    isNegotiable: false,
    address: 'Gomti Nagar Extension, Lucknow',
    location: { type: 'Point', coordinates: [80.9620, 26.8470] },
    status: 'Open',
    expiresAt,
    postedBy: dummyPoster,
  },

  // 4. Tech Help
  {
    title: 'Fix Slow Wi-Fi & Router Configuration at Home Office',
    description:
      'My JioFiber router drops connection frequently in the back room. Need someone to reconfigure the router, set up 2.4GHz/5GHz bands correctly, and possibly suggest powerline extender placement. Work from home setup in Gomti Nagar.',
    category: 'Tech Help',
    payment: 450,
    isNegotiable: true,
    address: 'Viram Khand, Gomti Nagar, Lucknow',
    location: { type: 'Point', coordinates: [80.9495, 26.8592] },
    status: 'Open',
    expiresAt,
    postedBy: dummyPoster,
  },

  // 5. Home Care
  {
    title: 'Deep Clean Kitchen & Bathroom – 3BHK Apartment',
    description:
      'Need a thorough deep cleaning of kitchen (chimney, tiles, hob, sink) and two bathrooms in our 3BHK flat in Gomti Nagar. All cleaning supplies will be provided. Expected time: 3–4 hours.',
    category: 'Home Care',
    payment: 900,
    isNegotiable: false,
    address: 'Gomti Nagar, Lucknow – near Wave Mall',
    location: { type: 'Point', coordinates: [80.9543, 26.8515] },
    status: 'Open',
    expiresAt,
    postedBy: dummyPoster,
  },

  // 6. Event Assist
  {
    title: 'Help Decorate & Set Up Birthday Party Venue (Evening)',
    description:
      'Organizing a birthday party at home for 30 guests this Saturday evening. Need 2 enthusiastic helpers to assist with balloon arrangements, table setting, and fairy lights. Dinner & snacks included for helpers.',
    category: 'Event Assist',
    payment: 600,
    isNegotiable: false,
    address: 'Sunder Khand, Gomti Nagar, Lucknow',
    location: { type: 'Point', coordinates: [80.9460, 26.8565] },
    status: 'Open',
    expiresAt,
    postedBy: dummyPoster,
  },

  // 7. Pet Care
  {
    title: 'Pet Sitting for Two Indie Cats – Weekend (Sat–Sun)',
    description:
      'Travelling to Delhi for weekend, need a responsible pet sitter to stay at our flat or visit twice daily to feed, play with, and clean litter for two friendly Indian cats (Mochi & Chai). Flat in Gomti Nagar.',
    category: 'Pet Care',
    payment: 700,
    isNegotiable: true,
    address: 'Prerna Khand, Gomti Nagar, Lucknow',
    location: { type: 'Point', coordinates: [80.9530, 26.8555] },
    status: 'Open',
    expiresAt,
    postedBy: dummyPoster,
  },

  // 8. Delivery (second one – different flavour)
  {
    title: 'Grocery Run from BigBazaar Gomti Nagar to Home (Heavy Bags)',
    description:
      'Monthly grocery shopping done online but need someone with a car/large bike to pick up the ready order from BigBazaar, Gomti Nagar and bring it to my apartment on 4th floor (elevator available). About 8–10 bags.',
    category: 'Delivery',
    payment: 280,
    isNegotiable: false,
    address: 'Opp. BigBazaar, Gomti Nagar, Lucknow',
    location: { type: 'Point', coordinates: [80.9501, 26.8508] },
    status: 'Open',
    expiresAt,
    postedBy: dummyPoster,
  },

  // 9. Tech Help (second – different flavour)
  {
    title: 'Excel Dashboard & Pivot Table Training (2 Hours, WFH)',
    description:
      'Running a small business in Lucknow. Need a trainer to teach me advanced Excel – Pivot Tables, VLOOKUP, conditional formatting, and basic chart creation via Google Meet or in person at Gomti Nagar.',
    category: 'Tech Help',
    payment: 750,
    isNegotiable: false,
    address: 'Gomti Nagar, Lucknow',
    location: { type: 'Point', coordinates: [80.9470, 26.8535] },
    status: 'Open',
    expiresAt,
    postedBy: dummyPoster,
  },

  // 10. Tutoring (second – different subject)
  {
    title: 'Spoken English Coaching for Interview Preparation (3 Sessions)',
    description:
      'Have a corporate interview next month and want to improve confidence in English speaking. Need a patient coach for 3 sessions of 1 hour each at a café or home in Gomti Nagar. Flexible timings.',
    category: 'Tutoring',
    payment: 1500,
    isNegotiable: true,
    address: 'Gomti Nagar, Lucknow – near Indiranagar crossing',
    location: { type: 'Point', coordinates: [80.9558, 26.8490] },
    status: 'Open',
    expiresAt,
    postedBy: dummyPoster,
  },
];

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!\n');

  console.log(`📦 Inserting ${gigs.length} gigs for Gomti Nagar, Lucknow...`);
  const inserted = await Gig.insertMany(gigs);

  console.log(`\n✅ Successfully inserted ${inserted.length} gigs:\n`);
  inserted.forEach((g, i) => {
    console.log(`  ${i + 1}. [${g.category}] ${g.title}`);
    console.log(`     _id: ${g._id} | ₹${g.payment}`);
  });

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected. Done!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
