// Simplified Idealist Service - Fallback Data Only
// The real Idealist API requires contacting support for API key, so we'll use fallbacks

import { VolunteerEvent } from '../data/mockData';
import { getUniqueOpportunityImage } from './imageService';

// Category mapping for consistency
const CATEGORY_MAP: { [key: string]: string } = {
  'ANIMALS': 'Animals & Pets',
  'ARTS_MUSIC': 'Arts & Culture',
  'CHILDREN_YOUTH': 'Education & Youth',
  'COMMUNITY_DEVELOPMENT': 'Community Development',
  'EDUCATION': 'Education & Youth',
  'ENVIRONMENT': 'Environment & Nature',
  'HEALTH_MEDICINE': 'Health & Wellness',
  'SENIORS': 'Seniors & Elderly',
  'HUNGER_FOOD_SECURITY': 'Food & Hunger',
  'TECHNOLOGY': 'Technology & Digital',
  'HOUSING_HOMELESSNESS': 'Housing & Homelessness',
  'IMMIGRANTS_OR_REFUGEES': 'Community Development',
  'LEGAL_ASSISTANCE': 'Community Development',
  'MENTAL_HEALTH': 'Health & Wellness'
};

// Search for volunteer opportunities - returns US-focused fallback data
export const searchIdealistVolunteerOpportunities = async (
  location?: string,
  interests: string[] = [],
  limit: number = 25
): Promise<VolunteerEvent[]> => {
  console.log('🇺🇸 Generating US volunteer opportunities for:', location);
  
  // Note: Real Idealist API requires API key from support@idealist.org
  // Using high-quality fallback data instead
  console.log('ℹ️ Using high-quality US volunteer opportunity fallbacks');
  
  return generateUSOpportunities(location || 'United States', interests, limit);
};

// Generate high-quality US volunteer opportunities
const generateUSOpportunities = async (
  location: string, 
  interests: string[], 
  limit: number
): Promise<VolunteerEvent[]> => {
  console.log('🔄 Generating US volunteer opportunities for:', location);
  
  const usOpportunities = [
    {
      id: 'us-1',
      title: 'Food Bank Distribution Volunteer',
      organization: 'Feeding America',
      category: 'Food & Hunger',
      description: `Help distribute food to families in need in the ${location} area. Sort donations, pack boxes, and assist with distribution events. Make a direct impact in fighting hunger in your community.`
    },
    {
      id: 'us-2',
      title: 'Animal Shelter Care Assistant',
      organization: 'Best Friends Animal Society',
      category: 'Animals & Pets',
      description: `Provide care and socialization for rescued animals in ${location}. Help with feeding, cleaning, walking dogs, and finding forever homes for pets in need.`
    },
    {
      id: 'us-3',
      title: 'Youth Mentorship Program',
      organization: 'Big Brothers Big Sisters',
      category: 'Education & Youth',
      description: `Mentor young people in ${location} through educational activities, sports, and life skills development. Help shape the next generation's future.`
    },
    {
      id: 'us-4',
      title: 'Environmental Conservation Volunteer',
      organization: 'Sierra Club',
      category: 'Environment & Nature',
      description: `Join conservation efforts in the ${location} region through habitat restoration, trail maintenance, and environmental education programs.`
    },
    {
      id: 'us-5',
      title: 'Senior Companion Volunteer',
      organization: 'AARP Foundation',
      category: 'Seniors & Elderly',
      description: `Provide companionship and support to seniors in ${location}. Help with activities, transportation, and social connection to combat isolation.`
    },
    {
      id: 'us-6',
      title: 'Literacy Tutoring Volunteer',
      organization: 'United Way',
      category: 'Education & Youth',
      description: `Help adults and children in ${location} improve their reading skills through one-on-one tutoring sessions. Make education accessible to everyone.`
    },
    {
      id: 'us-7',
      title: 'Community Garden Volunteer',
      organization: 'American Community Gardening Association',
      category: 'Environment & Nature',
      description: `Help maintain community gardens in ${location} by planting, weeding, harvesting, and teaching sustainable gardening practices.`
    },
    {
      id: 'us-8',
      title: 'Homeless Shelter Support',
      organization: 'National Alliance to End Homelessness',
      category: 'Housing & Homelessness',
      description: `Support individuals experiencing homelessness in ${location} by helping with meals, organizing donations, and providing basic services.`
    },
    {
      id: 'us-9',
      title: 'Hospital Volunteer',
      organization: 'American Hospital Association',
      category: 'Health & Wellness',
      description: `Provide comfort and support to patients and families at hospitals in ${location}. Help with wayfinding, reading, and companionship.`
    },
    {
      id: 'us-10',
      title: 'Arts Education Assistant',
      organization: 'Americans for the Arts',
      category: 'Arts & Culture',
      description: `Assist with arts education programs for underserved youth in ${location}. Help with art supplies, instruction, and creative workshops.`
    },
    {
      id: 'us-11',
      title: 'Disaster Relief Volunteer',
      organization: 'American Red Cross',
      category: 'Community Development',
      description: `Help communities in ${location} prepare for and recover from disasters. Assist with emergency response, relief distribution, and community preparedness.`
    },
    {
      id: 'us-12',
      title: 'Digital Literacy Instructor',
      organization: 'DigitalC',
      category: 'Technology & Digital',
      description: `Teach basic computer and internet skills to seniors and low-income families in ${location}. Help bridge the digital divide in your community.`
    }
  ];

  // Filter by interests if specified
  let filteredOpportunities = usOpportunities;
  if (interests.length > 0) {
    filteredOpportunities = usOpportunities.filter(opp =>
      interests.some(interest =>
        opp.category.toLowerCase().includes(interest.toLowerCase()) ||
        opp.title.toLowerCase().includes(interest.toLowerCase()) ||
        opp.description.toLowerCase().includes(interest.toLowerCase())
      )
    );
  }

  // If no matches, return a few anyway
  if (filteredOpportunities.length === 0) {
    filteredOpportunities = usOpportunities.slice(0, 5);
  }
  
  // Convert to full VolunteerEvent format
  const opportunities = await Promise.all(
    filteredOpportunities.slice(0, limit).map(async (opp) => {
      const imageUrl = await getUniqueOpportunityImage({
        id: opp.id,
        title: opp.title,
        organization: opp.organization,
        category: opp.category
      });
      
      return {
        ...opp,
        type: Math.random() > 0.7 ? 'virtual' : 'in-person' as const,
        frequency: getRandomFrequency(),
        date: getRandomFutureDate(),
        time: getRandomTime(),
        location: `${location}, USA`,
        coordinates: undefined,
        requirements: getRandomRequirements(),
        benefits: getRandomBenefits(),
        spotsAvailable: Math.floor(Math.random() * 15) + 5,
        totalSpots: Math.floor(Math.random() * 10) + 20,
        imageUrl,
        familyFriendly: Math.random() > 0.4,
        skillsNeeded: getRandomSkills(),
        commitment: getRandomCommitment(),
        contact: {
          name: 'Volunteer Coordinator',
          email: `volunteer@${opp.organization.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '')}.org`,
          phone: '(555) 123-4567'
        }
      };
    })
  );
  
  return opportunities;
};

