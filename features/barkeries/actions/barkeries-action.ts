"use server" ;
import { unstable_noStore as noStore, revalidatePath } from "next/cache" ;
import {
  ApiListResponse,
  apiRequest,
  ApiSingleResponse,
  fetchListData,
  fetchSingleData,
} from "@/lib/api/api-handler/generic" ;
import { SearchParams } from "@/types/table" ;
import { IBakery } from "../types/barkeries-type" ;
import axios from "axios" ;
import { axiosAuth } from "@/lib/api/api-interceptor/api" ;

export const getBakeries = async (
  searchParams?: SearchParams
): Promise<ApiListResponse<IBakery>> => {
  noStore() ;
  const safeParams = searchParams ? { ...searchParams } : undefined ;

  const result = await fetchListData<IBakery>("/bakeries", safeParams) ;
  console.log("Bakery data:", result) ;
  if (!result.success) {
    console.error("Failed to fetch list IBarkery:", result.error) ;
    return {
      status_code: 400,
      errors: [result.error],
      data: {
        data: [],
        pageCount: 0,
        total_items_count: 0,
      },
      success: false,
    } ;
  }
  console.log("Bakery data:", result) ;

  return result.data ;
} ;

export const getBakeryById = async (
  id: string
): Promise<ApiSingleResponse<IBakery>> => {
  noStore() ;

  const result = await fetchSingleData<IBakery>(`/bakeries/${id}`) ;

  if (!result.success) {
    console.error(`Failed to fetch bakery with ID ${id}:`, result.error) ;
    return { data: null, error: result.error } ;
  }

  return result.data ;
} ;

// create - update - delete
export const createBakery = async (data: any) => {
  noStore() ;

  const result = await apiRequest(() => axiosAuth.post("/bakery", data)) ;

  if (!result.success) {
    return { success: false, error: result.error } ;
  }

  revalidatePath("/stores") ;
  return { success: true, data: undefined } ;
} ;




