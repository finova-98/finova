import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ExpenseCard } from "@/components/cards/ExpenseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, StickyNote, Plus, IndianRupee, Tag, Calendar, CheckCircle2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const allExpenses = [
    { id: "1", title: "Office Supplies", category: "Office", date: "Dec 5, 2024", amount: 125, status: "paid" as const },
    { id: "2", title: "Team Lunch", category: "Food", date: "Dec 3, 2024", amount: 96, status: "paid" as const },
    { id: "3", title: "Software License", category: "Software", date: "Dec 1, 2024", amount: 180, status: "pending" as const },
    { id: "4", title: "Cloud Hosting", category: "Software", date: "Nov 28, 2024", amount: 240, status: "paid" as const },
    { id: "5", title: "Client Meeting", category: "Travel", date: "Nov 25, 2024", amount: 450, status: "paid" as const },
    { id: "6", title: "Marketing Campaign", category: "Marketing", date: "Nov 20, 2024", amount: 840, status: "pending" as const },
    { id: "7", title: "Office Rent", category: "Office", date: "Nov 15, 2024", amount: 1280, status: "paid" as const },
    { id: "8", title: "Equipment Purchase", category: "Office", date: "Nov 10, 2024", amount: 549, status: "overdue" as const },
];

type FilterStatus = "all" | "paid" | "pending" | "overdue";

const categories = ["Office", "Food", "Software", "Travel", "Marketing", "Utilities", "Other"];

export default function Expenses() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        status: "paid" as "paid" | "pending",
    });

    const filteredExpenses = allExpenses.filter((expense) => {
        const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === "all" || expense.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const filterButtons: { label: string; value: FilterStatus }[] = [
        { label: "All", value: "all" },
        { label: "Paid", value: "paid" },
        { label: "Pending", value: "pending" },
        { label: "Overdue", value: "overdue" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.amount || !formData.category) {
            toast({
                title: "Missing fields",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        // In a real app, this would save to a database
        toast({
            title: "Expense added!",
            description: `${formData.title} - ₹${formData.amount}`,
        });

        // Reset form
        setFormData({
            title: "",
            amount: "",
            category: "",
            date: new Date().toISOString().split('T')[0],
            description: "",
            status: "paid",
        });
        setIsDialogOpen(false);
    };

    return (
        <AppLayout title="Expense Notes">
            <div className="px-4 py-6 space-y-4 max-w-lg mx-auto pb-24">
                {/* Search */}
                <div className="relative animate-fade-in-up">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                    {filterButtons.map((filter) => (
                        <Button
                            key={filter.value}
                            variant={filterStatus === filter.value ? "default" : "gpt"}
                            size="sm"
                            onClick={() => setFilterStatus(filter.value)}
                            className="flex-shrink-0"
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>

                {/* Results Count */}
                <p className="text-sm text-muted-foreground animate-fade-in">
                    {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                </p>

                {/* Expense List */}
                <div className="space-y-2">
                    {filteredExpenses.map((expense, index) => (
                        <ExpenseCard
                            key={expense.id}
                            {...expense}
                            animationDelay={200 + index * 50}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {filteredExpenses.length === 0 && (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-16 h-16 rounded-3xl bg-muted mx-auto mb-4 flex items-center justify-center">
                            <StickyNote className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-foreground mb-1">No expenses found</h3>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your search or filter
                        </p>
                    </div>
                )}

                {/* Floating Add Expense Button */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <div className="fixed bottom-24 right-4 z-40">
                            <Button
                                size="lg"
                                className="rounded-full h-14 w-14 shadow-soft-xl animate-fade-in-up"
                                style={{ animationDelay: "400ms" }}
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Expense</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Title <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    placeholder="e.g., Office Supplies"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Amount <span className="text-destructive">*</span>
                                </label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Category <span className="text-destructive">*</span>
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full h-11 pl-9 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Status <span className="text-destructive">*</span>
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: "paid" })}
                                        className={`flex-1 h-11 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${formData.status === "paid"
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                                            }`}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-sm font-medium">Paid</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: "pending" })}
                                        className={`flex-1 h-11 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${formData.status === "pending"
                                            ? "border-yellow-500 bg-yellow-500/10 text-yellow-600"
                                            : "border-border bg-background text-muted-foreground hover:border-yellow-500/50"
                                            }`}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-sm font-medium">Pending</span>
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Description (Optional)
                                </label>
                                <textarea
                                    placeholder="Add notes about this expense..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-20 px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="gpt"
                                    className="flex-1"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Add Expense
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
