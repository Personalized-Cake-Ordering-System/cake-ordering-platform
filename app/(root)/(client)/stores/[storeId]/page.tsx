import { Suspense } from 'react' ;
import { getBakeryById } from '@/features/barkeries/actions/barkeries-action' ;
import { LoadingSpinner } from '@/components/shared/custom-ui/loading-spinner' ;
import StoreDetailPage from './components/StoreDetailPage' ;
import Breadcrumb from '@/components/shared/bread-crumb' ;

// Define the interface for the API response
interface BakeryApiResponse {
  id: string ;
  bakery_name: string ;
  email: string ;
  phone: string ;
  address: string ;
  owner_name: string ;
  avatar_file?: {
    file_url: string ;
  } ;
  shop_image_files?: Array<{
    file_url: string ;
  }> ;
  status: string ;
  created_at: string ;
  confirmed_at?: string ;
}

// Define interface for the bakery data from API
interface BakeryData {
  id?: string ;
  bakery_name?: string ;
  name?: string ;
  email?: string ;
  phone?: string ;
  address?: string ;
  owner_name?: string ;
  status?: string ;
  created_at?: string ;
  avatar_file?: {
    file_url: string ;
  } ;
  logo?: string ;
  shop_image_files?: Array<{
    file_url: string ;
  }> ;
  banner?: string ;
}

export default async function BakeryPage({ params }: { params: Promise<{ storeId: string }> }) {
  // Fetch bakery data server-side
  const apiResponse = await getBakeryById((await params).storeId) ;

  // Extract the bakery data from the API response and provide a type assertion
  const bakeryData = (apiResponse.data || {}) as BakeryData ;

  // Map the API response to the expected format
  const mappedBakeryData: BakeryApiResponse = {
    id: bakeryData.id || (await params).storeId,
    bakery_name: bakeryData.bakery_name || bakeryData.name || 'Bakery',
    email: bakeryData.email || '',
    phone: bakeryData.phone || '',
    address: bakeryData.address || '',
    owner_name: bakeryData.owner_name || '',
    status: bakeryData.status || 'ACTIVE',
    created_at: bakeryData.created_at || new Date().toISOString(),
    // Map other fields as needed
    avatar_file: bakeryData.avatar_file ||
      (bakeryData.logo ? { file_url: bakeryData.logo } : undefined),
    shop_image_files: bakeryData.shop_image_files ||
      (bakeryData.banner ? [{ file_url: bakeryData.banner }] : [])
  } ;

  const breadcrumbItems = [
    { label: 'Bảng điều khiển', href: '/dashboard', isLast: false },
    { label: 'Tiệm bánh', href: '/dashboard/bakeries', isLast: false },
    { label: 'Chi tiết tiệm bánh', href: `/dashboard/bakeries/${(await params).storeId}`, isLast: true },
  ] ;

  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner /></div>}>
        <StoreDetailPage bakery={mappedBakeryData} />
      </Suspense>
    </div>
  ) ;
}