import { initializeGoogleMaps, searchVolunteerOrganizations, getOrganizationDetails, calculateDistance } from './locationService';
import { VolunteerEvent } from '../data/mockData';
import { getUniqueOpportunityImage } from './imageService';

// Generate volunteer opportunities from real organizations
export const generateVolunteerOpportunities = async (
  userLocation: { lat: number; lng: number },
  userInterests: string[] = [],
  radiusMiles: number = 25
): Promise<VolunteerEvent[]> => {
  console.log('Starting volunteer opportunity generation for location:', userLocation);
  
  try {
    await initializeGoogleMaps();
    console.log('Google Maps initialized successfully');
    
    const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters
    const organizations = await searchVolunteerOrganizations(userLocation, radiusMeters);
    console.log('Found organizations:', organizations.length);
    
    const opportunities: VolunteerEvent[] = [];

    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i];
      console.log(`Processing organization ${i + 1}/${organizations.length}:`, org.name);
      
      if (!org.place_id || !org.geometry?.location) continue;

      const details = await getOrganizationDetails(org.place_id);
      if (!details) {
        console.warn('Could not get details for:', org.name);
        continue;
      }

      // Generate 1-2 opportunities per organization
      const orgOpportunities = await generateOpportunitiesForOrganization(details, userLocation, userInterests);
      console.log(`Generated ${orgOpportunities.length} opportunities for ${org.name}`);
      opportunities.push(...orgOpportunities);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('Total opportunities generated:', opportunities.length);
    return opportunities.slice(0, 20); // Limit to 20 opportunities
  } catch (error) {
    console.error('Error generating volunteer opportunities:', error);
    // Return some fallback opportunities if the API fails
    return generateFallbackOpportunities(userLocation);
  }
};

// Fallback opportunities when API fails
const generateFallbackOpportunities = (userLocation: { lat: number; lng: number }): VolunteerEvent[] => {
  console.log('Generating fallback opportunities');
  
  return [
    {
      id: 'fallback-1',
      title: 'Local Food Bank Volunteer',
      organization: 'Community Food Network',
      category: 'Food & Hunger',
      type: 'in-person' as const,
      frequency: 'weekly' as const,
      date: getRandomFutureDate(),
      time: '10:00 AM - 2:00 PM',
      location: 'Near your location',
      coordinates: userLocation,
      description: 'Help sort and distribute food to families in need in your local community.',
      requirements: ['Ability to lift 25 lbs', 'Team player attitude'],
      benefits: ['Fight hunger in your community', 'Meet like-minded volunteers'],
      spotsAvailable: 8,
      totalSpots: 15,
      imageUrl: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg',
      familyFriendly: true,
      skillsNeeded: ['Organization skills'],
      commitment: '4 hours weekly',
      contact: {
        name: 'Volunteer Coordinator',
        email: 'volunteer@communityfood.org',
        phone: '(555) 123-4567'
      }
    },
    {
      id: 'fallback-2',
      title: 'Animal Shelter Assistant',
      organization: 'Local Animal Rescue',
      category: 'Animals & Pets',
      type: 'in-person' as const,
      frequency: 'weekly' as const,
      date: getRandomFutureDate(),
      time: '9:00 AM - 12:00 PM',
      location: 'Near your location',
      coordinates: userLocation,
      description: 'Help care for rescued animals by assisting with feeding, cleaning, and socialization.',
      requirements: ['Comfortable with animals', 'Physical activity'],
      benefits: ['Work with adorable animals', 'Help animals find homes'],
      spotsAvailable: 6,
      totalSpots: 10,
      imageUrl: 'https://images.pexels.com/photos/4681107/pexels-photo-4681107.jpeg',
      familyFriendly: true,
      skillsNeeded: ['Animal handling'],
      commitment: '3 hours weekly',
      contact: {
        name: 'Animal Care Coordinator',
        email: 'volunteer@animalrescue.org',
        phone: '(555) 234-5678'
      }
    }
  ];
};

