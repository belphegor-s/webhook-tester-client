export const formatUserDate = (dateString) => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Date(dateString).toLocaleString(undefined, {
    timeZoneName: 'short',
    timeZone: tz,
  });
};
