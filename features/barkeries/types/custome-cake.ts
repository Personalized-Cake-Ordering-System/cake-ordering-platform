export interface ICustomCake  {
  id: string ;
  total_price: number ;
  custom_cake_name: string ;
  custom_cake_description: string | null ;
  recipe: string | null ;
  customer_id: string ;
  bakery_id: string ;
  message_selection_id: string ;
  message_selection: IMessageSelection ;
  part_selections: IPartSelection[] ;
  extra_selections: IExtraSelection[] ;
  decoration_selections: IDecorationSelection[] ;
}

export interface IMessageSelection {
  text: string | null ;
  message: string ;
  image_id: string | null ;
  image: string | null ;
}

export interface IPartSelection {
  part_type: string ;
  custom_cake_id: string ;
  custom_cake: ICustomCake | null ;
  part_option_id: string ;
  part_option: IPartOption | null ;
}

export interface IPartOption {
  name: string ;
  price: number ;
  id: string ;
  created_at: string ;
  created_by: string ;
}

export interface IExtraSelection {
  extra_type: string ;
  custom_cake_id: string ;
  custom_cake: ICustomCake | null ;
  extra_option_id: string ;
  extra_option: IExtraOption | null ;
}

export interface IExtraOption {
  name: string ;
  price: number ;
  id: string ;
  created_at: string ;
  created_by: string ;
}

export interface IDecorationSelection {
  decoration_type: string ;
  custom_cake_id: string ;
  custom_cake: ICustomCake | null ;
  decoration_option_id: string ;
  decoration_option: IDecorationOption | null ;
}

export interface IDecorationOption {
  name: string ;
  price: number ;
  id: string ;
  created_at: string ;
  created_by: string ;
}
