import { format, isToday, isYesterday, isTomorrow, addDays, isSameDay } from 'date-fns';

export const formatDate = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  }
  
  return format(dateObj, 'MMMM d, yyyy');
};

export const formatTime = (date: Date | string | number): string => {
  return format(new Date(date), 'h:mm a');
};

export const formatDateTime = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  return `${formatDate(dateObj)} at ${formatTime(dateObj)}`;
};

export const getNextOccurrence = (
  frequency: {
    type: 'daily' | 'specific-days';
    days?: number[];
  },
  fromDate = new Date()
): Date | null => {
  if (frequency.type === 'daily') {
    return addDays(fromDate, 1);
  }
  
  if (frequency.type === 'specific-days' && frequency.days && frequency.days.length > 0) {
    const today = fromDate.getDay();
    const sortedDays = [...frequency.days].sort((a, b) => a - b);
    
    // Find the next day in the week
    const nextDay = sortedDays.find(day => day > today);
    
    if (nextDay !== undefined) {
      // Next occurrence is this week
      return addDays(fromDate, nextDay - today);
    } else {
      // Next occurrence is next week
      return addDays(fromDate, 7 - today + sortedDays[0]);
    }
  }
  
  // If no specific days are set, return null
  return null;
};

export const shouldCreateTaskForToday = (
  frequency: {
    type: 'daily' | 'specific-days';
    days?: number[];
  }
): boolean => {
  const today = new Date().getDay();
  
  if (frequency.type === 'daily') {
    return true;
  }
  
  if (frequency.type === 'specific-days' && frequency.days) {
    return frequency.days.includes(today);
  }
  
  // If no specific days are set, return false
  return false;
};