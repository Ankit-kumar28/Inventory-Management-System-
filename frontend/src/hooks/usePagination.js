import { useState } from 'react';

export function usePagination(initialLimit = 20) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  const goToPage = (p) => setPage(p);
  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const reset = () => setPage(1);

  return { page, limit, setLimit, goToPage, nextPage, prevPage, reset };
}
