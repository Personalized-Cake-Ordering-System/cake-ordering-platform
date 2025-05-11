export interface ICake   {
  id: string ;
  available_cake_price: number ;
  name: string ;
  available_cake_name: string ;
  available_cake_description: string ;
  available_cake_type: string ;
  available_cake_quantity: number ;
  available_main_image_id: string ;
  available_cake_main_image: string ;
  available_cake_image_files: ICakeImageFile[] ;
  bakery_id: string ;
  }

export interface ICakeImageFile   {
  file_name: string ;
  file_url: string ;
  id: string ;
 }
