import { VolunteerEvent } from '../data/mockData';
import { getUniqueOpportunityImage, extractVolunteerConnectorImage } from './imageService';

// VolunteerConnector API types
interface VolunteerConnectorResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: VolunteerConnectorOpportunity[];
}

interface VolunteerConnectorOpportunity {
  id: number;
  url: string;
  title: string;
  description: string;
  remote_or_online: boolean;
  organization: {
    name: string;
    logo: string;
    url: string;
  };
  activities: Array<{
    name: string;
    category: string;
  }>;
  dates: string;
  duration: string | null;
  audience: {
    scope: 'local' | 'regional' | 'national';
    longitude?: number;
    latitude?: number;
    regions?: string[];
  };
}

// Search parameters for VolunteerConnector API
interface SearchParams {
  location?: string;
  activities?: string[];
  regions?: string[];
  remote?: boolean;
  page?: number;
  limit?: number;
}

// Base API URL
const API_BASE_URL = 'https://www.volunteerconnector.org/api/search/';

// Activity category mappings to our internal categories
const ACTIVITY_CATEGORY_MAP: { [key: string]: string } = {
  'Environmental': 'Environment & Nature',
  'Education, Language, and Art': 'Education & Youth',
  'Social Care': 'Seniors & Elderly',
  'Caregiving': 'Health & Wellness',
  'Program Support': 'Community Development',
  'PR, Fundraising, Events': 'Arts & Culture',
  'Construction, Transportation, Maintenance': 'Community Development',
  'Marketing': 'Community Development',
  'Design and Journalism': 'Arts & Culture',
  'Research': 'Education & Youth',
  'Finance': 'Community Development',
  'Accounting': 'Community Development',
  'Administration': 'Community Development',
  'Legal': 'Community Development',
  'Activism': 'Community Development',
  'Sales': 'Community Development',
  'People Engagement': 'Community Development',
  'Organizational Leadership': 'Community Development'
};

// Search for volunteer opportunities using VolunteerConnector API
export const searchVolunteerConnectorOpportunities = async (
  params: SearchParams = {}
): Promise<VolunteerEvent[]> => {
  console.log('🔍 Searching VolunteerConnector API with params:', params);
  
  try {
    // Build query parameters
    const searchParams = new URLSearchParams();
    
    // Add region filtering (focus on major Canadian regions for now)
    if (params.regions) {
      params.regions.forEach(region => {
        searchParams.append('region', region);
      });
    } else {
      // Default to major Canadian regions
      ['British Columbia', 'Alberta', 'Ontario', 'Quebec'].forEach(region => {
        searchParams.append('region', region);
      });
    }
    
    // Add activity filtering if specified
    if (params.activities && params.activities.length > 0) {
      params.activities.forEach(activity => {
        searchParams.append('ac', activity);
      });
    }
    
    // Add remote/online filter
    if (params.remote !== undefined) {
      searchParams.append('remote', params.remote.toString());
    }
    
    // Add pagination
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    
    const url = `${API_BASE_URL}?${searchParams.toString()}`;
    console.log('📡 Fetching from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BeThePeople-VolunteerApp/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`VolunteerConnector API error: ${response.status} ${response.statusText}`);
    }
    
    const data: VolunteerConnectorResponse = await response.json();
    console.log(`✅ VolunteerConnector API returned ${data.results.length} opportunities`);
    
    // Convert to our internal format
    const opportunities = await Promise.all(data.results.map(convertToVolunteerEvent));
    
    // Limit results to prevent overwhelming the user
    const limitedOpportunities = opportunities.slice(0, params.limit || 25);
    
    console.log(`🎯 Converted ${limitedOpportunities.length} opportunities`);
    return limitedOpportunities;
    
  } catch (error) {
    console.error('❌ VolunteerConnector API error:', error);
    return [];
  }
};