const generateOpportunitiesForOrganization = async (
  org: google.maps.places.PlaceResult,
  userLocation: { lat: number; lng: number },
  userInterests: string[]
): Promise<VolunteerEvent[]> => {
  if (!org.geometry?.location || !org.name) return [];

  const orgLocation = {
    lat: org.geometry.location.lat(),
    lng: org.geometry.location.lng()
  };

  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    orgLocation.lat,
    orgLocation.lng
  );

  // Skip if too far (over 50 miles)
  if (distance > 50) return [];

  const opportunities: VolunteerEvent[] = [];
  const orgTypes = org.types || [];
  
  // Generate opportunities based on organization type
  const opportunityTemplates = getOpportunityTemplates(orgTypes, org.name);
  
  for (let i = 0; i < Math.min(2, opportunityTemplates.length); i++) {
    const template = opportunityTemplates[i];
    
    const opportunityId = `real-${org.place_id}-${i}`;
    
    // Get unique image for this opportunity
    const imageUrl = await getUniqueOpportunityImage({
      id: opportunityId,
      title: template.title,
      organization: org.name,
      category: template.category
    }, org.website);
    
    const opportunity: VolunteerEvent = {
      id: opportunityId,
      title: template.title,
      organization: org.name,
      category: template.category,
      type: template.type,
      frequency: template.frequency,
      date: getRandomFutureDate(),
      time: template.time,
      location: org.formatted_address || 'Location available upon signup',
      coordinates: orgLocation,
      description: template.description.replace('{org}', org.name),
      requirements: template.requirements,
      benefits: template.benefits,
      spotsAvailable: Math.floor(Math.random() * 15) + 5,
      totalSpots: Math.floor(Math.random() * 10) + 20,
      imageUrl,
      familyFriendly: template.familyFriendly,
      skillsNeeded: template.skillsNeeded,
      commitment: template.commitment,
      contact: {
        name: 'Volunteer Coordinator',
        email: 'volunteer@' + (org.name.toLowerCase().replace(/\s+/g, '') + '.org'),
        phone: org.formatted_phone_number || '(555) 123-4567'
      }
    };

    opportunities.push(opportunity);
  }

  return opportunities;
};

