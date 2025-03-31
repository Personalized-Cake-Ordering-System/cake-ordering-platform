// "use client";

// import { CldUploadWidget } from "next-cloudinary";
// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import { ImagePlus, Trash } from "lucide-react";

// interface ImageUploadProps {
//     disabled?: boolean;
//     onChange: (value: string) => void;
//     onRemove: (value: string) => void;
//     value: string;
//     multiple?: boolean;
// }

// export const ImageUpload: React.FC<ImageUploadProps> = ({
//     disabled,
//     onChange,
//     onRemove,
//     value,
//     multiple = false,
// }) => {
//     const [isMounted, setIsMounted] = useState(false);

//     useEffect(() => {
//         setIsMounted(true);
//     }, []);

//     if (!isMounted) {
//         return null;
//     }

//     return (
//         <div className="mb-4 flex items-center gap-4">
//             {value && (
//                 <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
//                     <div className="z-10 absolute top-2 right-2">
//                         <Button
//                             type="button"
//                             onClick={() => onRemove(value)}
//                             variant="destructive"
//                             size="icon"
//                         >
//                             <Trash className="h-4 w-4" />
//                         </Button>
//                     </div>
//                     <Image
//                         fill
//                         className="object-cover"
//                         alt="Image"
//                         src={value}
//                     />
//                 </div>
//             )}
//             <CldUploadWidget onUpload={(result: any) => onChange(result.info.secure_url)}>
//                 {({ open }) => {
//                     const onClick = () => {
//                         open();
//                     };

//                     return (
//                         <Button
//                             type="button"
//                             disabled={disabled}
//                             variant="secondary"
//                             onClick={onClick}
//                         >
//                             <ImagePlus className="h-4 w-4 mr-2" />
//                             Upload an Image
//                         </Button>
//                     );
//                 }}
//             </CldUploadWidget>
//         </div>
//     );
// }; 