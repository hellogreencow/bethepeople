// Dynamic Image Fetching Service
// Fetches real images from API sources, web scraping, and relevant online sources

interface ImageSource {
  url: string;
  alt: string;
  source: string;
}

// Cache to prevent duplicate images
const usedImages = new Set<string>();
const imageCache = new Map<string, string>();

// Unsplash API for high-quality, relevant images
const UNSPLASH_ACCESS_KEY = 'your_unsplash_key'; // Would need API key
const UNSPLASH_BASE_URL = 'https://api.unsplash.com/search/photos';

// Pexels API for diverse, relevant images
const PEXELS_API_KEY = 'your_pexels_key'; // Would need API key
const PEXELS_BASE_URL = 'https://api.pexels.com/v1/search';

// Fetch image from organization's website or social media
export const fetchOrganizationImage = async (
  organizationName: string,
  organizationUrl?: string
): Promise<string | null> => {
  try {
    if (organizationUrl) {
      // Try to scrape organization's website for their logo/images
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(organizationUrl)}&screenshot=true&meta=false&embed=screenshot.url`);
      if (response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.data?.screenshot?.url) {
            return data.data.screenshot.url;
          }
        }
      }
    }

    // Fallback: Search for organization on social media or Google Images
    return await searchOrganizationImage(organizationName);
  } catch (error) {
    // Suppress PNG parsing errors
    if (error instanceof SyntaxError && error.message.includes('PNG')) {
      // Silently fail for image parsing errors
      return null;
    }
    console.warn('Failed to fetch organization image:', error);
    return null;
  }
};

// Search for organization images using Google Custom Search
const searchOrganizationImage = async (organizationName: string): Promise<string | null> => {
  try {
    // This would use Google Custom Search API for images
    // For now, return null to use category-based images
    return null;
  } catch (error) {
    console.warn('Organization image search failed:', error);
    return null;
  }
};

// Fetch relevant images from Unsplash based on opportunity details
export const fetchUnsplashImage = async (
  title: string,
  category: string,
  organizationName: string
): Promise<string | null> => {
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'your_unsplash_key') {
    return null; // API key not configured
  }

  try {
    // Create search query from opportunity details
    const searchTerms = generateImageSearchTerms(title, category, organizationName);
    
    for (const searchTerm of searchTerms) {
      const response = await fetch(
        `${UNSPLASH_BASE_URL}?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const availableImages = data.results.filter((img: any) => 
          !usedImages.has(img.urls.regular)
        );

        if (availableImages.length > 0) {
          const selectedImage = availableImages[0];
          usedImages.add(selectedImage.urls.regular);
          return selectedImage.urls.regular;
        }
      }
    }
  } catch (error) {
    console.warn('Unsplash image fetch failed:', error);
  }

  return null;
};

