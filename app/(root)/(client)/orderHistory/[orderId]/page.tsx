import OrderDetails from './OrderDetails';

export default async function Page({
    params,
}: {
    params: Promise<{ orderId: string }>
}) {
    const { orderId } = await params;
    return <OrderDetails orderId={orderId} />;
} 