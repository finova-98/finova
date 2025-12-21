import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InvoiceCard } from "@/components/cards/InvoiceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

const allInvoices = [
  { id: "1", vendor: "AWS Services", date: "Dec 5, 2024", amount: 1250, status: "paid" as const },
  { id: "2", vendor: "Notion", date: "Dec 3, 2024", amount: 96, status: "paid" as const },
  { id: "3", vendor: "Figma Pro", date: "Dec 1, 2024", amount: 180, status: "pending" as const },
  { id: "4", vendor: "Vercel", date: "Nov 28, 2024", amount: 240, status: "paid" as const },
  { id: "5", vendor: "Slack Business", date: "Nov 25, 2024", amount: 450, status: "paid" as const },
  { id: "6", vendor: "GitHub Enterprise", date: "Nov 20, 2024", amount: 840, status: "pending" as const },
  { id: "7", vendor: "Linear", date: "Nov 15, 2024", amount: 128, status: "paid" as const },
  { id: "8", vendor: "Zoom Pro", date: "Nov 10, 2024", amount: 149, status: "overdue" as const },
];

type FilterStatus = "all" | "paid" | "pending" | "overdue";

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const filteredInvoices = allInvoices.filter((invoice) => {
    const matchesSearch = invoice.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filterButtons: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Overdue", value: "overdue" },
  ];

  return (
    <AppLayout title="Invoices">
      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative animate-fade-in-up">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
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
          {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
        </p>

        {/* Invoice List */}
        <div className="space-y-2">
          {filteredInvoices.map((invoice, index) => (
            <InvoiceCard
              key={invoice.id}
              {...invoice}
              animationDelay={200 + index * 50}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No invoices found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
