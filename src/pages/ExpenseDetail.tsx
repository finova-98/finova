import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    StickyNote,
    Trash2,
    Calendar,
    Tag,
    Hash,
    IndianRupee,
    Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - in real app, fetch from API
const mockExpenseData = {
    id: "1",
    title: "Office Supplies",
    category: "Office",
    date: "December 5, 2024",
    amount: 125.00,
    status: "paid" as const,
    description: "Purchased office supplies including printer paper, pens, notebooks, and desk organizers for the team.",
    paymentMethod: "Company Credit Card",
    receipt: true,
    tags: ["Office", "Supplies", "Team"],
    notes: "Reimbursement processed via payroll",
};

export default function ExpenseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    // In real app, fetch expense by id
    const expense = mockExpenseData;

    const statusColors = {
        paid: "bg-primary/10 text-primary",
        pending: "bg-yellow-500/10 text-yellow-600",
        overdue: "bg-destructive/10 text-destructive",
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="flex items-center justify-between h-14 px-4">
                    <Button
                        variant="icon"
                        size="icon-sm"
                        onClick={() => navigate('/expenses')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-base font-semibold text-foreground">Expense Details</h1>
                    <Button variant="icon" size="icon-sm">
                        <Edit className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            <div className="px-4 py-6 space-y-4 max-w-lg mx-auto pb-24">
                {/* Main Info Card */}
                <Card className="animate-fade-in-up">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
                                <StickyNote className="h-7 w-7 text-accent-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        {expense.title}
                                    </h2>
                                    <span className={cn(
                                        "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                                        statusColors[expense.status]
                                    )}>
                                        {expense.status}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {expense.category}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <IndianRupee className="h-4 w-4" />
                                <span className="text-xs">Amount</span>
                            </div>
                            <p className="font-semibold text-foreground text-lg">
                                ₹{expense.amount.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs">Date</span>
                            </div>
                            <p className="font-medium text-foreground text-sm">
                                {expense.date}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Description */}
                <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-sm text-foreground leading-relaxed">
                            {expense.description}
                        </p>
                    </CardContent>
                </Card>

                {/* Payment Details */}
                <Card className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Payment Method</span>
                            <span className="text-sm font-medium text-foreground">{expense.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Receipt</span>
                            <span className="text-sm font-medium text-foreground">
                                {expense.receipt ? "✓ Attached" : "Not attached"}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Tags */}
                {expense.tags && expense.tags.length > 0 && (
                    <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Tag className="h-4 w-4" />
                                <span className="text-xs">Tags</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {expense.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notes */}
                {expense.notes && (
                    <Card className="animate-fade-in-up" style={{ animationDelay: "350ms" }}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Notes</p>
                            <p className="text-sm text-foreground">{expense.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="animate-fade-in-up flex justify-center" style={{ animationDelay: "400ms" }}>
                    <Button
                        variant="gpt"
                        size="lg"
                        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                        onClick={() => {
                            // Here you would typically make an API call to delete
                            // For now we just navigate back
                            navigate('/expenses');
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Expense
                    </Button>
                </div>
            </div>
        </div>
    );
}
