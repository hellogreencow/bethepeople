// Billion-Dollar Opportunity Aggregation Strategy
// This service combines multiple data sources for comprehensive opportunity discovery

import { VolunteerEvent } from '../data/mockData';
import { generateVolunteerOpportunities } from './volunteerService';
import { generateVolunteerOpportunitiesWithPerplexity } from './perplexityService';
import { searchVolunteerOpportunities } from './firecrawlService';
import { searchVolunteerConnectorOpportunities, searchByLocation, searchByInterests } from './volunteerConnectorService';
import { searchIdealistVolunteerOpportunities } from './idealistService';

export interface OpportunitySource {
  name: string;
  priority: number;
  enabled: boolean;
  maxResults: number;
}

export interface AggregationConfig {
  location: string;
  coordinates?: { lat: number; lng: number };
  interests: string[];
  availability: string;
  contributionTypes: string[];
  radius: number; // miles
  sources: OpportunitySource[];
}

// Default configuration for maximum opportunity discovery
const DEFAULT_CONFIG: Partial<AggregationConfig> = {
  radius: 25,
  sources: [
    { name: 'volunteer_connector', priority: 1, enabled: true, maxResults: 25 }, // NEW: VolunteerConnector API
    { name: 'google_places', priority: 2, enabled: true, maxResults: 20 },
    { name: 'idealist_us', priority: 3, enabled: true, maxResults: 15 }, // NEW: Real US opportunities
    { name: 'ai_perplexity', priority: 4, enabled: false, maxResults: 0 }, // Skip AI for speed
    { name: 'ai_perplexity', priority: 4, enabled: true, maxResults: 15 },
    { name: 'web_scraping', priority: 5, enabled: false, maxResults: 12 }, // Disabled by default due to reliability
    { name: 'partner_apis', priority: 5, enabled: false, maxResults: 15 }, // Future: VolunteerMatch, JustServe APIs
    { name: 'social_media', priority: 6, enabled: false, maxResults: 10 }, // Future: Facebook Events, Nextdoor
  ]
};

// Aggregate opportunities from all available sources
export const aggregateOpportunities = async (config: AggregationConfig): Promise<{
  opportunities: VolunteerEvent[];
  sources: { [key: string]: number };
  totalFound: number;
  searchTime: number;
}> => {
  const startTime = Date.now();
  const allOpportunities: VolunteerEvent[] = [];
  const sourceCounts: { [key: string]: number } = {};
  
  console.log('🚀 Starting comprehensive opportunity aggregation...');
  console.log('Config:', {
    location: config.location,
    radius: config.radius,
    interests: config.interests,
    sources: config.sources.filter(s => s.enabled).map(s => s.name)
  });

  // Execute searches in parallel for speed
  const searchPromises: Promise<{ source: string; opportunities: VolunteerEvent[] }>[] = [];

  // 1. VolunteerConnector API (Highest Priority - Real Canadian Opportunities)
  if (config.sources.find(s => s.name === 'volunteer_connector')?.enabled) {
    searchPromises.push(
      searchByLocation(config.location, config.sources.find(s => s.name === 'volunteer_connector')?.maxResults || 15)
        .then(opportunities => ({ source: 'volunteer_connector', opportunities }))
        .catch(error => {
          console.warn('VolunteerConnector API search failed:', error);
          return { source: 'volunteer_connector', opportunities: [] };
        })
    );
  }


  // 2. Google Places (High Priority - Real Organizations)
  if (config.sources.find(s => s.name === 'google_places')?.enabled && config.coordinates) {
    searchPromises.push(
      generateVolunteerOpportunities(config.coordinates, config.interests, config.radius)
        .then(opportunities => ({ source: 'google_places', opportunities }))
        .catch(error => {
          console.warn('Google Places search failed:', error);
          return { source: 'google_places', opportunities: [] };
        })
    );
  }
  // 3. Idealist US API (High Priority - Real US Volunteer Opportunities)
  if (config.sources.find(s => s.name === 'idealist_us')?.enabled) {
    searchPromises.push(
      searchIdealistVolunteerOpportunities(config.location, config.interests, config.sources.find(s => s.name === 'idealist_us')?.maxResults || 20)
        .then(opportunities => ({ source: 'idealist_us', opportunities }))
        .catch(error => {
          console.warn('Idealist US API search failed:', error);
          return { source: 'idealist_us', opportunities: [] };
        })
    );
  }

  // 4. AI/Perplexity (Medium Priority - Intelligent Discovery)
  if (config.sources.find(s => s.name === 'ai_perplexity')?.enabled) {
    searchPromises.push(
      generateVolunteerOpportunitiesWithPerplexity(
        config.location,
        config.interests,
        config.availability,
        config.contributionTypes
      )
        .then(opportunities => ({ source: 'ai_perplexity', opportunities }))
        .catch(error => {
          console.warn('AI/Perplexity search failed:', error);
          return { source: 'ai_perplexity', opportunities: [] };
        })
    );
  }

  // 5. Web Scraping (Lower Priority - Broad Coverage)
  if (config.sources.find(s => s.name === 'web_scraping')?.enabled) {
    searchPromises.push(
      searchVolunteerOpportunities(config.location, config.interests)
        .then(opportunities => ({ source: 'web_scraping', opportunities }))
        .catch(error => {
          console.warn('Web scraping search failed:', error);
          return { source: 'web_scraping', opportunities: [] };
        })
    );
  }

  // Execute all searches in parallel
  const results = await Promise.allSettled(searchPromises);

  // Process results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { source, opportunities } = result.value;
      const sourceConfig = config.sources.find(s => s.name === source);
      const maxResults = sourceConfig?.maxResults || 10;
      
      // Limit results per source and add source metadata
      const limitedOpportunities = opportunities.slice(0, maxResults).map(opp => ({
        ...opp,
        source,
        priority: sourceConfig?.priority || 999
      }));
      
      allOpportunities.push(...limitedOpportunities);
      sourceCounts[source] = limitedOpportunities.length;
      
      console.log(`✅ ${source}: ${limitedOpportunities.length} opportunities`);
    } else {
      console.warn(`❌ Search failed:`, result.reason);
    }
  });

  // Deduplicate opportunities (same title + organization)
  const uniqueOpportunities = deduplicateOpportunities(allOpportunities);
  
  // Sort by priority and relevance
  const sortedOpportunities = sortOpportunitiesByRelevance(uniqueOpportunities, config);

  const searchTime = Date.now() - startTime;
  
  console.log('🎉 Aggregation complete:', {
    totalFound: sortedOpportunities.length,
    sources: sourceCounts,
    searchTime: `${searchTime}ms`
  });

  return {
    opportunities: sortedOpportunities,
    sources: sourceCounts,
    totalFound: sortedOpportunities.length,
    searchTime
  };
};

