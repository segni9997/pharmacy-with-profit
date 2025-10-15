import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface UseQueryParamsStateProps {
  defaultSearch?: string;
  defaultStatus?: string;
  defaultUnit?: string;
  defaultPage?: number;
  defaultPageSize?: number;
}

export function useQueryParamsState({
  defaultSearch = "",
  defaultStatus = "",
  defaultUnit = "",
  defaultPage = 1,
  defaultPageSize = 10,
}: UseQueryParamsStateProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // 🔍 Search
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || defaultSearch
  );

  // ⚙️ Filter
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: searchParams.get("status") || defaultStatus,
  });

  // 📦 Unit filter
  const [unit, setUnit] = useState(searchParams.get("unit") || defaultUnit);

  // 📄 Pagination
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam =
      searchParams.get("pageNumber") || searchParams.get("page");
    return pageParam ? Number(pageParam) : defaultPage;
  });

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const pageSizeParam = searchParams.get("pageSize");
    return pageSizeParam ? Number(pageSizeParam) : defaultPageSize;
  });

  // 🧠 Sync state → URL
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams); // clone existing

    newParams.set("pageNumber", String(currentPage));
    newParams.set("pageSize", String(itemsPerPage));
    newParams.set("search", searchValue);
    newParams.set("status", filterValues.status);
    newParams.set("unit", unit);

    setSearchParams(newParams, { replace: true }); // avoid adding history entries
  }, [
    searchValue,
    filterValues.status,
    currentPage,
    itemsPerPage,
    unit,
    searchParams,
    setSearchParams,
  ]);

  // Return everything cleanly
  return {
    searchValue,
    setSearchValue,
    filterValues,
    setFilterValues,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    unit,
    setUnit,
  };
}