// Convert VolunteerConnector opportunity to our internal format
const convertToVolunteerEvent = async (vcOpp: VolunteerConnectorOpportunity): Promise<VolunteerEvent> => {
  // Determine category based on activities
  const primaryCategory = vcOpp.activities.length > 0 
    ? ACTIVITY_CATEGORY_MAP[vcOpp.activities[0].category] || 'Community Development'
    : 'Community Development';
  
  // Determine type
  const type = vcOpp.remote_or_online ? 'virtual' : 'in-person';
  
  // Parse dates and duration
  const { date, time, frequency, commitment } = parseDateAndDuration(vcOpp.dates, vcOpp.duration);
  
  // Get coordinates if available
  const coordinates = vcOpp.audience.longitude && vcOpp.audience.latitude 
    ? { lat: vcOpp.audience.latitude, lng: vcOpp.audience.longitude }
    : undefined;
  
  // Determine location string
  const location = getLocationString(vcOpp.audience);
  
  // Extract skills from activities
  const skillsNeeded = vcOpp.activities.map(activity => activity.name).slice(0, 5);
  
  // Generate requirements and benefits
  const requirements = generateRequirements(vcOpp);
  const benefits = generateBenefits(vcOpp);
  
  // Get unique image for this opportunity
  const imageUrl = await getUniqueOpportunityImage({
    id: `vc-${vcOpp.id}`,
    title: vcOpp.title,
    organization: vcOpp.organization.name,
    category: primaryCategory
  }, vcOpp.organization.url);
  
  return {
    id: `vc-${vcOpp.id}`,
    title: vcOpp.title,
    organization: vcOpp.organization.name,
    category: primaryCategory,
    type: type as 'in-person' | 'virtual' | 'hybrid',
    frequency: frequency as 'one-time' | 'weekly' | 'monthly' | 'ongoing',
    date,
    time,
    location,
    coordinates,
    description: stripHtml(vcOpp.description),
    requirements,
    benefits,
    spotsAvailable: Math.floor(Math.random() * 10) + 5, // API doesn't provide this
    totalSpots: Math.floor(Math.random() * 5) + 15,
    imageUrl,
    familyFriendly: checkIfFamilyFriendly(vcOpp),
    skillsNeeded: skillsNeeded.length > 0 ? skillsNeeded : ['No special skills required'],
    commitment,
    contact: {
      name: 'Volunteer Coordinator',
      email: 'volunteer@' + vcOpp.organization.name.toLowerCase().replace(/\s+/g, '') + '.org',
      phone: '(555) 123-4567' // API doesn't provide contact info
    }
  };
};

// Parse dates and duration from VolunteerConnector format
const parseDateAndDuration = (dates: string, duration: string | null) => {
  let date = getRandomFutureDate();
  let time = '10:00 AM - 2:00 PM';
  let frequency: 'one-time' | 'weekly' | 'monthly' | 'ongoing' = 'ongoing';
  let commitment = duration || 'Flexible schedule';
  
  // Parse dates
  if (dates.toLowerCase().includes('ongoing')) {
    frequency = 'ongoing';
    date = 'Ongoing';
  } else if (dates.includes(' - ')) {
    // Date range like "May 2, 2025 - September 10, 2025"
    const startDate = dates.split(' - ')[0].trim();
    date = startDate;
    frequency = 'ongoing';
  } else {
    date = dates;
    frequency = 'one-time';
  }
  
  // Parse duration for time and frequency hints
  if (duration) {
    if (duration.includes('weekly')) {
      frequency = 'weekly';
    } else if (duration.includes('monthly')) {
      frequency = 'monthly';
    }
    
    // Extract time if present
    const timeMatch = duration.match(/(\d+)-(\d+)\s*hours?/);
    if (timeMatch) {
      const startHour = parseInt(timeMatch[1]) + 9; // Assume starting around 9 AM
      const endHour = startHour + parseInt(timeMatch[2]);
      time = `${formatHour(startHour)} - ${formatHour(endHour)}`;
    }
  }
  
  return { date, time, frequency, commitment };
};

// Format hour as AM/PM
const formatHour = (hour: number): string => {
  if (hour === 12) return '12:00 PM';
  if (hour > 12) return `${hour - 12}:00 PM`;
  if (hour === 0) return '12:00 AM';
  return `${hour}:00 AM`;
};

// Get location string from audience data
const getLocationString = (audience: VolunteerConnectorOpportunity['audience']): string => {
  if (audience.scope === 'local' && audience.longitude && audience.latitude) {
    return `Local area (${audience.latitude.toFixed(2)}, ${audience.longitude.toFixed(2)})`;
  }
  
  if (audience.scope === 'regional' && audience.regions) {
    return audience.regions.join(', ');
  }
  
  return 'Location available upon signup';
};

// Generate requirements based on opportunity data
const generateRequirements = (vcOpp: VolunteerConnectorOpportunity): string[] => {
  const requirements = ['Enthusiasm and positive attitude'];
  
  if (vcOpp.remote_or_online) {
    requirements.push('Reliable internet connection');
    requirements.push('Computer or mobile device');
  } else {
    requirements.push('Reliable transportation');
  }
  
  // Add activity-specific requirements
  const activities = vcOpp.activities.map(a => a.name.toLowerCase());
  
  if (activities.some(a => a.includes('driving'))) {
    requirements.push('Valid driver\'s license');
  }
  
  if (activities.some(a => a.includes('counselling') || a.includes('mentoring'))) {
    requirements.push('Background check may be required');
  }
  
  if (activities.some(a => a.includes('physical') || a.includes('labour'))) {
    requirements.push('Physical fitness required');
  }
  
  return requirements.slice(0, 4); // Limit to 4 requirements
};

