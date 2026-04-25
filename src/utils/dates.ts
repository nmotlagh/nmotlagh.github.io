const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseDateValue = (value: string) => {
  const match = dateOnlyPattern.exec(value);

  if (!match) {
    return new Date(value);
  }

  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
};

export const formatDate = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(parseDateValue(value));
