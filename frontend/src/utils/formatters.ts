// Utility functions for formatting

export function formatCurrency(amount: number): string {
  // Format as VND currency
  return amount.toLocaleString('vi-VN') + ' ₫';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const weekday = weekdays[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${weekday}, ${day}/${month}/${year}`;
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${formatDate(dateStr)} ${timeStr}`;
}

export function calculateDuration(departure: string, arrival: string): string {
  const [depHour, depMin] = departure.split(':').map(Number);
  const [arrHour, arrMin] = arrival.split(':').map(Number);
  
  let hours = arrHour - depHour;
  let minutes = arrMin - depMin;
  
  if (minutes < 0) {
    hours--;
    minutes += 60;
  }
  
  if (hours < 0) {
    hours += 24;
  }
  
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}