// Generate benefits based on opportunity data
const generateBenefits = (vcOpp: VolunteerConnectorOpportunity): string[] => {
  const benefits = ['Make a meaningful impact in your community'];
  
  if (vcOpp.remote_or_online) {
    benefits.push('Flexible remote volunteering');
    benefits.push('Work from anywhere');
  } else {
    benefits.push('Meet like-minded community members');
    benefits.push('Hands-on local impact');
  }
  
  // Add activity-specific benefits
  const categories = vcOpp.activities.map(a => a.category);
  
  if (categories.includes('Education, Language, and Art')) {
    benefits.push('Develop teaching and mentoring skills');
  }
  
  if (categories.includes('Marketing') || categories.includes('Design and Journalism')) {
    benefits.push('Build professional portfolio');
  }
  
  if (categories.includes('Environmental')) {
    benefits.push('Contribute to environmental conservation');
  }
  
  return benefits.slice(0, 4); // Limit to 4 benefits
};

// Check if opportunity is family friendly
const checkIfFamilyFriendly = (vcOpp: VolunteerConnectorOpportunity): boolean => {
  const description = vcOpp.description.toLowerCase();
  const title = vcOpp.title.toLowerCase();
  
  // Look for family-friendly indicators
  const familyKeywords = ['family', 'children', 'kids', 'youth', 'all ages', 'community event'];
  const notFamilyKeywords = ['adult only', '18+', 'mature', 'counselling', 'legal'];
  
  const hasFamilyKeywords = familyKeywords.some(keyword => 
    description.includes(keyword) || title.includes(keyword)
  );
  
  const hasNotFamilyKeywords = notFamilyKeywords.some(keyword => 
    description.includes(keyword) || title.includes(keyword)
  );
  
  return hasFamilyKeywords && !hasNotFamilyKeywords;
};

// Strip HTML tags from description
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').replace(/\r\n/g, ' ').trim();
};

// Get random future date
const getRandomFutureDate = (): string => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
  return futureDate.toISOString().split('T')[0];
};

// Get image for category
const getImageForCategory = (category: string): string => {
  const imageMap: { [key: string]: string } = {
    'Animals & Pets': 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
    'Food & Hunger': 'https://images.pexels.com/photos/6995247/pexels-photo-6995247.jpeg',
    'Health & Wellness': 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg',
    'Education & Youth': 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
    'Community Development': 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
    'Environment & Nature': 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
    'Arts & Culture': 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    'Seniors & Elderly': 'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg'
  };

  return imageMap[category] || 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg';
};

// Search by location (region-based)
export const searchByLocation = async (location: string, limit: number = 25): Promise<VolunteerEvent[]> => {
  // Map common locations to Canadian regions
  const locationToRegion: { [key: string]: string[] } = {
    'vancouver': ['British Columbia'],
    'calgary': ['Alberta'],
    'toronto': ['Ontario'],
    'montreal': ['Quebec'],
    'british columbia': ['British Columbia'],
    'alberta': ['Alberta'],
    'ontario': ['Ontario'],
    'quebec': ['Quebec'],
    'bc': ['British Columbia'],
    'ab': ['Alberta'],
    'on': ['Ontario'],
    'qc': ['Quebec']
  };
  
  const locationLower = location.toLowerCase();
  let regions: string[] = [];
  
  // Find matching regions
  for (const [key, value] of Object.entries(locationToRegion)) {
    if (locationLower.includes(key)) {
      regions = value;
      break;
    }
  }
  
  // Default to all major regions if no match
  if (regions.length === 0) {
    regions = ['British Columbia', 'Alberta', 'Ontario', 'Quebec'];
  }
  
  return searchVolunteerConnectorOpportunities({
    regions,
    limit
  });
};

// Search by interests/activities
export const searchByInterests = async (interests: string[], limit: number = 25): Promise<VolunteerEvent[]> => {
  // Map our interests to VolunteerConnector activity categories
  const interestToActivityMap: { [key: string]: string[] } = {
    'environment & nature': ['Environmental'],
    'education & youth': ['Education, Language, and Art'],
    'animals & pets': ['Caregiving'],
    'health & wellness': ['Social Care', 'Caregiving'],
    'community development': ['Program Support', 'Community Outreach'],
    'arts & culture': ['Education, Language, and Art', 'Design and Journalism'],
    'food & hunger': ['Program Support'],
    'seniors & elderly': ['Social Care', 'Caregiving']
  };
  
  const activities: string[] = [];
  
  interests.forEach(interest => {
    const interestLower = interest.toLowerCase();
    const mappedActivities = interestToActivityMap[interestLower];
    if (mappedActivities) {
      activities.push(...mappedActivities);
    }
  });
  
  return searchVolunteerConnectorOpportunities({
    activities: [...new Set(activities)], // Remove duplicates
    limit
  });
};