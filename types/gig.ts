export interface Gig {
  id: string;
  title: string;
  category: 'Delivery' | 'Moving' | 'Tutoring' | 'Tech Help' | 'Home Care' | 'Event Assist' | 'Pet Care';
  description: string;
  locationName: string;
  distanceKm: number;
  payment: number;
  duration: string;
  urgency: 'Immediate' | 'Today' | 'Flexible';
  postedAt: string;
  posterName: string;
  posterRating: number;
  posterCompletedGigs: number;
  verifiedPoster: boolean;
  aiMatchScore: number;
  aiTags: string[];
  safetyScore: number;
  requirements: string[];
  status: 'Open' | 'In-Progress' | 'Completed';
}

export type GigCategory = Gig['category'] | 'All';
