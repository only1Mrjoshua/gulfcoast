export const getUSGreetingAndDate = () => {
  const now = new Date();
  const options = { timeZone: 'America/New_York', hour12: false, hour: 'numeric' };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const hour = parseInt(formatter.format(now), 10);

  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  const dateOptions = { timeZone: 'America/New_York', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = new Intl.DateTimeFormat('en-US', dateOptions).format(now);

  return { greeting, dateString };
};