const getOpportunityTemplates = (orgTypes: string[], orgName: string) => {
  const templates = [];

  // Animal-related organizations
  if (orgTypes.some(type => type.includes('veterinary') || orgName.toLowerCase().includes('animal') || orgName.toLowerCase().includes('pet'))) {
    templates.push({
      title: 'Animal Care Volunteer',
      category: 'Animals & Pets',
      type: 'in-person' as const,
      frequency: 'weekly' as const,
      time: '9:00 AM - 12:00 PM',
      description: 'Help care for animals at {org} by assisting with feeding, cleaning, and providing companionship to animals in need.',
      requirements: ['Comfortable working with animals', 'Physical ability to clean and lift', 'Reliable weekly commitment'],
      benefits: ['Work with adorable animals', 'Learn animal care skills', 'Make a difference in animal welfare'],
      familyFriendly: true,
      skillsNeeded: ['Animal handling', 'Physical activity'],
      commitment: '3 hours weekly'
    });
  }

  // Food-related organizations
  if (orgTypes.some(type => type.includes('food') || type.includes('meal')) || orgName.toLowerCase().includes('food') || orgName.toLowerCase().includes('kitchen')) {
    templates.push({
      title: 'Food Service Volunteer',
      category: 'Food & Hunger',
      type: 'in-person' as const,
      frequency: 'weekly' as const,
      time: '11:00 AM - 2:00 PM',
      description: 'Help prepare and serve meals to community members in need at {org}. Assist with food preparation, serving, and cleanup.',
      requirements: ['Food safety awareness', 'Ability to stand for extended periods', 'Team player attitude'],
      benefits: ['Directly help fight hunger', 'Meet community members', 'Learn food service skills'],
      familyFriendly: false,
      skillsNeeded: ['Food handling', 'Customer service'],
      commitment: '3 hours weekly'
    });
  }

  // Healthcare organizations
  if (orgTypes.some(type => type.includes('hospital') || type.includes('health'))) {
    templates.push({
      title: 'Patient Support Volunteer',
      category: 'Health & Wellness',
      type: 'in-person' as const,
      frequency: 'weekly' as const,
      time: '2:00 PM - 5:00 PM',
      description: 'Provide comfort and support to patients and families at {org}. Help with wayfinding, reading, and companionship.',
      requirements: ['Background check required', 'Excellent communication skills', 'Compassionate nature'],
      benefits: ['Make a difference in healthcare', 'Develop interpersonal skills', 'Flexible scheduling'],
      familyFriendly: false,
      skillsNeeded: ['Communication', 'Empathy'],
      commitment: '3 hours weekly'
    });
  }

  // Educational organizations
  if (orgTypes.some(type => type.includes('school') || type.includes('library')) || orgName.toLowerCase().includes('education') || orgName.toLowerCase().includes('library')) {
    templates.push({
      title: 'Educational Support Volunteer',
      category: 'Education & Youth',
      type: 'in-person' as const,
      frequency: 'weekly' as const,
      time: '3:30 PM - 5:30 PM',
      description: 'Support educational programs at {org} by helping with tutoring, reading programs, or educational activities.',
      requirements: ['Background check may be required', 'Patience with learners', 'Reliable commitment'],
      benefits: ['Impact education in your community', 'Develop teaching skills', 'Work with motivated learners'],
      familyFriendly: false,
      skillsNeeded: ['Teaching ability', 'Patience'],
      commitment: '2 hours weekly'
    });
  }

  // Community centers and general nonprofits
  if (orgTypes.some(type => type.includes('establishment')) || templates.length === 0) {
    templates.push({
      title: 'Community Support Volunteer',
      category: 'Community Development',
      type: 'in-person' as const,
      frequency: 'monthly' as const,
      time: '10:00 AM - 2:00 PM',
      description: 'Support community programs and events at {org}. Help with event setup, registration, and community outreach activities.',
      requirements: ['Friendly and outgoing personality', 'Ability to work in teams', 'Flexible schedule'],
      benefits: ['Build community connections', 'Develop event planning skills', 'Make a local impact'],
      familyFriendly: true,
      skillsNeeded: ['Organization', 'Communication'],
      commitment: '4 hours monthly'
    });

    templates.push({
      title: 'Administrative Support Volunteer',
      category: 'Community Development',
      type: 'hybrid' as const,
      frequency: 'weekly' as const,
      time: 'Flexible hours',
      description: 'Provide administrative support to {org} including data entry, filing, phone support, and general office assistance.',
      requirements: ['Basic computer skills', 'Attention to detail', 'Professional communication'],
      benefits: ['Flexible scheduling', 'Learn nonprofit operations', 'Professional skill development'],
      familyFriendly: false,
      skillsNeeded: ['Computer skills', 'Organization'],
      commitment: '2-4 hours weekly'
    });
  }

  return templates;
};

const getRandomFutureDate = (): string => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1); // 1-30 days from now
  return futureDate.toISOString().split('T')[0];
};

const getImageForCategory = (category: string): string => {
  const imageMap: { [key: string]: string } = {
    'Animals & Pets': 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
    'Food & Hunger': 'https://images.pexels.com/photos/6995247/pexels-photo-6995247.jpeg',
    'Health & Wellness': 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg',
    'Education & Youth': 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
    'Community Development': 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
    'Environment & Nature': 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
    'Arts & Culture': 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    'Seniors & Elderly': 'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg',
    'Technology & Digital': 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
    'Housing & Homelessness': 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg'
  };

  return imageMap[category] || 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg';
};