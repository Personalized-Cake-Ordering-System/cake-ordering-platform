

"use server" ;
import { unstable_noStore as noStore, revalidatePath } from "next/cache" ;

import { ApiListResponse, fetchListData } from "@/lib/api/api-handler/generic" ;
import { SearchParams } from "@/types/table" ;
import { ICustomCake } from "../types/custome-cake" ;

export const getCustomCakes = async (
  searchParams: SearchParams
): Promise<ApiListResponse<ICustomCake>> => {
  noStore() ;

  const result = await fetchListData<ICustomCake>(
    "/custom_cakes",
    searchParams
  ) ;

  if (!result.success) {
    console.error("Failed to fetch list ICustomCake:", result.error) ;
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
  console.log("CustomCake data:", result) ;


  return result.data ;   
} ;
