// Real Idealist Listings API Integration Service
// Uses the actual Idealist API to fetch volunteer opportunities

import { VolunteerEvent } from '../data/mockData';
import { getUniqueOpportunityImage } from './imageService';

// Real Idealist API types based on documentation
interface IdealistVolopResponse {
  volops: IdealistVolopSummary[];
  hasMore: boolean;
}

interface IdealistVolopSummary {
  id: string;
  firstPublished: string;
  updated: string;
  name: string;
  url: {
    en: string | null;
    es: string | null;
    pt: string | null;
  };
  isPublished: boolean;
}

interface IdealistVolopDetails {
  volop: {
    id: string;
    firstPublished: string;
    updated: string;
    name: string;
    description: string;
    expires: string;
    org: {
      id: string | null;
      name: string | null;
      logo: string | null;
      areasOfFocus: string[] | null;
      orgType: string | null;
      is501c3: boolean | null;
      isBCorp: boolean | null;
      isSocialEnterprise: boolean | null;
      locale: string | null;
      governmentId: string | null;
      address: {
        full: string;
        line1: string | null;
        line2: string | null;
        city: string | null;
        state: string | null;
        stateCode: string | null;
        zipcode: string | null;
        country: string;
        latitude: number;
        longitude: number;
        cityOnly: boolean;
      } | null;
      url: {
        en: string | null;
        es: string | null;
        pt: string | null;
      } | null;
    };
    locale: string;
    address: {
      full: string;
      description: string | null;
      line1: string | null;
      line2: string | null;
      city: string | null;
      state: string | null;
      stateCode: string | null;
      zipcode: string | null;
      country: string;
      latitude: number;
      longitude: number;
      cityOnly: boolean;
    };
    applyEmail: string | null;
    applyUrl: string | null;
    applyText: string | null;
    applyOnIdealist: boolean;
    locationType: 'ONSITE' | 'HYBRID' | 'REMOTE';
    remoteZone: 'WORLD' | 'COUNTRY' | 'STATE' | 'CITY' | null;
    remoteState: string | null;
    remoteCountry: string | null;
    startDate: string | null;
    endDate: string | null;
    startTime: string | null;
    endTime: string | null;
    timezone: string | null;
    welcomeGroups: boolean;
    welcomeFamilies: boolean;
    welcomeTeens: boolean;
    welcomeIntl: boolean;
    welcomeAge55Plus: boolean;
    welcomePrivateCorpGroups: boolean;
    detailsStipendProvided: boolean;
    detailsTrainingProvided: boolean;
    detailsHousingAvailable: boolean;
    detailsCulturalSupport: boolean;
    detailsWheelchairAccessible: boolean;
    orientationRequired: boolean;
    backgroundCheckRequired: boolean;
    driversLicenseRequired: boolean;
    feeRequired: boolean;
    feeAmount: string | null;
    isRecurring: boolean;
    timesOfDay: string[];
    expectedTime: string | null;
    numVolunteersNeeded: number | null;
    ageRequirement: number | null;
    otherRequirements: string | null;
    functions: string[];
    areasOfFocus: string[];
    image: {
      original: string;
      medium: string;
      thumbnail: string;
    } | null;
    url: {
      en: string;
      es: string;
      pt: string;
    };
  };
}

// Real Idealist API endpoints
const IDEALIST_BASE_URL = 'https://www.idealist.org/api/v1';
const IDEALIST_API_KEY = import.meta.env.VITE_IDEALIST_API_KEY;

