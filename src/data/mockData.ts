export interface VolunteerEvent {
  id: string;
  title: string;
  organization: string;
  category: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  frequency: 'one-time' | 'weekly' | 'monthly' | 'ongoing';
  date: string;
  time: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  description: string;
  requirements: string[];
  benefits: string[];
  spotsAvailable: number;
  totalSpots: number;
  imageUrl: string;
  familyFriendly: boolean;
  skillsNeeded: string[];
  commitment: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
}

export const mockEvents: VolunteerEvent[] = [
  {
    id: '1',
    title: 'Community Garden Cleanup',
    organization: 'Green Earth Initiative',
    category: 'Environment & Nature',
    type: 'in-person',
    frequency: 'weekly',
    date: '2025-01-15',
    time: '9:00 AM - 12:00 PM',
    location: 'Central Park Community Garden, Main St',
    coordinates: { lat: 40.7829, lng: -73.9654 }, // Central Park, NYC
    description: 'Help maintain our community garden by weeding, planting, and general maintenance. No experience necessary - we\'ll teach you everything you need to know!',
    requirements: ['Comfortable outdoor clothing', 'Water bottle', 'Enthusiasm to learn'],
    benefits: ['Learn about sustainable gardening', 'Meet like-minded community members', 'Fresh vegetables to take home'],
    spotsAvailable: 8,
    imageUrl: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
    familyFriendly: true,
    skillsNeeded: ['No experience needed'],
    commitment: '3 hours weekly',
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah@greenearth.org',
      phone: '(555) 123-4567'
    }
  },
  {
    id: '2',
    title: 'Reading Buddy Program',
    organization: 'Literacy First',
    category: 'Education & Youth',
    type: 'in-person',
    frequency: 'weekly',
    date: '2025-01-16',
    time: '3:30 PM - 5:00 PM',
    location: 'Lincoln Elementary School, 123 Oak Ave',
    coordinates: { lat: 40.7589, lng: -73.9851 }, // NYC area
    description: 'Spend quality time reading with elementary school children to help improve their literacy skills and foster a love of reading.',
    requirements: ['Background check required', 'Commitment for at least 3 months', 'Patience and enthusiasm'],
    benefits: ['Make a lasting impact on a child\'s education', 'Develop mentoring skills', 'Flexible scheduling'],
    spotsAvailable: 5,
    imageUrl: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
    familyFriendly: false,
    skillsNeeded: ['Good reading skills', 'Patience with children'],
    commitment: '1.5 hours weekly',
    contact: {
      name: 'Michael Chen',
      email: 'michael@literacyfirst.org',
      phone: '(555) 234-5678'
    }
  },
  {
    id: '3',
    title: 'Senior Tech Support',
    organization: 'Digital Bridges',
    category: 'Technology & Digital',
    type: 'virtual',
    frequency: 'ongoing',
    date: '2025-01-17',
    time: 'Flexible hours',
    location: 'Remote/Online',
    coordinates: undefined, // Virtual event
    description: 'Help senior citizens navigate technology challenges through one-on-one video calls. Assist with smartphones, computers, and online services.',
    requirements: ['Good internet connection', 'Patient teaching style', 'Basic tech troubleshooting skills'],
    benefits: ['Flexible remote volunteering', 'Develop teaching skills', 'Bridge the digital divide'],
    spotsAvailable: 10,
    imageUrl: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg',
    familyFriendly: false,
    skillsNeeded: ['Tech-savvy', 'Communication skills', 'Patience'],
    commitment: '2-4 hours per week',
    contact: {
      name: 'Lisa Rodriguez',
      email: 'lisa@digitalbridges.net',
      phone: '(555) 345-6789'
    }
  },
  {
    id: '4',
    title: 'Animal Shelter Dog Walking',
    organization: 'Happy Tails Rescue',
    category: 'Animals & Pets',
    type: 'in-person',
    frequency: 'ongoing',
    date: '2025-01-18',
    time: '8:00 AM - 6:00 PM',
    location: 'Happy Tails Animal Shelter, 456 Pet Lane',
    coordinates: { lat: 40.7505, lng: -73.9934 }, // NYC area
    description: 'Give shelter dogs the exercise and socialization they need by taking them on walks around our facility and nearby trails.',
    requirements: ['Comfortable walking for 30+ minutes', 'Basic dog handling experience preferred', 'Orientation session required'],
    benefits: ['Improve dogs\' chances of adoption', 'Get your daily exercise', 'Work with adorable animals'],
    spotsAvailable: 15,
    imageUrl: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
    familyFriendly: true,
    skillsNeeded: ['Comfort with dogs', 'Physical activity'],
    commitment: 'Flexible - minimum 2 hours per week',
    contact: {
      name: 'David Park',
      email: 'david@happytails.org',
      phone: '(555) 456-7890'
    }
  },
  {
    id: '5',
    title: 'Food Bank Sorting & Packing',
    organization: 'Community Food Network',
    category: 'Food & Hunger',
    type: 'in-person',
    frequency: 'weekly',
    date: '2025-01-19',
    time: '10:00 AM - 2:00 PM',
    location: 'Community Food Bank, 789 Hope Street',
    coordinates: { lat: 40.7614, lng: -73.9776 }, // NYC area
    description: 'Sort donations, pack food boxes, and help organize inventory to ensure families in need receive nutritious meals.',
    requirements: ['Ability to lift 25 lbs', 'Comfortable standing for extended periods', 'Team player attitude'],
    benefits: ['Directly fight hunger in your community', 'Work with a great team', 'See immediate impact'],
    spotsAvailable: 12,
    imageUrl: 'https://images.pexels.com/photos/6995247/pexels-photo-6995247.jpeg',
    familyFriendly: true,
    skillsNeeded: ['Organization skills', 'Physical activity'],
    commitment: '4 hours weekly',
    contact: {
      name: 'Amanda White',
      email: 'amanda@communityfood.org',
      phone: '(555) 567-8901'
    }
  },
  {
    id: '6',
    title: 'Youth Art Workshop Assistant',
    organization: 'Creative Minds Studio',
    category: 'Arts & Culture',
    type: 'in-person',
    frequency: 'monthly',
    date: '2025-01-20',
    time: '1:00 PM - 4:00 PM',
    location: 'Creative Minds Studio, 321 Art Blvd',
    coordinates: { lat: 40.7549, lng: -73.9840 }, // NYC area
    description: 'Assist with monthly art workshops for underprivileged youth, helping with supplies, cleanup, and providing encouragement.',
    requirements: ['Love for working with kids', 'Appreciation for arts and creativity', 'Helpful attitude'],
    benefits: ['Support youth creativity', 'Learn new art techniques', 'Make a difference in kids\' lives'],
    spotsAvailable: 6,
    imageUrl: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    familyFriendly: false,
    skillsNeeded: ['Working with children', 'Creativity appreciation'],
    commitment: '3 hours monthly',
    contact: {
      name: 'Rachel Green',
      email: 'rachel@creativeminds.org',
      phone: '(555) 678-9012'
    }
  }
];