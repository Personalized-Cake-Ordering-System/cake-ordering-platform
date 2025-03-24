import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "../icons";

interface MetricCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    trend: number;
}

const MetricCard = ({ title, value, description, icon, trend }: MetricCardProps) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                {title}
            </CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
            <div className={`text-xs mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </div>
        </CardContent>
    </Card>
);

export function DashboardOverview() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Total Revenue"
                value="$45,231.89"
                description="Total revenue this month"
                icon={<Icons.dollarSign className="h-4 w-4 text-muted-foreground" />}
                trend={12.2}
            />
            <MetricCard
                title="Orders"
                value="2,345"
                description="Total orders this month"
                icon={<Icons.shoppingCart className="h-4 w-4 text-muted-foreground" />}
                trend={8.1}
            />
            <MetricCard
                title="Customers"
                value="1,234"
                description="Active customers"
                icon={<Icons.users className="h-4 w-4 text-muted-foreground" />}
                trend={-2.5}
            />
            <MetricCard
                title="Average Order"
                value="$32.50"
                description="Per order average"
                icon={<Icons.creditCard className="h-4 w-4 text-muted-foreground" />}
                trend={4.3}
            />
        </div>
    );
} 