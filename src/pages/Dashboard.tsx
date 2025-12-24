
import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, DollarSign, Wallet, PiggyBank, TrendingUp, Upload, Plus, Trash2, Camera, FileText } from "lucide-react";
import { ExpenseCard } from "@/components/cards/ExpenseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [totalSpending, setTotalSpending] = useState(0);
    const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getUserName = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name.split(' ')[0];
        }
        return user?.email?.split('@')[0] || 'there';
    };

    const loadData = async () => {
        if (!user) return;
        
        setIsLoading(true);
        setError(null);
        try {
            // Fetch user's invoices from Supabase
            const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (invoiceError) throw invoiceError;

            // Fetch user's expenses from Supabase
            const { data: expenseData, error: expenseError } = await supabase
                .from('expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (expenseError) throw expenseError;

            setInvoices(invoiceData || []);
            setExpenses(expenseData || []);
            
            // Calculate total spending from both invoices and expenses
            const invoiceTotal = (invoiceData || []).reduce((sum, inv) => sum + (inv.total || 0), 0);
            const expenseTotal = (expenseData || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
            setTotalSpending(invoiceTotal + expenseTotal);
        } catch (err: any) {
            setError(err.message || "Failed to load your data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteInvoice = (id: string) => {
        setInvoiceToDelete(id);
    };

    const confirmDeleteInvoice = async () => {
        if (!user || !invoiceToDelete) return;
        
        try {
            const { error } = await supabase
                .from('invoices')
                .delete()
                .eq('id', invoiceToDelete)
                .eq('user_id', user.id);

            if (error) throw error;

            // Reload data
            loadData();
        } catch (error: any) {
            console.error('Failed to delete invoice:', error);
        } finally {
            setInvoiceToDelete(null);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Generate spending trend chart data from expenses
    const getSpendingTrendData = () => {
        if (expenses.length === 0) return [];
        
        // Group expenses by date
        const grouped = expenses.reduce((acc: any, exp: any) => {
            const date = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!acc[date]) acc[date] = 0;
            acc[date] += exp.amount || 0;
            return acc;
        }, {});

        return Object.entries(grouped).map(([date, value]) => ({ name: date, value })).slice(-8);
    };

    // Generate category pie chart data
    const getCategoryData = () => {
        if (expenses.length === 0) return [];
        
        const grouped = expenses.reduce((acc: any, exp: any) => {
            const category = exp.category || 'Other';
            if (!acc[category]) acc[category] = 0;
            acc[category] += exp.amount || 0;
            return acc;
        }, {});

        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    };

    const handleUploadPhoto = () => {
        setShowAddDialog(false);
        // Check if device supports camera
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Navigate to upload page with the file
            navigate('/upload', { state: { file } });
        }
    };

    const handleFillForm = () => {
        setShowAddDialog(false);
        // Navigate to upload page in manual mode
        navigate('/upload', { state: { mode: 'manual' } });
    };

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

    return (
        <AppLayout title="Dashboard">
            <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto pb-24">

                {/* Header Section */}
                <div className="animate-fade-in-up">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Welcome back, {getUserName()}! 👋
                    </h2>
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
                {!isLoading && !error && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-3">
                            {/* Total Spending */}
                            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Total Spending
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        ${totalSpending.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        From {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Invoices Count */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Wallet className="h-4 w-4" />
                                        Invoices
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{invoices.length}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {invoices.length === 0 ? 'Upload your first invoice' : 'Total uploaded'}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Budget/Savings */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <PiggyBank className="h-4 w-4" />
                                        Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">Active</div>
                                    <p className="text-xs text-muted-foreground mt-1">Account ready</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Empty State or Recent Invoices */}
                        {invoices.length === 0 ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Spending Overview Chart - Empty State */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Spending Overview
                                        </CardTitle>
                                        <CardDescription>Track your spending patterns</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-16 h-16 rounded-3xl bg-muted mb-4 flex items-center justify-center">
                                                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h4 className="font-medium text-foreground mb-1">No data yet</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Add invoices and expenses to see trends
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Category Distribution Chart - Empty State */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Wallet className="h-5 w-5" />
                                            Category Breakdown
                                        </CardTitle>
                                        <CardDescription>Expense distribution by category</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-16 h-16 rounded-3xl bg-muted mb-4 flex items-center justify-center">
                                                <Wallet className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h4 className="font-medium text-foreground mb-1">No categories yet</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Start tracking expenses to see breakdown
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
                                <div className="grid gap-3">
                                    {invoices.slice(0, 5).map((invoice) => (
                                        <Card 
                                            key={invoice.id} 
                                            className="hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{invoice.vendor || 'Unknown Vendor'}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {invoice.invoice_number || 'No invoice number'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">${invoice.total?.toFixed(2) || '0.00'}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {invoice.date || new Date(invoice.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteInvoice(invoice.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Charts Section */}
                        {(expenses.length > 0 || invoices.length > 0) && (
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Spending Trend Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Spending Trend
                                        </CardTitle>
                                        <CardDescription>Your spending over time</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {getSpendingTrendData().length > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <AreaChart data={getSpendingTrendData()}>
                                                    <defs>
                                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                                                    <YAxis stroke="#888888" fontSize={12} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-[250px] text-center">
                                                <p className="text-sm text-muted-foreground">Add expenses to see spending trends</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Category Pie Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Wallet className="h-5 w-5" />
                                            Spending by Category
                                        </CardTitle>
                                        <CardDescription>Breakdown of expenses</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {getCategoryData().length > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={getCategoryData()}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {getCategoryData().map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-[250px] text-center">
                                                <p className="text-sm text-muted-foreground">Add expenses to see category breakdown</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}

                {/* Floating Upload Button */}
                <div className="fixed bottom-24 right-4 z-40">
                    <Button
                        size="lg"
                        onClick={() => setShowAddDialog(true)}
                        className="rounded-full h-14 w-14 shadow-soft-xl animate-fade-in-up"
                        style={{ animationDelay: "400ms" }}
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>

                {/* Hidden file input for camera/upload */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Add Option Dialog */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Entry</DialogTitle>
                            <DialogDescription>
                                Choose how you'd like to add your invoice or expense
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3 py-4">
                            <Button
                                variant="outline"
                                className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/10 hover:border-primary"
                                onClick={handleUploadPhoto}
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Camera className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium">Upload Photo</p>
                                    <p className="text-xs text-muted-foreground">Scan invoice or receipt</p>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/10 hover:border-primary"
                                onClick={handleFillForm}
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium">Fill Up Form</p>
                                    <p className="text-xs text-muted-foreground">Enter details manually</p>
                                </div>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Invoice Confirmation Dialog */}
                <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this invoice from your records.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteInvoice} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </AppLayout>
    );
}
