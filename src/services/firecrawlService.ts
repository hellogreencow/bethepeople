import FirecrawlApp from '@mendable/firecrawl-js';
import { VolunteerEvent } from '../data/mockData';

const FIRECRAWL_API_KEY = import.meta.env.VITE_FIRECRAWL_API_KEY;

let firecrawlApp: FirecrawlApp | null = null;

// Initialize Firecrawl
const initializeFirecrawl = () => {
  if (!FIRECRAWL_API_KEY) {
    console.warn('Firecrawl API key not found. Using mock data instead.');
    return null;
  }

  if (!firecrawlApp) {
    firecrawlApp = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
  }
  
  return firecrawlApp;
};

// Search for volunteer opportunities using Firecrawl
export const searchVolunteerOpportunities = async (
  location: string,
  interests: string[] = []
): Promise<VolunteerEvent[]> => {
  const app = initializeFirecrawl();
  
  if (!app) {
    console.warn('Firecrawl not available, returning mock data');
    return [];
  }

  try {
    console.log('Searching for volunteer opportunities with Firecrawl...');
    
    // Define search queries based on location and interests
    const searchQueries = generateSearchQueries(location, interests);
    const allOpportunities: VolunteerEvent[] = [];

    for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries to avoid rate limits
      console.log(`Searching: ${query.url}`);
      
      try {
        const crawlResult = await app.scrapeUrl(query.url, {
          formats: ['markdown'],
          onlyMainContent: true,
          timeout: 10000
        });

        if (crawlResult.success && crawlResult.data?.markdown) {
          const opportunities = parseVolunteerOpportunities(
            crawlResult.data.markdown,
            query.category,
            location
          );
          allOpportunities.push(...opportunities);
        }
      } catch (error) {
        console.warn(`Failed to crawl ${query.url}:`, error);
      }

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Found ${allOpportunities.length} opportunities via Firecrawl`);
    return allOpportunities.slice(0, 10); // Limit results
    
  } catch (error) {
    console.error('Firecrawl search error:', error);
    return [];
  }
};

// Generate search URLs for volunteer opportunities
const generateSearchQueries = (location: string, interests: string[]) => {
  const baseQueries = [
    {
      url: `https://www.volunteermatch.org/search?l=${encodeURIComponent(location)}`,
      category: 'Community Development'
    },
    {
      url: `https://www.justserve.org/search?location=${encodeURIComponent(location)}`,
      category: 'Community Development'
    },
    {
      url: `https://www.unitedway.org/find-your-united-way?location=${encodeURIComponent(location)}`,
      category: 'Community Development'
    }
  ];

  // Add interest-specific searches
  const interestQueries = interests.slice(0, 2).map(interest => ({
    url: `https://www.volunteermatch.org/search?l=${encodeURIComponent(location)}&k=${encodeURIComponent(interest)}`,
    category: interest
  }));

  return [...baseQueries, ...interestQueries];
};

// Parse volunteer opportunities from crawled content
const parseVolunteerOpportunities = (
  markdown: string,
  category: string,
  location: string
): VolunteerEvent[] => {
  const opportunities: VolunteerEvent[] = [];
  
  try {
    // Look for common patterns in volunteer websites
    const lines = markdown.split('\n');
    let currentOpportunity: Partial<VolunteerEvent> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for opportunity titles (usually in headers or bold)
      if (line.match(/^#+\s+(.+)/) || line.match(/\*\*(.+)\*\*/)) {
        if (currentOpportunity && currentOpportunity.title) {
          // Save previous opportunity
          const opportunity = completeOpportunity(currentOpportunity, category, location);
          if (opportunity) opportunities.push(opportunity);
        }
        
        // Start new opportunity
        const title = line.replace(/^#+\s+/, '').replace(/\*\*(.+)\*\*/, '$1').trim();
        if (isVolunteerTitle(title)) {
          currentOpportunity = { title };
        }
      }
      
      // Look for organization names
      if (currentOpportunity && line.includes('Organization:') || line.includes('Nonprofit:')) {
        currentOpportunity.organization = extractAfterColon(line);
      }
      
      // Look for descriptions
      if (currentOpportunity && line.length > 50 && !line.includes(':') && !line.startsWith('#')) {
        if (!currentOpportunity.description) {
          currentOpportunity.description = line;
        }
      }
      
      // Look for dates
      if (currentOpportunity && line.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/)) {
        const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          currentOpportunity.date = formatDate(dateMatch[1]);
        }
      }
    }
    
    // Don't forget the last opportunity
    if (currentOpportunity && currentOpportunity.title) {
      const opportunity = completeOpportunity(currentOpportunity, category, location);
      if (opportunity) opportunities.push(opportunity);
    }
    
  } catch (error) {
    console.error('Error parsing opportunities:', error);
  }
  
  return opportunities.slice(0, 5); // Limit per source
};

