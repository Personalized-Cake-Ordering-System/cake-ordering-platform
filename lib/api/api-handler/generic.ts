"use server";

import axios, { AxiosResponse } from "axios";
import { axiosAuth } from "@/lib/api/api-interceptor/api";
import { handleAPIError, translateError } from "./hanlder-api-error";

export type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export interface ApiListResponse<T> {
  status_code: number;
  errors: any[];
  meta_data?: {
    total_items_count: number;
    page_size: number;
    total_pages_count: number;
    page_index: number;
    has_next: boolean;
    has_previous: boolean;
  };
  payload?: T[];
  data?: {
    data: T[];
    pageCount?: number;
    total_items_count?: number;
  };
  success?: boolean;
}

export interface ApiSingleResponse<T> {
  data: T | null;
  error?: string;
}

export async function apiRequest<T>(
  request: () => Promise<AxiosResponse<T>>
): Promise<Result<T>> {
  try {
    const response = await request();
    console.log("Response:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    // if (axios.isAxiosError(error)) {
    //   const errorMessage = await handleAPIError(error);
    //   return { success: false, error: errorMessage };
    // }

    return { success: false, error: translateError(error) };
  }
}

export async function fetchListData<T>(
  url: string,
  searchParams?: Record<string, any>
): Promise<Result<ApiListResponse<T>>> {
  // Update the type definition to match what your API actually returns
  const result = await apiRequest<{
    payload: T[];
    meta_data: {
      total_items_count: number;
      page_size: number;
      total_pages_count: number;
      // Add optional properties for potentially missing fields
      page_index?: number;
      has_next?: boolean;
      has_previous?: boolean;
    };
  }>(() => axiosAuth.get(url, { params: searchParams }));
  if (result.success) {
    const { payload, meta_data } = result.data;

    // Complete the meta_data object with default values for any missing fields
    const completeMetaData = {
      total_items_count: meta_data?.total_items_count || 0,
      page_size: meta_data?.page_size || 10,
      total_pages_count: meta_data?.total_pages_count || 0,
      page_index: meta_data?.page_index || 0,
      has_next: meta_data?.has_next || false,
      has_previous: meta_data?.has_previous || false,
    };

    return {
      success: true,
      data: {
        status_code: 200,
        errors: [],
        payload: payload || [],
        meta_data: completeMetaData,
        data: {
          data: payload || [],
          pageCount: meta_data?.total_pages_count || 0,
          total_items_count: meta_data?.total_items_count || 0,
        },
      },
    };
  }

  return result;
}

export async function fetchSingleData<T>(
  url: string
): Promise<Result<ApiSingleResponse<T>>> {
  const result = await apiRequest<{ payload: T }>(() => axiosAuth.get(url));

  if (result.success) {
    return {
      success: true,
      data: { data: result.data.payload },
    };
  }

  return result;
}
