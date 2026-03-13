export const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  
  // SQLite format: YYYY-MM-DD HH:MM:SS (UTC)
  // Convert to ISO: YYYY-MM-DDTHH:MM:SSZ
  const isoStr = dateStr.replace(' ', 'T') + 'Z';
  const date = new Date(isoStr);
  
  // Fallback if parsing fails
  if (isNaN(date.getTime())) {
    return 'some time';
  }
  
  return date;
};
