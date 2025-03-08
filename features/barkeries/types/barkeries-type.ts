export interface IAvatar {
  file_name: string;
  file_url: string;
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  is_deleted: boolean;
}

export interface IIdentityCardFile {
  file_name: string;
  file_url: string;
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  is_deleted: boolean;
}

export interface IBakery {
  id: string;
  bakery_name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  owner_name: string;
  avatar_file_id: string;
  avatar_file: IAvatar;
  identity_card_number: string;
  front_card_file_id: string;
  front_card_file: IIdentityCardFile;
  back_card_file_id: string;
  back_card_file: IIdentityCardFile;
  tax_code: string;
  status: string;
  confirmed_at: string;
  shop_image_files: any[];
  notifications: any | null;
  custom_cakes: any | null;
  available_cakes: any | null;
  orders: any | null;
  cake_reviews: any | null;
  order_supports: any | null;
  vouchers: any | null;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  is_deleted: boolean;
}

export interface IBakeryResponse {
  status_code: number;
  errors: any[];
  meta_data: any | null;
  payload: IBakery;
}
