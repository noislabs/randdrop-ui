export const parseTimestamp = (ts: string) => {
  const date = new Date(parseInt(ts.slice(0, ts.length - 6), 10));
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
}