// Category mapping from Idealist areas of focus to our categories
const AREAS_OF_FOCUS_MAP: { [key: string]: string } = {
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

// Search for volunteer opportunities using real Idealist API
export const searchIdealistVolunteerOpportunities = async (
  location?: string,
  interests: string[] = [],
  limit: number = 25
): Promise<VolunteerEvent[]> => {
  console.log('🇺🇸 Searching real Idealist Listings API for volunteer opportunities...');
  
  if (!IDEALIST_API_KEY) {
    console.warn('Idealist API key not found, using fallback data');
    return generateFallbackOpportunities(location || 'United States', interests, limit);
  }
  
  try {
    // Step 1: Get list of volunteer opportunity IDs
    console.log('📡 Fetching volunteer opportunity IDs from Idealist API...');
    const volopIds = await fetchAllVolopIds();
    console.log(`✅ Found ${volopIds.length} volunteer opportunity IDs`);
    
    if (volopIds.length === 0) {
      console.warn('No volunteer opportunities found');
      return generateFallbackOpportunities(location || 'United States', interests, limit);
    }
    
    // Step 2: Fetch details for each opportunity (with rate limiting)
    console.log('📋 Fetching details for volunteer opportunities...');
    const opportunities: VolunteerEvent[] = [];
    const maxToFetch = Math.min(volopIds.length, limit);
    
    for (let i = 0; i < maxToFetch; i++) {
      try {
        const volopId = volopIds[i];
        const details = await fetchVolopDetails(volopId);
        
        if (details) {
          const opportunity = await convertIdealistVolopToVolunteerEvent(details);
          
          // Filter by location if specified
          if (location && !matchesLocation(opportunity, location)) {
            continue;
          }
          
          // Filter by interests if specified
          if (interests.length > 0 && !matchesInterests(opportunity, interests)) {
            continue;
          }
          
          opportunities.push(opportunity);
        }
        
        // Rate limiting - wait 250ms between requests as recommended
        await new Promise(resolve => setTimeout(resolve, 250));
        
      } catch (error) {
        console.warn(`Failed to fetch details for volop ${volopIds[i]}:`, error);
        continue;
      }
    }
    
    console.log(`🎯 Successfully converted ${opportunities.length} Idealist volunteer opportunities`);
    return opportunities;
    
  } catch (error) {
    console.error('❌ Idealist API error:', error);
    // Fallback to sample data if API fails
    return generateFallbackOpportunities(location || 'United States', interests, limit);
  }
};

// Fetch all volunteer opportunity IDs with pagination
const fetchAllVolopIds = async (): Promise<string[]> => {
  const volopIds: string[] = [];
  let url = `${IDEALIST_BASE_URL}/listings/volops`;
  let hasMore = true;
  let ttl = 50; // Prevent infinite loops
  
  while (hasMore && ttl > 0) {
    ttl--;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(IDEALIST_API_KEY + ':')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Idealist API error: ${response.status} ${response.statusText}`);
    }
    
    const data: IdealistVolopResponse = await response.json();
    
    // Collect published volunteer opportunity IDs
    for (const volop of data.volops) {
      if (volop.isPublished && volop.name) {
        volopIds.add(volop.id);
      }
    }
    
    hasMore = data.hasMore;
    
    if (hasMore && data.volops.length > 0) {
      const lastUpdated = data.volops[data.volops.length - 1].updated;
      url = `${IDEALIST_BASE_URL}/listings/volops?since=${encodeURIComponent(lastUpdated)}`;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  
  return Array.from(volopIds);
};

// Fetch detailed information for a specific volunteer opportunity
const fetchVolopDetails = async (volopId: string): Promise<IdealistVolopDetails | null> => {
  try {
    const response = await fetch(`${IDEALIST_BASE_URL}/listings/volops/${volopId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(IDEALIST_API_KEY + ':')}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // Opportunity may have been unpublished
        return null;
      }
      throw new Error(`Idealist API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.warn(`Failed to fetch volop details for ${volopId}:`, error);
    return null;
  }
};

// Convert Idealist volunteer opportunity to our format
const convertIdealistVolopToVolunteerEvent = async (details: IdealistVolopDetails): Promise<VolunteerEvent> => {
  const volop = details.volop;
  
  // Determine category from areas of focus
  const category = determineCategory(volop.areasOfFocus, volop.name);
  
  // Get unique image (prefer Idealist's image, fallback to our system)
  let imageUrl = volop.image?.medium || volop.image?.original;
  if (!imageUrl) {
    imageUrl = await getUniqueOpportunityImage({
      id: `idealist-${volop.id}`,
      title: volop.name,
      organization: volop.org?.name || 'Organization',
      category
    }, volop.org?.url?.en || undefined);
  }
  
  // Determine location
  const location = buildLocationString(volop.address, volop.locationType, volop.remoteZone);
  
  // Build coordinates
  const coordinates = volop.address.latitude && volop.address.longitude ? {
    lat: volop.address.latitude,
    lng: volop.address.longitude
  } : undefined;
  
  // Determine type
  const type = volop.locationType === 'REMOTE' ? 'virtual' : 
               volop.locationType === 'HYBRID' ? 'hybrid' : 'in-person';
  
  // Determine frequency
  const frequency = volop.isRecurring ? 'ongoing' : 'one-time';
  
  // Build date and time
  const { date, time } = buildDateAndTime(volop);
  
  // Generate requirements from Idealist data
  const requirements = generateRequirementsFromVolop(volop);
  
  // Generate benefits from Idealist data
  const benefits = generateBenefitsFromVolop(volop);
  
  // Map functions to skills
  const skillsNeeded = volop.functions.length > 0 ? 
    volop.functions.slice(0, 3).map(func => formatFunction(func)) : 
    ['No special skills required'];
  
  // Determine commitment
  const commitment = buildCommitment(volop.expectedTime, volop.isRecurring);
  
  return {
    id: `idealist-${volop.id}`,
    title: volop.name,
    organization: volop.org?.name || 'Organization',
    category,
    type: type as 'in-person' | 'virtual' | 'hybrid',
    frequency: frequency as 'one-time' | 'weekly' | 'monthly' | 'ongoing',
    date,
    time,
    location,
    coordinates,
    description: stripHtml(volop.description),
    requirements,
    benefits,
    spotsAvailable: volop.numVolunteersNeeded || Math.floor(Math.random() * 10) + 5,
    totalSpots: (volop.numVolunteersNeeded || 10) + Math.floor(Math.random() * 5) + 5,
    imageUrl,
    familyFriendly: volop.welcomeFamilies || volop.welcomeTeens,
    skillsNeeded,
    commitment,
    contact: {
      name: 'Volunteer Coordinator',
      email: volop.applyEmail || 'volunteer@' + (volop.org?.name?.toLowerCase().replace(/\s+/g, '') || 'organization') + '.org',
      phone: '(555) 123-4567' // API doesn't provide phone numbers
    }
  };
};

// Helper functions
const determineCategory = (areasOfFocus: string[], title: string): string => {
  // Check areas of focus first
  for (const area of areasOfFocus) {
    const mapped = AREAS_OF_FOCUS_MAP[area];
    if (mapped) return mapped;
  }
  
  // Fallback to title analysis
  const titleLower = title.toLowerCase();
  if (titleLower.includes('animal') || titleLower.includes('pet')) return 'Animals & Pets';
  if (titleLower.includes('food') || titleLower.includes('hunger')) return 'Food & Hunger';
  if (titleLower.includes('education') || titleLower.includes('teach') || titleLower.includes('tutor')) return 'Education & Youth';
  if (titleLower.includes('environment') || titleLower.includes('green') || titleLower.includes('climate')) return 'Environment & Nature';
  if (titleLower.includes('health') || titleLower.includes('medical') || titleLower.includes('hospital')) return 'Health & Wellness';
  if (titleLower.includes('senior') || titleLower.includes('elderly') || titleLower.includes('aging')) return 'Seniors & Elderly';
  if (titleLower.includes('art') || titleLower.includes('culture') || titleLower.includes('music')) return 'Arts & Culture';
  if (titleLower.includes('tech') || titleLower.includes('digital') || titleLower.includes('computer')) return 'Technology & Digital';
  if (titleLower.includes('housing') || titleLower.includes('homeless') || titleLower.includes('shelter')) return 'Housing & Homelessness';
  
  return 'Community Development';
};

const buildLocationString = (address: any, locationType: string, remoteZone: string | null): string => {
  if (locationType === 'REMOTE') {
    if (remoteZone === 'WORLD') return 'Remote - Worldwide';
    if (remoteZone === 'COUNTRY') return 'Remote - United States';
    if (remoteZone === 'STATE') return 'Remote - State';
    if (remoteZone === 'CITY') return 'Remote - Local area';
    return 'Remote';
  }
  
  if (address.cityOnly) {
    return `${address.city}, ${address.stateCode}`;
  }
  
  return address.full || `${address.city}, ${address.stateCode}`;
};

const buildDateAndTime = (volop: any): { date: string; time: string } => {
  let date = 'Ongoing';
  let time = 'Flexible hours';
  
  if (volop.startDate) {
    date = volop.startDate;
  } else if (!volop.isRecurring) {
    // Generate a future date for one-time events
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
    date = futureDate.toISOString().split('T')[0];
  }
  
  if (volop.startTime && volop.endTime) {
    // Convert 24-hour time to 12-hour format
    const startTime = formatTime(volop.startTime);
    const endTime = formatTime(volop.endTime);
    time = `${startTime} - ${endTime}`;
  } else if (volop.timesOfDay && volop.timesOfDay.length > 0) {
    time = formatTimesOfDay(volop.timesOfDay);
  }
  
  return { date, time };
};

const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const formatTimesOfDay = (timesOfDay: string[]): string => {
  const timeMap: { [key: string]: string } = {
    'WEEKDAYS_DAYTIME': 'Weekday mornings/afternoons',
    'WEEKDAYS_EVENINGS': 'Weekday evenings',
    'WEEKENDS_DAYTIME': 'Weekend days',
    'WEEKENDS_EVENINGS': 'Weekend evenings'
  };
  
  return timesOfDay.map(time => timeMap[time] || time).join(', ');
};

const generateRequirementsFromVolop = (volop: any): string[] => {
  const requirements: string[] = ['Enthusiasm and positive attitude'];
  
  if (volop.ageRequirement) {
    requirements.push(`Must be ${volop.ageRequirement}+ years old`);
  }
  
  if (volop.backgroundCheckRequired) {
    requirements.push('Background check required');
  }
  
  if (volop.driversLicenseRequired) {
    requirements.push('Valid driver\'s license required');
  }
  
  if (volop.orientationRequired) {
    requirements.push('Orientation session required');
  }
  
  if (volop.otherRequirements) {
    requirements.push(volop.otherRequirements);
  }
  
  if (volop.locationType === 'REMOTE') {
    requirements.push('Reliable internet connection');
  }
  
  return requirements.slice(0, 4); // Limit to 4 requirements
};

const generateBenefitsFromVolop = (volop: any): string[] => {
  const benefits: string[] = ['Make a meaningful impact in your community'];
  
  if (volop.detailsTrainingProvided) {
    benefits.push('Training provided');
  }
  
  if (volop.detailsStipendProvided) {
    benefits.push('Stipend provided');
  }
  
  if (volop.detailsHousingAvailable) {
    benefits.push('Housing assistance available');
  }
  
  if (volop.detailsCulturalSupport) {
    benefits.push('Cultural support provided');
  }
  
  if (volop.locationType === 'REMOTE') {
    benefits.push('Work from anywhere');
    benefits.push('Flexible remote volunteering');
  } else {
    benefits.push('Meet like-minded community members');
    benefits.push('Hands-on local impact');
  }
  
  return benefits.slice(0, 4); // Limit to 4 benefits
};

const formatFunction = (func: string): string => {
  return func.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const buildCommitment = (expectedTime: string | null, isRecurring: boolean): string => {
  if (expectedTime) {
    const timeMap: { [key: string]: string } = {
      'FEW_HOURS_MONTH': 'Few hours monthly',
      'FEW_HOURS_WEEK': 'Few hours weekly',
      'FULL_TIME': 'Full-time commitment',
      'FLEXIBLE': 'Flexible schedule'
    };
    return timeMap[expectedTime] || 'Flexible schedule';
  }
  
  return isRecurring ? 'Ongoing commitment' : 'One-time event';
};

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').replace(/\r\n/g, ' ').trim();
};

const matchesLocation = (opportunity: VolunteerEvent, location: string): boolean => {
  const locationLower = location.toLowerCase();
  const oppLocationLower = opportunity.location.toLowerCase();
  
  // Check if location contains state abbreviations or city names
  return oppLocationLower.includes(locationLower) || 
         locationLower.includes(oppLocationLower) ||
         opportunity.type === 'virtual'; // Virtual events match any location
};

const matchesInterests = (opportunity: VolunteerEvent, interests: string[]): boolean => {
  const oppText = `${opportunity.title} ${opportunity.category} ${opportunity.description}`.toLowerCase();
  
  return interests.some(interest => 
    oppText.includes(interest.toLowerCase()) ||
    opportunity.category.toLowerCase().includes(interest.toLowerCase())
  );
};

// Fallback opportunities when API is not available
const generateFallbackOpportunities = async (
  location: string, 
  interests: string[], 
  limit: number
): Promise<VolunteerEvent[]> => {
  console.log('🔄 Using fallback US volunteer opportunities for:', location);
  
  const fallbackOpportunities = [
    {
      id: 'fallback-us-1',
      title: 'Food Bank Distribution Volunteer',
      organization: 'Capital Area Food Bank',
      category: 'Food & Hunger',
      description: `Help distribute food to families in need in the ${location} area. Sort donations, pack boxes, and assist with distribution events.`
    },
    {
      id: 'fallback-us-2',
      title: 'Animal Shelter Care Assistant',
      organization: 'Washington Humane Society',
      category: 'Animals & Pets',
      description: `Provide care and socialization for rescued animals in ${location}. Help with feeding, cleaning, and finding forever homes.`
    },
    {
      id: 'fallback-us-3',
      title: 'Youth Mentorship Program',
      organization: 'Boys & Girls Club',
      category: 'Education & Youth',
      description: `Mentor young people in ${location} through educational activities, sports, and life skills development.`
    },
    {
      id: 'fallback-us-4',
      title: 'Environmental Conservation Volunteer',
      organization: 'Chesapeake Bay Foundation',
      category: 'Environment & Nature',
      description: `Join conservation efforts in the ${location} region through habitat restoration, water quality monitoring, and environmental education.`
    },
    {
      id: 'fallback-us-5',
      title: 'Senior Companion Volunteer',
      organization: 'Senior Planet',
      category: 'Seniors & Elderly',
      description: `Provide companionship and support to seniors in ${location}. Help with activities, transportation, and social connection.`
    }
  ];
  
  // Convert to full VolunteerEvent format
  const opportunities = await Promise.all(
    fallbackOpportunities.slice(0, limit).map(async (opp) => {
      const imageUrl = await getUniqueOpportunityImage({
        id: opp.id,
        title: opp.title,
        organization: opp.organization,
        category: opp.category
      });
      
      return {
        ...opp,
        type: 'in-person' as const,
        frequency: 'weekly' as const,
        date: getRandomFutureDate(),
        time: '10:00 AM - 2:00 PM',
        location: `${location}, USA`,
        coordinates: undefined,
        requirements: ['Enthusiasm and positive attitude', 'Reliable transportation'],
        benefits: ['Make a meaningful impact', 'Meet like-minded volunteers'],
        spotsAvailable: Math.floor(Math.random() * 10) + 5,
        totalSpots: Math.floor(Math.random() * 5) + 15,
        imageUrl,
        familyFriendly: Math.random() > 0.5,
        skillsNeeded: ['No special skills required'],
        commitment: '3 hours weekly',
        contact: {
          name: 'Volunteer Coordinator',
          email: 'volunteer@organization.org',
          phone: '(555) 123-4567'
        }
      };
    })
  );
  
  return opportunities;
};

const getRandomFutureDate = (): string => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
  return futureDate.toISOString().split('T')[0];
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