// Helper functions
const getRandomFrequency = (): 'one-time' | 'weekly' | 'monthly' | 'ongoing' => {
  const frequencies: ('one-time' | 'weekly' | 'monthly' | 'ongoing')[] = ['one-time', 'weekly', 'monthly', 'ongoing'];
  return frequencies[Math.floor(Math.random() * frequencies.length)];
};

const getRandomTime = (): string => {
  const times = [
    '9:00 AM - 12:00 PM',
    '10:00 AM - 2:00 PM',
    '1:00 PM - 4:00 PM',
    '6:00 PM - 8:00 PM',
    '9:00 AM - 5:00 PM',
    'Flexible hours'
  ];
  return times[Math.floor(Math.random() * times.length)];
};

const getRandomFutureDate = (): string => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 60) + 1);
  return futureDate.toISOString().split('T')[0];
};

const getRandomRequirements = (): string[] => {
  const allRequirements = [
    'Enthusiasm and positive attitude',
    'Reliable transportation',
    'Background check may be required',
    'Ability to lift 25 lbs',
    'Good communication skills',
    'Team player mentality',
    'Flexible schedule',
    'Physical fitness required'
  ];
  
  const count = Math.floor(Math.random() * 3) + 2;
  return allRequirements.slice(0, count);
};

const getRandomBenefits = (): string[] => {
  const allBenefits = [
    'Make a meaningful impact in your community',
    'Meet like-minded volunteers',
    'Develop new skills and experience',
    'Flexible scheduling options',
    'Recognition and appreciation',
    'Professional development opportunities',
    'Build your resume',
    'Personal fulfillment and growth'
  ];
  
  const count = Math.floor(Math.random() * 3) + 2;
  return allBenefits.slice(0, count);
};

const getRandomSkills = (): string[] => {
  const allSkills = [
    'No special skills required',
    'Communication skills',
    'Organizational abilities',
    'Patience and empathy',
    'Physical activity',
    'Computer literacy',
    'Teaching ability',
    'Problem-solving skills'
  ];
  
  const count = Math.floor(Math.random() * 2) + 1;
  return allSkills.slice(0, count);
};

const getRandomCommitment = (): string => {
  const commitments = [
    '2-3 hours weekly',
    '4 hours monthly',
    'One-time event',
    'Flexible schedule',
    '1-2 hours weekly',
    '3-4 hours monthly',
    'Weekend commitments'
  ];
  return commitments[Math.floor(Math.random() * commitments.length)];
};

// Search by US location
export const searchUSVolunteerOpportunitiesByLocation = async (
  location: string,
  limit: number = 25
): Promise<VolunteerEvent[]> => {
  console.log('🇺🇸 Searching US volunteer opportunities by location:', location);
  return searchIdealistVolunteerOpportunities(location, [], limit);
};

// Search by interests in US
export const searchUSVolunteerOpportunitiesByInterests = async (
  interests: string[],
  location: string = 'United States',
  limit: number = 25
): Promise<VolunteerEvent[]> => {
  console.log('🇺🇸 Searching US volunteer opportunities by interests:', interests);
  return searchIdealistVolunteerOpportunities(location, interests, limit);
};