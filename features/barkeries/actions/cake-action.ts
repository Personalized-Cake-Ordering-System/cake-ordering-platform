

"use server" ;
import { unstable_noStore as noStore , revalidatePath } from "next/cache" ;

import { ApiListResponse , fetchListData , ApiSingleResponse ,fetchSingleData , apiRequest , Result } from "@/lib/api/api-handler/generic" ;
import { SearchParams } from "@/types/table" ;
import { ICake } from "../types/cake" ;
import { axiosAuth } from "@/lib/api/api-interceptor/api" ;
import { auth } from "@/lib/next-auth/auth" ;

export const getCakes = async (
  searchParams: SearchParams
): Promise<ApiListResponse<ICake>> => {
  noStore() ;

  const result = await fetchListData<ICake>(`/available_cakes` , searchParams) ;

  if (!result.success) {
    console.error("Failed to fetch list IBarkery:" , result.error) ;
    return {
      status_code: 400 ,
      errors: [result.error] ,
      data: {
        data: [] ,
        pageCount: 0 ,
        total_items_count: 0 ,
      } ,
      success: false ,
    } ;
  }
  console.log("Bakery data:" , result) ;

  return result.data ;
} ;



export async function getCake(
  params: string
): Promise<ApiSingleResponse<ICake>> {
  noStore() ;

  const result = await fetchSingleData<ICake>(
    `/available_cakes/${params}`
  ) ;
  if (!result.success) {
    console.error("Failed to fetch cake by ID:" , result.error) ;
    return { data: null } ;
  }
  return result.data ;
}