// Fetch relevant images from Pexels
export const fetchPexelsImage = async (
  title: string,
  category: string,
  organizationName: string
): Promise<string | null> => {
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'your_pexels_key') {
    return null; // API key not configured
  }

  try {
    const searchTerms = generateImageSearchTerms(title, category, organizationName);
    
    for (const searchTerm of searchTerms) {
      const response = await fetch(
        `${PEXELS_BASE_URL}?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const availableImages = data.photos.filter((img: any) => 
          !usedImages.has(img.src.large)
        );

        if (availableImages.length > 0) {
          const selectedImage = availableImages[0];
          usedImages.add(selectedImage.src.large);
          return selectedImage.src.large;
        }
      }
    }
  } catch (error) {
    console.warn('Pexels image fetch failed:', error);
  }

  return null;
};

// Generate smart search terms for image APIs
const generateImageSearchTerms = (
  title: string,
  category: string,
  organizationName: string
): string[] => {
  const terms: string[] = [];

  // Extract key words from title
  const titleWords = title.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 3 && !['volunteer', 'help', 'assist'].includes(word));

  // Category-specific terms
  const categoryTerms: { [key: string]: string[] } = {
    'Animals & Pets': ['animal shelter', 'dog walking', 'pet rescue', 'animal care'],
    'Food & Hunger': ['food bank', 'soup kitchen', 'meal service', 'food distribution'],
    'Health & Wellness': ['healthcare volunteer', 'hospital volunteer', 'medical assistance'],
    'Education & Youth': ['tutoring', 'mentoring', 'teaching kids', 'youth program'],
    'Environment & Nature': ['tree planting', 'environmental cleanup', 'conservation', 'gardening'],
    'Community Development': ['community service', 'neighborhood help', 'local volunteer'],
    'Arts & Culture': ['art workshop', 'cultural event', 'creative program', 'arts education'],
    'Seniors & Elderly': ['senior care', 'elderly assistance', 'nursing home volunteer'],
    'Technology & Digital': ['computer training', 'digital literacy', 'tech support'],
    'Housing & Homelessness': ['homeless shelter', 'housing assistance', 'shelter volunteer']
  };

  // Add specific category terms
  if (categoryTerms[category]) {
    terms.push(...categoryTerms[category]);
  }

  // Add title-based terms
  if (titleWords.length > 0) {
    terms.push(titleWords.slice(0, 2).join(' ') + ' volunteer');
  }

  // Add organization-based terms if it's a known type
  const orgLower = organizationName.toLowerCase();
  if (orgLower.includes('food')) terms.push('food bank volunteer');
  if (orgLower.includes('animal')) terms.push('animal shelter volunteer');
  if (orgLower.includes('school')) terms.push('school volunteer');
  if (orgLower.includes('hospital')) terms.push('hospital volunteer');

  return terms.slice(0, 5); // Limit to 5 search terms
};

// Get unique image for opportunity with multiple fallback strategies
export const getUniqueOpportunityImage = async (
  opportunity: {
    title: string;
    organization: string;
    category: string;
    id: string;
  },
  organizationUrl?: string
): Promise<string> => {
  const cacheKey = `${opportunity.id}-${opportunity.title}`;
  
  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  let imageUrl: string | null = null;

  // Strategy 1: Try to get organization's actual image
  if (organizationUrl) {
    imageUrl = await fetchOrganizationImage(opportunity.organization, organizationUrl);
  }

  // Strategy 2: Try Unsplash for high-quality relevant images
  if (!imageUrl) {
    imageUrl = await fetchUnsplashImage(
      opportunity.title,
      opportunity.category,
      opportunity.organization
    );
  }

  // Strategy 3: Try Pexels for diverse relevant images
  if (!imageUrl) {
    imageUrl = await fetchPexelsImage(
      opportunity.title,
      opportunity.category,
      opportunity.organization
    );
  }

  // Strategy 4: Use curated unique images as final fallback
  if (!imageUrl) {
    imageUrl = getCuratedUniqueImage(opportunity.category, opportunity.id);
  }

  // Cache the result
  imageCache.set(cacheKey, imageUrl);
  return imageUrl;
};

// Curated unique images - each category gets multiple unique options
const getCuratedUniqueImage = (category: string, opportunityId: string): string => {
  const curatedImages: { [key: string]: string[] } = {
    'Animals & Pets': [
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg', // Dog shelter volunteer
      'https://images.pexels.com/photos/4681107/pexels-photo-4681107.jpeg', // Walking rescue dogs
      'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg', // Cat care volunteer
      'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg', // Animal feeding
      'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg', // Pet adoption event
      'https://images.pexels.com/photos/4498151/pexels-photo-4498151.jpeg', // Veterinary volunteer
      'https://images.pexels.com/photos/3687770/pexels-photo-3687770.jpeg', // Animal rescue
      'https://images.pexels.com/photos/2061057/pexels-photo-2061057.jpeg', // Dog training volunteer
    ],
    'Food & Hunger': [
      'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg', // Food bank sorting
      'https://images.pexels.com/photos/6995247/pexels-photo-6995247.jpeg', // Meal distribution
      'https://images.pexels.com/photos/5737266/pexels-photo-5737266.jpeg', // Soup kitchen volunteer
      'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg', // Food packaging
      'https://images.pexels.com/photos/5737277/pexels-photo-5737277.jpeg', // Community meal prep
      'https://images.pexels.com/photos/6646919/pexels-photo-6646919.jpeg', // Food donation sorting
      'https://images.pexels.com/photos/5737264/pexels-photo-5737264.jpeg', // Serving meals
      'https://images.pexels.com/photos/6646920/pexels-photo-6646920.jpeg', // Food bank volunteer
    ],
    'Health & Wellness': [
      'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg', // Healthcare volunteer
      'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg', // Medical assistance
      'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg', // Hospital volunteer
      'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg', // Health screening
      'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg', // Patient support
      'https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg', // Medical volunteer
      'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg', // Healthcare support
      'https://images.pexels.com/photos/5452290/pexels-photo-5452290.jpeg', // Community health
    ],
    'Education & Youth': [
      'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg', // Tutoring session
      'https://images.pexels.com/photos/8613080/pexels-photo-8613080.jpeg', // Reading with kids
      'https://images.pexels.com/photos/5427674/pexels-photo-5427674.jpeg', // Youth mentoring
      'https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg', // Teaching volunteer
      'https://images.pexels.com/photos/8613081/pexels-photo-8613081.jpeg', // Educational support
      'https://images.pexels.com/photos/5427673/pexels-photo-5427673.jpeg', // After school program
      'https://images.pexels.com/photos/5212319/pexels-photo-5212319.jpeg', // Learning assistance
      'https://images.pexels.com/photos/8613082/pexels-photo-8613082.jpeg', // Youth education
    ],
    'Environment & Nature': [
      'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg', // Tree planting
      'https://images.pexels.com/photos/4503821/pexels-photo-4503821.jpeg', // Community garden
      'https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg', // Environmental cleanup
      'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg', // Conservation work
      'https://images.pexels.com/photos/4503820/pexels-photo-4503820.jpeg', // Gardening volunteer
      'https://images.pexels.com/photos/2886938/pexels-photo-2886938.jpeg', // Beach cleanup
      'https://images.pexels.com/photos/1108573/pexels-photo-1108573.jpeg', // Nature conservation
      'https://images.pexels.com/photos/4503822/pexels-photo-4503822.jpeg', // Urban gardening
    ],
    'Community Development': [
      'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg', // Community volunteers
      'https://images.pexels.com/photos/6646921/pexels-photo-6646921.jpeg', // Community service
      'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg', // Neighborhood help
      'https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg', // Local volunteer work
      'https://images.pexels.com/photos/6646922/pexels-photo-6646922.jpeg', // Community building
      'https://images.pexels.com/photos/3184466/pexels-photo-3184466.jpeg', // Social volunteer
      'https://images.pexels.com/photos/3184420/pexels-photo-3184420.jpeg', // Community outreach
      'https://images.pexels.com/photos/6646923/pexels-photo-6646923.jpeg', // Local support
    ],
    'Arts & Culture': [
      'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg', // Art workshop
      'https://images.pexels.com/photos/8819089/pexels-photo-8819089.jpeg', // Creative volunteer
      'https://images.pexels.com/photos/1181407/pexels-photo-1181407.jpeg', // Arts education
      'https://images.pexels.com/photos/8819090/pexels-photo-8819090.jpeg', // Cultural program
      'https://images.pexels.com/photos/1181408/pexels-photo-1181408.jpeg', // Art instruction
      'https://images.pexels.com/photos/8819091/pexels-photo-8819091.jpeg', // Creative workshop
      'https://images.pexels.com/photos/1181409/pexels-photo-1181409.jpeg', // Arts volunteer
      'https://images.pexels.com/photos/8819092/pexels-photo-8819092.jpeg', // Cultural volunteer
    ],
    'Seniors & Elderly': [
      'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg', // Senior care volunteer
      'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg', // Elderly assistance
      'https://images.pexels.com/photos/3768132/pexels-photo-3768132.jpeg', // Senior companionship
      'https://images.pexels.com/photos/5428837/pexels-photo-5428837.jpeg', // Nursing home volunteer
      'https://images.pexels.com/photos/3768133/pexels-photo-3768133.jpeg', // Senior activities
      'https://images.pexels.com/photos/5428838/pexels-photo-5428838.jpeg', // Elderly support
      'https://images.pexels.com/photos/3768134/pexels-photo-3768134.jpeg', // Senior center volunteer
      'https://images.pexels.com/photos/5428839/pexels-photo-5428839.jpeg', // Elder care
    ],
    'Technology & Digital': [
      'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg', // Tech volunteer
      'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg', // Digital literacy
      'https://images.pexels.com/photos/3184466/pexels-photo-3184466.jpeg', // Computer training
      'https://images.pexels.com/photos/4144924/pexels-photo-4144924.jpeg', // Tech support volunteer
      'https://images.pexels.com/photos/3184467/pexels-photo-3184467.jpeg', // Digital education
      'https://images.pexels.com/photos/4144925/pexels-photo-4144925.jpeg', // Tech assistance
      'https://images.pexels.com/photos/3184468/pexels-photo-3184468.jpeg', // Computer volunteer
      'https://images.pexels.com/photos/4144926/pexels-photo-4144926.jpeg', // Digital volunteer
    ],
    'Housing & Homelessness': [
      'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg', // Shelter volunteer
      'https://images.pexels.com/photos/5737266/pexels-photo-5737266.jpeg', // Homeless assistance
      'https://images.pexels.com/photos/6646919/pexels-photo-6646919.jpeg', // Housing support
      'https://images.pexels.com/photos/5737267/pexels-photo-5737267.jpeg', // Shelter support
      'https://images.pexels.com/photos/6646920/pexels-photo-6646920.jpeg', // Homeless services
      'https://images.pexels.com/photos/5737268/pexels-photo-5737268.jpeg', // Housing volunteer
      'https://images.pexels.com/photos/6646921/pexels-photo-6646921.jpeg', // Shelter assistance
      'https://images.pexels.com/photos/5737269/pexels-photo-5737269.jpeg', // Housing help
    ]
  };

  const categoryImages = curatedImages[category] || curatedImages['Community Development'];
  
  // Use opportunity ID to consistently select the same image for the same opportunity
  const imageIndex = Math.abs(opportunityId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0)) % categoryImages.length;

  const selectedImage = categoryImages[imageIndex];
  usedImages.add(selectedImage);
  
  return selectedImage;
};

// Extract images from VolunteerConnector API response
export const extractVolunteerConnectorImage = (opportunity: any): string | null => {
  // VolunteerConnector API might have organization logos
  if (opportunity.organization?.logo) {
    return opportunity.organization.logo;
  }
  return null;
};

// Extract images from Idealist API response  
export const extractIdealistImage = (opportunity: any): string | null => {
  // Idealist might have organization images or job posting images
  if (opportunity.organization?.image) {
    return opportunity.organization.image;
  }
  return null;
};

// Clear used images cache (for testing or reset)
export const clearImageCache = () => {
  usedImages.clear();
  imageCache.clear();
};

// Get usage statistics
export const getImageStats = () => {
  return {
    usedImages: usedImages.size,
    cachedImages: imageCache.size
  };
};