// Remove duplicate opportunities
const deduplicateOpportunities = (opportunities: VolunteerEvent[]): VolunteerEvent[] => {
  const seen = new Set<string>();
  return opportunities.filter(opp => {
    const key = `${opp.title.toLowerCase()}-${opp.organization.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Sort opportunities by relevance and priority
const sortOpportunitiesByRelevance = (
  opportunities: VolunteerEvent[],
  config: AggregationConfig
): VolunteerEvent[] => {
  return opportunities.sort((a, b) => {
    // 1. Source priority (lower number = higher priority)
    const aPriority = (a as any).priority || 999;
    const bPriority = (b as any).priority || 999;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // 2. Interest match score
    const aInterestScore = calculateInterestScore(a, config.interests);
    const bInterestScore = calculateInterestScore(b, config.interests);
    if (aInterestScore !== bInterestScore) {
      return bInterestScore - aInterestScore;
    }

    // 3. Distance (if available)
    const aDistance = (a as any).distance || 999;
    const bDistance = (b as any).distance || 999;
    if (aDistance !== bDistance) {
      return aDistance - bDistance;
    }

    // 4. Spots available (more spots = higher priority)
    return b.spotsAvailable - a.spotsAvailable;
  });
};

// Calculate how well an opportunity matches user interests
const calculateInterestScore = (opportunity: VolunteerEvent, userInterests: string[]): number => {
  if (userInterests.length === 0) return 0;
  
  let score = 0;
  const oppText = `${opportunity.title} ${opportunity.category} ${opportunity.description}`.toLowerCase();
  
  userInterests.forEach(interest => {
    if (oppText.includes(interest.toLowerCase())) {
      score += 1;
    }
  });
  
  return score;
};

// Quick search for immediate results (uses cached data + fastest sources)
export const quickSearch = async (config: Partial<AggregationConfig>): Promise<VolunteerEvent[]> => {
  const quickConfig: AggregationConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    sources: [
      { name: 'volunteer_connector', priority: 1, enabled: true, maxResults: 20 }, // NEW: Fast and reliable
      { name: 'google_places', priority: 2, enabled: true, maxResults: 15 },
      { name: 'ai_perplexity', priority: 3, enabled: false, maxResults: 0 }, // Skip AI for speed
    ]
  } as AggregationConfig;

  const result = await aggregateOpportunities(quickConfig);
  return result.opportunities;
};

// Comprehensive search for maximum coverage (uses all sources)
export const comprehensiveSearch = async (config: Partial<AggregationConfig>): Promise<{
  opportunities: VolunteerEvent[];
  metadata: { sources: { [key: string]: number }; searchTime: number };
}> => {
  const fullConfig: AggregationConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    sources: [
      { name: 'volunteer_connector', priority: 1, enabled: true, maxResults: 25 }, // NEW: Primary source
      { name: 'google_places', priority: 2, enabled: true, maxResults: 20 },
      { name: 'idealist_us', priority: 3, enabled: true, maxResults: 20 }, // NEW: Real US opportunities
      { name: 'ai_perplexity', priority: 4, enabled: true, maxResults: 15 },
      { name: 'web_scraping', priority: 5, enabled: false, maxResults: 12 }, // Still unreliable
    ]
  } as AggregationConfig;

  const result = await aggregateOpportunities(fullConfig);
  return {
    opportunities: result.opportunities,
    metadata: {
      sources: result.sources,
      searchTime: result.searchTime
    }
  };
};

// Interest-based search using VolunteerConnector
export const searchByUserInterests = async (
  interests: string[],
  location: string,
  limit: number = 25
): Promise<VolunteerEvent[]> => {
  console.log('🎯 Searching by user interests:', interests);
  
  try {
    // Use VolunteerConnector for interest-based search
    const opportunities = await searchByInterests(interests, limit);
    
    // If we have location, also try location-based search and merge
    if (location && opportunities.length < limit) {
      const locationOpportunities = await searchByLocation(location, limit - opportunities.length);
      opportunities.push(...locationOpportunities);
    }
    
    // Remove duplicates and return
    const uniqueOpportunities = deduplicateOpportunities(opportunities);
    return uniqueOpportunities.slice(0, limit);
    
  } catch (error) {
    console.error('Interest-based search failed:', error);
    return [];
  }
};