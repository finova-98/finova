import { Card } from "@/components/ui/card";
import { ChevronRight, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ExpenseCardProps {
    id: string;
    title: string;
    category: string;
    date: string;
    amount: number;
    status?: "paid" | "pending" | "overdue";
    animationDelay?: number;
}

export function ExpenseCard({
    id,
    title,
    category,
    date,
    amount,
    status = "paid",
    animationDelay = 0,
}: ExpenseCardProps) {
    const navigate = useNavigate();

    const statusColors = {
        paid: "bg-primary/10 text-primary",
        pending: "bg-yellow-500/10 text-yellow-600",
        overdue: "bg-destructive/10 text-destructive",
    };

    return (
        <Card
            className="hover:shadow-gpt-hover transition-all duration-300 cursor-pointer active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay: `${animationDelay}ms` }}
            onClick={() => navigate(`/expenses/${id}`)}
        >
            <div className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
                    <StickyNote className="h-6 w-6 text-accent-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                            {title}
                        </h3>
                        <span className="text-base font-bold text-foreground">
                            ₹{amount.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                            {category} • {date}
                        </p>
                        <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                            statusColors[status]
                        )}>
                            {status}
                        </span>
                    </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
        </Card>
    );
}
