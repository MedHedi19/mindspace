import { DepressionQuestion } from '../types';

export const depressionQuestions: DepressionQuestion[] = [
  { id: 1, text: "Little interest or pleasure in doing things you usually enjoy." },
  { id: 2, text: "Feeling down, depressed, or hopeless." },
  { id: 3, text: "Trouble falling or staying asleep, or sleeping too much." },
  { id: 4, text: "Feeling tired or having little energy throughout the day." },
  { id: 5, text: "Poor appetite or overeating beyond normal habits." },
  { id: 6, text: "Feeling bad about yourself or like you've let people down." },
  { id: 7, text: "Trouble concentrating on tasks like reading or watching TV." },
  { id: 8, text: "Moving or speaking so slowly that others have noticed, or being fidgety and restless." },
  { id: 9, text: "Thoughts that you would be better off not being here, or of hurting yourself." },
];

export const depressionFrequencies = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];
