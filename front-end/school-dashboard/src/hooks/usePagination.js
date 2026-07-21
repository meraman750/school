import { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

export default function usePagination(initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const queryParams = useMemo(
    () => ({ page, page_size: pageSize }),
    [page, pageSize],
  );

  const resetPage = () => setPage(1);

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize: handlePageSizeChange,
    queryParams,
    resetPage,
  };
}
