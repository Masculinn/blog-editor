"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SearchParamValue = string | number | boolean | null | undefined;

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

  function getSearchParamHref(key: string, value: SearchParamValue): Route {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null || value === undefined || value === false) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }

    const query = params.toString();

    return (query ? `${pathname}?${query}` : pathname) as Route;
  }

  function setSearchParam(
    key: string,
    value: SearchParamValue,
    options?: NavigationOptions,
  ) {
    const href = getSearchParamHref(key, value);

    if (options?.replace === false) {
      router.push(href, {
        scroll: options.scroll ?? false,
      });

      return;
    }

    router.replace(href, {
      scroll: options?.scroll ?? false,
    });
  }

  return {
    getSearchParam,
    getSearchParamHref,
    setSearchParam,
  };
}
