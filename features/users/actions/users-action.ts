"use server";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

import { ApiListResponse, fetchListData } from "@/lib/api/api-handler/generic";
import { SearchParams } from "@/types/table";
import { IUser } from "../types/user-type";

export const getUsers = async (
  searchParams: SearchParams
): Promise<ApiListResponse<IUser>> => {
  noStore();

  const result = await fetchListData<IUser>("/", searchParams);

  if (!result.success) {
    console.error("Failed to fetch list IFee:", result.error);
    return { data: [], pageCount: 0, error: result.error };
  }

  return result.data;
};
