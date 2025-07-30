import OpenAI from 'openai';
import { VolunteerEvent } from '../data/mockData';
import { getUniqueOpportunityImage } from './imageService';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

let openai: OpenAI | null = null;

// Initialize OpenRouter client
const initializeOpenRouter = () => {
  if (!OPENROUTER_API_KEY) {
    console.warn('OpenRouter API key not found. Using mock data instead.');
    return null;
  }

  if (!openai) {
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: OPENROUTER_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
  
  return openai;
};

// Generate volunteer opportunities using Perplexity
export const generateVolunteerOpportunitiesWithPerplexity = async (
  location: string,
  interests: string[] = [],
  availability: string = '',
  contributionTypes: string[] = []
): Promise<VolunteerEvent[]> => {
  const client = initializeOpenRouter();
  
  if (!client) {
    console.warn('OpenRouter not available, returning empty array');
    return [];
  }

  try {
    console.log('Generating volunteer opportunities with Perplexity...');
    
    // Much simpler prompt that's more likely to work
    const prompt = `Find 12-15 real volunteer opportunities in ${location}. 

User interests: ${interests.join(', ') || 'any cause'}
Availability: ${availability || 'flexible'}
Search radius: within 25 miles of ${location}

Return ONLY a valid JSON array with this exact format:
[
  {
    "title": "Volunteer role title",
    "organization": "Organization name", 
    "description": "What volunteers will do",
    "location": "Address or area",
    "date": "2025-02-15",
    "time": "10:00 AM - 2:00 PM",
    "category": "Community Development",
    "type": "in-person",
    "frequency": "weekly"
  }
]

No other text, just the JSON array.`;
    
    const completion = await client.chat.completions.create({
      model: "perplexity/sonar",
      messages: [
        {
          role: "system",
          content: "You find real volunteer opportunities. Return ONLY valid JSON array, no other text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Perplexity');
    }

    console.log('Perplexity response received, parsing...');
    console.log('Raw response:', response.substring(0, 200) + '...');
    
    // Parse the JSON response
    const opportunities = parsePerplexityResponse(response, location);
    console.log(`Generated ${opportunities.length} opportunities via Perplexity`);
    
    return opportunities;
    
  } catch (error) {
    console.error('Perplexity search error:', error);
    console.log('Falling back to sample opportunities...');
    // Return some quick sample opportunities instead of failing
    return generateQuickSamples(location, interests);
  }
};

// Quick fallback samples when AI fails
const generateQuickSamples = async (location: string, interests: string[]): Promise<VolunteerEvent[]> => {
  const samples = [
    {
      id: 'quick-1',
      title: 'Community Food Bank Volunteer',
      organization: 'Local Food Network',
      category: 'Food & Hunger',
      description: `Help sort and distribute food to families in need in ${location}.`
    },
    {
      id: 'quick-2', 
      title: 'Animal Shelter Assistant',
      organization: 'Animal Rescue Center',
      category: 'Animals & Pets',
      description: `Care for rescued animals and help them find loving homes in ${location}.`
    },
    {
      id: 'quick-3',
      title: 'Youth Mentoring Program',
      organization: 'Community Youth Center', 
      category: 'Education & Youth',
      description: `Mentor young people and help them develop skills in ${location}.`
    }
  ];

  return Promise.all(samples.map(async sample => {
    // Get unique image for this opportunity
    const imageUrl = await getUniqueOpportunityImage({
      id: sample.id,
      title: sample.title,
      organization: sample.organization,
      category: sample.category
    });
    
    return {
      ...sample,
      type: 'in-person' as const,
      frequency: 'weekly' as const,
      date: getRandomFutureDate(),
      time: '10:00 AM - 2:00 PM',
      location: location,
      coordinates: undefined,
      requirements: ['Enthusiasm and positive attitude'],
      benefits: ['Make a meaningful impact', 'Meet like-minded people'],
      spotsAvailable: Math.floor(Math.random() * 10) + 5,
      totalSpots: Math.floor(Math.random() * 5) + 15,
      imageUrl,
      familyFriendly: true,
      skillsNeeded: ['No special skills required'],
      commitment: '3 hours weekly',
      contact: {
        name: 'Volunteer Coordinator',
        email: 'volunteer@organization.org',
        phone: '(555) 123-4567'
      }
    };
  }));
};

// Much simpler parsing - just find the JSON array
const parsePerplexityResponse = async (response: string, location: string): Promise<VolunteerEvent[]> => {
  try {
    console.log('Parsing response...');
    
    let jsonStr = response.trim();
    
    // Remove common wrapper text
    jsonStr = jsonStr.replace(/^.*?(\[)/s, '$1');
    jsonStr = jsonStr.replace(/(\]).*?$/s, '$1');
    
    // Remove markdown
    jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    console.log('Cleaned JSON:', jsonStr.substring(0, 200) + '...');
    
    const rawOpportunities = JSON.parse(jsonStr);
    
    if (!Array.isArray(rawOpportunities)) {
      throw new Error('Response is not an array');
    }
    
    console.log(`Parsed ${rawOpportunities.length} opportunities`);
    
    // Convert to our format
    const opportunities: VolunteerEvent[] = await Promise.all(
      rawOpportunities.map(async (raw: any, index: number) => {
        const opportunityId = `ai-${Date.now()}-${index}`;
        const category = String(raw.category || 'Community Development');
        const title = String(raw.title || 'Volunteer Opportunity');
        const organization = String(raw.organization || 'Local Organization');
        
        // Get unique image for this opportunity
        const imageUrl = await getUniqueOpportunityImage({
          id: opportunityId,
          title,
          organization,
          category
        });
        
        return {
          id: opportunityId,
          title,
          organization,
          category,
          type: (raw.type === 'virtual' || raw.type === 'hybrid') ? raw.type : 'in-person',
          frequency: (raw.frequency === 'one-time' || raw.frequency === 'monthly' || raw.frequency === 'ongoing') ? raw.frequency : 'weekly',
          date: raw.date || getRandomFutureDate(),
          time: String(raw.time || '10:00 AM - 2:00 PM'),
          location: String(raw.location || location),
          coordinates: undefined,
          description: String(raw.description || 'Join us for this meaningful volunteer opportunity.'),
          requirements: ['Enthusiasm and positive attitude'],
          benefits: ['Make a meaningful impact', 'Meet like-minded people'],
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
  } catch (error) {
    console.error('Error parsing Perplexity response:', error);
    return [];
  }
};

// Create a detailed prompt for finding volunteer opportunities
const createVolunteerSearchPrompt = (
  location: string,
  interests: string[]
) => {
  return `Find volunteer opportunities in ${location} for interests: ${interests.join(', ')}`;
};

// Helper functions
const getRandomFutureDate = (): string => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
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
    'Housing & Homelessness': 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg',
    'Technology & Digital': 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
  };

  return imageMap[category] || 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg';
};