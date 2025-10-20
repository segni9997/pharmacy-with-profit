"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface UseQueryParamsStateProps {
  defaultSearch?: string;
  defaultStatus?: string;
  defaultUnit?: string;
  defaultBatchNo?: string;
  defaultVoucherNumber?: string;
  defaultPage?: number;
  defaultPageSize?: number;
}

export function useQueryParamsState({
  defaultSearch = "",
  defaultStatus = "",
  defaultUnit = "",
  defaultBatchNo = "",
  defaultPage = 1,
  defaultPageSize = 10,
  defaultVoucherNumber= ""
}: UseQueryParamsStateProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || defaultSearch
  );

  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: searchParams.get("status") || defaultStatus,
  });

  const [unit, setUnit] = useState(searchParams.get("unit") || defaultUnit);

  const [batchNo, setBatchNo] = useState(
    searchParams.get("batch_no") || defaultBatchNo
  );

  const [voucherNumber, setVoucherNumber] = useState(
    searchParams.get("voucher_number") || defaultVoucherNumber
  );

  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam =
      searchParams.get("pageNumber") || searchParams.get("page");
    return pageParam ? Number(pageParam) : defaultPage;
  });

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const pageSizeParam = searchParams.get("pageSize");
    return pageSizeParam ? Number(pageSizeParam) : defaultPageSize;
  });

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    newParams.set("pageNumber", String(currentPage));
    newParams.set("pageSize", String(itemsPerPage));
    newParams.set("search", searchValue);
    newParams.set("status", filterValues.status);
    newParams.set("unit", unit);
    newParams.set("batch_no", batchNo);
    newParams.set("voucher_number", voucherNumber);

    setSearchParams(newParams, { replace: true });
  }, [
    searchValue,
    filterValues.status,
    currentPage,
    itemsPerPage,
    unit,
    batchNo,
    voucherNumber,
    searchParams,
    setSearchParams,
  ]);

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
    batchNo,
    setBatchNo,
    voucherNumber,
    setVoucherNumber,
  };
}
