
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, DollarSign, Wallet, PiggyBank, TrendingUp } from "lucide-react";
import { fetchDashboardData, mockExpenses } from "@/lib/api";
import { ExpenseCard } from "@/components/cards/ExpenseCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchDashboardData();
            setData(result);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Mock Chart Data based on expenses (aggregated by date roughly)
    const chartData = [
        { name: "Nov 10", value: 500 },
        { name: "Nov 15", value: 1200 },
        { name: "Nov 20", value: 800 },
        { name: "Nov 25", value: 450 },
        { name: "Nov 28", value: 240 },
        { name: "Dec 1", value: 180 },
        { name: "Dec 3", value: 100 },
        { name: "Dec 5", value: 125 },
    ];

    return (
        <AppLayout title="Dashboard">
            <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto pb-24">

                {/* Header Section */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
                    <p className="text-muted-foreground">Track your real-time expenses and savings.</p>
                </div>

                {/* Error State */}
                {error && (
                    <Alert variant="destructive" className="animate-fade-in">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Fetching Data</AlertTitle>
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button variant="outline" size="sm" onClick={loadData} className="ml-4 bg-background/20 hover:bg-background/30 border-none text-white">
                                <RefreshCw className="h-3 w-3 mr-2" /> Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Loading State Skeleton */}
                {isLoading && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Skeleton className="h-32 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                    </div>
                )}

                {/* Success State */}
                {!isLoading && !error && data && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₹{data.totalSpending.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        +20.1% from last month
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₹{data.savings.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        On track for goal
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                                    <Wallet className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₹{data.budget.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        ₹{(data.budget - data.totalSpending).toLocaleString()} remaining
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Chart Area */}
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Spending Trend</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    color: '#000'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#8884d8"
                                                fillOpacity={1}
                                                fill="url(#colorSpending)"
                                            />
                                            <XAxis dataKey="name" hide />
                                            <YAxis hide />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Expenses */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
                            <div className="space-y-2">
                                {data.expenses.slice(0, 3).map((expense: any, i: number) => (
                                    <ExpenseCard key={expense.id} {...expense} animationDelay={i * 100} />
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full mt-4" onClick={() => window.location.href = '/expenses'}>
                                View All Expenses
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