// Check if a title looks like a volunteer opportunity
const isVolunteerTitle = (title: string): boolean => {
  const volunteerKeywords = [
    'volunteer', 'help', 'assist', 'support', 'serve', 'give back',
    'community', 'nonprofit', 'charity', 'mentor', 'tutor', 'clean',
    'food bank', 'shelter', 'animal', 'environment', 'education'
  ];
  
  const lowerTitle = title.toLowerCase();
  return volunteerKeywords.some(keyword => lowerTitle.includes(keyword)) &&
         title.length > 10 && title.length < 100;
};

// Extract text after colon
const extractAfterColon = (line: string): string => {
  const parts = line.split(':');
  return parts.length > 1 ? parts[1].trim() : '';
};

// Format date to YYYY-MM-DD
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    // Return a future date if parsing fails
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
    return futureDate.toISOString().split('T')[0];
  }
};

// Complete opportunity with default values
const completeOpportunity = (
  partial: Partial<VolunteerEvent>,
  category: string,
  location: string
): VolunteerEvent | null => {
  if (!partial.title) return null;
  
  const id = `firecrawl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    title: partial.title,
    organization: partial.organization || 'Local Organization',
    category: category,
    type: 'in-person' as const,
    frequency: getRandomFrequency(),
    date: partial.date || getRandomFutureDate(),
    time: getRandomTime(),
    location: location,
    coordinates: undefined, // Will be geocoded later if needed
    description: partial.description || `Join us for this meaningful volunteer opportunity in ${location}. Make a difference in your community while connecting with like-minded people.`,
    requirements: getRandomRequirements(),
    benefits: getRandomBenefits(),
    spotsAvailable: Math.floor(Math.random() * 15) + 5,
    totalSpots: Math.floor(Math.random() * 10) + 20,
    imageUrl: getImageForCategory(category),
    familyFriendly: Math.random() > 0.5,
    skillsNeeded: getRandomSkills(category),
    commitment: getRandomCommitment(),
    contact: {
      name: 'Volunteer Coordinator',
      email: 'volunteer@organization.org',
      phone: '(555) 123-4567'
    }
  };
};

// Helper functions for generating random data
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
    'Flexible hours'
  ];
  return times[Math.floor(Math.random() * times.length)];
};

const getRandomFutureDate = (): string => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
  return futureDate.toISOString().split('T')[0];
};

const getRandomRequirements = (): string[] => {
  const allRequirements = [
    'Enthusiasm and positive attitude',
    'Ability to work in teams',
    'Reliable transportation',
    'Background check may be required',
    'Comfortable with physical activity',
    'Good communication skills'
  ];
  
  const count = Math.floor(Math.random() * 3) + 2;
  return allRequirements.slice(0, count);
};

const getRandomBenefits = (): string[] => {
  const allBenefits = [
    'Make a meaningful impact',
    'Meet like-minded people',
    'Develop new skills',
    'Flexible scheduling',
    'Community recognition',
    'Personal fulfillment'
  ];
  
  const count = Math.floor(Math.random() * 3) + 2;
  return allBenefits.slice(0, count);
};

const getRandomSkills = (category: string): string[] => {
  const skillMap: { [key: string]: string[] } = {
    'Education & Youth': ['Teaching', 'Patience', 'Communication'],
    'Environment & Nature': ['Physical activity', 'Outdoor work'],
    'Animals & Pets': ['Animal handling', 'Compassion'],
    'Food & Hunger': ['Food handling', 'Organization'],
    'Community Development': ['Communication', 'Organization']
  };
  
  return skillMap[category] || ['No special skills required'];
};

const getRandomCommitment = (): string => {
  const commitments = [
    '2-3 hours weekly',
    '4 hours monthly',
    'One-time event',
    'Flexible schedule',
    '1-2 hours weekly'
  ];
  return commitments[Math.floor(Math.random() * commitments.length)];
};

const getImageForCategory = (category: string): string => {
  const imageMap: { [key: string]: string } = {
    'Animals & Pets': 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
    'Food & Hunger': 'https://images.pexels.com/photos/6995247/pexels-photo-6995247.jpeg',
    'Health & Wellness': 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg',
    'Education & Youth': 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
    'Community Development': 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
    'Environment & Nature': 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
    'Arts & Culture': 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg'
  };

  return imageMap[category] || 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg';
};