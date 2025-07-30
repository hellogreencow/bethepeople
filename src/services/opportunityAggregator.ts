// Streamlined US-focused Opportunity Aggregation
// Focused on competitive, addictive user experience

import { VolunteerEvent } from '../data/mockData';
import { generateVolunteerOpportunities } from './volunteerService';

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
}

// Simplified configuration focusing on reliable US sources
const DEFAULT_CONFIG: Partial<AggregationConfig> = {
  radius: 25
};

// Quick search for immediate results - US focused only
export const quickSearch = async (config: Partial<AggregationConfig>): Promise<VolunteerEvent[]> => {
  console.log('🚀 Quick search for US opportunities...');
  
  const searchConfig: AggregationConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  } as AggregationConfig;

  try {
    // Primary source: Google Places API for real organizations
    if (searchConfig.coordinates) {
      const opportunities = await generateVolunteerOpportunities(
        searchConfig.coordinates, 
        searchConfig.interests, 
        searchConfig.radius
      );
      
      console.log(`✅ Found ${opportunities.length} real opportunities`);
      return opportunities;
    } else {
      console.log('⚠️ No coordinates provided, returning empty array');
      return [];
    }
  } catch (error) {
    console.error('❌ Quick search failed:', error);
    return [];
  }
};

// Comprehensive search for maximum coverage - simplified
export const comprehensiveSearch = async (config: Partial<AggregationConfig>): Promise<{
  opportunities: VolunteerEvent[];
  metadata: { sources: { [key: string]: number }; searchTime: number };
}> => {
  const startTime = Date.now();
  
  const opportunities = await quickSearch(config);
  
  const searchTime = Date.now() - startTime;
  
  return {
    opportunities,
    metadata: {
      sources: { 'google_places': opportunities.length },
      searchTime
    }
  };
};

// Interest-based search using user preferences
export const searchByUserInterests = async (
  interests: string[],
  location: string,
  coordinates?: { lat: number; lng: number },
  limit: number = 25
): Promise<VolunteerEvent[]> => {
  console.log('🎯 Searching by user interests:', interests);
  
  if (!coordinates) {
    console.warn('No coordinates provided for interest-based search');
    return [];
  }
  
  try {
    const opportunities = await generateVolunteerOpportunities(
      coordinates,
      interests,
      25 // 25 mile radius
    );
    
    return opportunities.slice(0, limit);
  } catch (error) {
    console.error('Interest-based search failed:', error);
    return [];
  }
};