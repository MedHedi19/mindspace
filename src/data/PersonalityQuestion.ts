import type { PersonalityQuestion } from '../types';

export const personalityQuestions: PersonalityQuestion[] = [
  { id: 1, text: "I enjoy trying new and different activities.", trait: 'openness' },
  { id: 2, text: "I have a vivid imagination and love to daydream.", trait: 'openness' },
  { id: 3, text: "I am always prepared and organized.", trait: 'conscientiousness' },
  { id: 4, text: "I follow through on my commitments and plans.", trait: 'conscientiousness' },
  { id: 5, text: "I enjoy being around people and social gatherings.", trait: 'extraversion' },
  { id: 6, text: "I feel energized after spending time with others.", trait: 'extraversion' },
  { id: 7, text: "I care about others and try to help when I can.", trait: 'agreeableness' },
  { id: 8, text: "I am cooperative and try to avoid conflicts.", trait: 'agreeableness' },
  { id: 9, text: "I often feel anxious or worried.", trait: 'neuroticism' },
  { id: 10, text: "I tend to get stressed out easily.", trait: 'neuroticism' },
];
