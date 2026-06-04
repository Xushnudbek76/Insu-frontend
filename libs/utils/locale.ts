export const toIntlLocale = (locale?: string) => {
  if (locale === 'kr') return 'ko-KR';
  if (locale === 'ru') return 'ru-RU';
  return 'en-US';
};

export const formatLocaleDate = (
  value: string | Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
) => new Intl.DateTimeFormat(toIntlLocale(locale), options).format(new Date(value));
