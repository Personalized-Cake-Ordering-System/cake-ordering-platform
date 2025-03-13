"use server";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import {
  ApiListResponse,
  apiRequest,
  ApiSingleResponse,
  fetchListData,
  fetchSingleData,
} from "@/lib/api/api-handler/generic";
import { SearchParams } from "@/types/table";
import { IBakery } from "../types/barkeries-type";
import axios from "axios";
import { axiosAuth } from "@/lib/api/api-interceptor/api";

export const getBakeries = async (
  searchParams?: SearchParams
): Promise<ApiListResponse<IBakery>> => {
  noStore();

  const result = await fetchListData<IBakery>("/bakeries", searchParams);

  if (!result.success) {
    console.error("Failed to fetch list IBarkery:", result.error);
    return { data: [], pageCount: 0, error: result.error };
  }

  return result.data;
};

export const getBakeryById = async (
  id: string
): Promise<ApiSingleResponse<IBakery>> => {
  noStore();

  const result = await fetchSingleData<IBakery>(`/bakeries/${id}`);

  if (!result.success) {
    console.error(`Failed to fetch bakery with ID ${id}:`, result.error);
    return { data: null, error: result.error };
  }

  return result.data;
};

// create - update - delete
export const createBakery = async (data: any) => {
  noStore();

  const result = await apiRequest(() => axiosAuth.post("/bakery", data));

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/stores");
  return { success: true, data: undefined };
};

// export const getBakeryById = async (id: string): Promise<IBakery | null> => {
//   try {
//     console.log(`Fetching bakery with ID: ${id}`);

//     const response = await axios.get<{ payload: IBakery }>(
//       `${API_URL}/bakeries/${id}`
//     );

//     console.log("Response data:", response.data);

//     return response.data.payload;
//   } catch (error) {
//     console.error("Error fetching bakery:", error);
//     return null;
//   }
// };

// "use server";
// import { cache } from "react";
// import axios from "axios";
// import {
//   BakeryType,
//   CreateBakeryDto,
//   UpdateBakeryDto,
// } from "../types/barkeries-type";

// // Base API URL - in a real app, this would come from your environment variables
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// /**
//  * Fetch a single bakery by ID
//  */
// export const getBakeryById = cache(
//   async (id: string): Promise<BakeryType | null> => {
//     try {
//       const response = await axios.get(`${API_URL}/bakeries/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching bakery:", error);
//       return null;
//     }
//   }
// );

// /**
//  * Fetch all bakeries with optional pagination and filtering
//  */
// export const getAllBakeries = cache(
//   async (params?: {
//     page?: number;
//     limit?: number;
//     search?: string;
//     sortBy?: string;
//     sortOrder?: "asc" | "desc";
//   }): Promise<{
//     data: BakeryType[];
//     total: number;
//     page: number;
//     limit: number;
//   }> => {
//     try {
//       const response = await axios.get(`${API_URL}/bakeries`, { params });
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching bakeries:", error);
//       return { data: [], total: 0, page: 1, limit: 10 };
//     }
//   }
// );

// /**
//  * Create a new bakery
//  */
// export const createBakery = async (
//   data: CreateBakeryDto
// ): Promise<BakeryType | null> => {
//   try {
//     const response = await axios.post(`${API_URL}/bakeries`, data);
//     return response.data;
//   } catch (error) {
//     console.error("Error creating bakery:", error);
//     return null;
//   }
// };

// /**
//  * Update an existing bakery
//  */
// export const updateBakery = async (
//   id: string,
//   data: UpdateBakeryDto
// ): Promise<BakeryType | null> => {
//   try {
//     const response = await axios.put(`${API_URL}/bakeries/${id}`, data);
//     return response.data;
//   } catch (error) {
//     console.error("Error updating bakery:", error);
//     return null;
//   }
// };

// /**
//  * Delete a bakery
//  */
// export const deleteBakery = async (id: string): Promise<boolean> => {
//   try {
//     await axios.delete(`${API_URL}/bakeries/${id}`);
//     return true;
//   } catch (error) {
//     console.error("Error deleting bakery:", error);
//     return false;
//   }
// };

// /**
//  * Toggle bakery active status
//  */
// export const toggleBakeryStatus = async (
//   id: string,
//   isActive: boolean
// ): Promise<boolean> => {
//   try {
//     await axios.patch(`${API_URL}/bakeries/${id}/status`, { isActive });
//     return true;
//   } catch (error) {
//     console.error("Error toggling bakery status:", error);
//     return false;
//   }
// };

// /**
//  * Add a promotion to a bakery
//  */
// export const addBakeryPromotion = async (
//   id: string,
//   promotionData: any
// ): Promise<boolean> => {
//   try {
//     await axios.post(`${API_URL}/bakeries/${id}/promotions`, promotionData);
//     return true;
//   } catch (error) {
//     console.error("Error adding bakery promotion:", error);
//     return false;
//   }
// };

// /**
//  * Get bakery statistics
//  */
// export const getBakeryStats = cache(async (id: string): Promise<any> => {
//   try {
//     const response = await axios.get(`${API_URL}/bakeries/${id}/stats`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching bakery stats:", error);
//     return null;
//   }
// });

// /**
//  * Get bakery products
//  */
// export const getBakeryProducts = cache(
//   async (
//     id: string,
//     params?: {
//       page?: number;
//       limit?: number;
//       category?: string;
//     }
//   ): Promise<any> => {
//     try {
//       const response = await axios.get(`${API_URL}/bakeries/${id}/products`, {
//         params,
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching bakery products:", error);
//       return { data: [], total: 0, page: 1, limit: 10 };
//     }
//   }
// );

// /**
//  * Get bakery reviews
//  */
// export const getBakeryReviews = cache(
//   async (
//     id: string,
//     params?: {
//       page?: number;
//       limit?: number;
//       rating?: number;
//     }
//   ): Promise<any> => {
//     try {
//       const response = await axios.get(`${API_URL}/bakeries/${id}/reviews`, {
//         params,
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching bakery reviews:", error);
//       return { data: [], total: 0, page: 1, limit: 10 };
//     }
//   }
// );

// /**
//  * Follow a bakery
//  */
// export const followBakery = async (id: string): Promise<boolean> => {
//   try {
//     await axios.post(`${API_URL}/bakeries/${id}/follow`);
//     return true;
//   } catch (error) {
//     console.error("Error following bakery:", error);
//     return false;
//   }
// };

// /**
//  * Unfollow a bakery
//  */
// export const unfollowBakery = async (id: string): Promise<boolean> => {
//   try {
//     await axios.delete(`${API_URL}/bakeries/${id}/follow`);
//     return true;
//   } catch (error) {
//     console.error("Error unfollowing bakery:", error);
//     return false;
//   }
// };
