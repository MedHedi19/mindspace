export type Page = 'home' | 'facial' | 'personality' | 'depression' | 'greenspaces' | 'student' | 'chatbot';

export interface Emotion {
  label: string;
  score: number;
  color: string;
}

export interface PersonalityQuestion {
  id: number;
  text: string;
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
}

export interface PersonalityResult {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface DepressionQuestion {
  id: number;
  text: string;
}

export interface GreenSpace {
  id: number;
  name: string;
  type: string;
  distance: string;
  rating: number;
  benefits: string[];
  image: string;
  description: string;
  activities: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
  placeId?: string;
}
