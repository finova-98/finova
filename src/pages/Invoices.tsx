import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InvoiceCard } from "@/components/cards/InvoiceCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Invoice {
  id: string;
  vendor: string;
  date: string;
  total: number;
  invoice_number: string;
}

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    // Note: We don't have a status field in invoices table yet, so we'll show all for now
    return matchesSearch;
  });

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

        {/* Results Count */}
        {!loading && (
          <p className="text-sm text-muted-foreground animate-fade-in">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Invoice List */}
            {filteredInvoices.length > 0 && (
              <div className="space-y-2">
                {filteredInvoices.map((invoice, index) => (
                  <InvoiceCard
                    key={invoice.id}
                    id={invoice.id}
                    vendor={invoice.vendor}
                    date={invoice.date}
                    amount={invoice.total}
                    status="paid"
                    animationDelay={200 + index * 50}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredInvoices.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No invoices found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "Create your first invoice to get started"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
