import { differenceInDays, startOfDay } from 'date-fns';

export const calculateStreak = (dates: Date[]): { current: number; longest: number } => {
  if (dates.length === 0) return { current: 0, longest: 0 };

  // Sort dates in descending order
  const sortedDates = dates
    .map((d) => startOfDay(new Date(d)).getTime())
    .sort((a, b) => b - a);

  // Remove duplicates
  const uniqueDates = Array.from(new Set(sortedDates));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = startOfDay(new Date()).getTime();
  const yesterday = today - 24 * 60 * 60 * 1000;

  // Calculate current streak
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = uniqueDates[i - 1] - uniqueDates[i];
      if (diff === 24 * 60 * 60 * 1000) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = uniqueDates[i - 1] - uniqueDates[i];
    if (diff === 24 * 60 * 60 * 1000) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, 1);

  return { current: currentStreak, longest: longestStreak };
};

export const calculateXP = (difficulty: string, timeTaken: number): number => {
  const baseXP = {
    Easy: 10,
    Medium: 25,
    Hard: 50,
  }[difficulty] || 10;

  // Bonus for solving quickly (less XP for taking too long)
  const timeBonus = timeTaken < 30 ? 5 : timeTaken < 60 ? 0 : -5;

  return Math.max(baseXP + timeBonus, 5);
};

export const calculateLevel = (xp: number): number => {
  // Level formula: Level = floor(sqrt(XP / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const getNextLevelXP = (currentLevel: number): number => {
  // XP needed for next level
  return Math.pow(currentLevel, 2) * 100;
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return new Date(date).toLocaleDateString();
};
