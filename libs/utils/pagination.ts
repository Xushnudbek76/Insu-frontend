export type PageNumber = number | '...';

export const buildPageNumbers = (page: number, totalPages: number): PageNumber[] => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages: PageNumber[] = [1];
  if (page > 3) pages.push('...');

  for (
    let currentPage = Math.max(2, page - 1);
    currentPage <= Math.min(totalPages - 1, page + 1);
    currentPage += 1
  ) {
    pages.push(currentPage);
  }

  if (page < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
};
