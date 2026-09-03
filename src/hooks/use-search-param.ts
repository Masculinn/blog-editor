"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SearchParamValue = string | number | boolean | null | undefined;

type SearchParamUpdates = Readonly<Record<string, SearchParamValue>>;

type NavigationOptions = {
  replace?: boolean;
  scroll?: boolean;
};

export function useSearchParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function getSearchParam(key: string) {
    return searchParams.get(key);
  }

  function getSearchParamsHref(updates: SearchParamUpdates): Route {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined || value === false) {
        params.delete(key);
        continue;
      }

      params.set(key, String(value));
    }

    const query = params.toString();

    return (query ? `${pathname}?${query}` : pathname) as Route;
  }

  function getSearchParamHref(key: string, value: SearchParamValue): Route {
    return getSearchParamsHref({
      [key]: value,
    });
  }

  function setSearchParams(
    updates: SearchParamUpdates,
    options?: NavigationOptions,
  ) {
    const href = getSearchParamsHref(updates);

    const navigate = options?.replace === false ? router.push : router.replace;

    navigate(href, {
      scroll: options?.scroll ?? false,
    });
  }

  function setSearchParam(
    key: string,
    value: SearchParamValue,
    options?: NavigationOptions,
  ) {
    setSearchParams(
      {
        [key]: value,
      },
      options,
    );
  }

  return {
    getSearchParam,
    getSearchParamHref,
    getSearchParamsHref,
    setSearchParam,
    setSearchParams,
  };
}
