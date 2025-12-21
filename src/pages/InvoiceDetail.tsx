import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Share2, 
  ExternalLink,
  Calendar,
  Building2,
  Hash,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      loadInvoice();
    }
  }, [user, id]);

  const loadInvoice = async () => {
    if (!user || !id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setInvoice(data);
    } catch (error: any) {
      console.error('Error loading invoice:', error);
      navigate('/invoices');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <Button variant="icon" size="icon-sm" onClick={() => navigate('/invoices')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-semibold text-foreground">Invoice Details</h1>
            <div className="w-8" />
          </div>
        </header>
        <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const extractedData = invoice.extracted_data || {};
  const items = extractedData.items || [];
  const tax = extractedData.tax || 0;
  const subtotal = (invoice.total || 0) - tax;
  const notes = extractedData.notes || null;

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
            onClick={() => navigate('/invoices')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-semibold text-foreground">Invoice Details</h1>
          <div className="w-8" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto pb-24">
        {/* Main Info Card */}
        <Card className="animate-fade-in-up">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
                <FileText className="h-7 w-7 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-foreground">
                    {invoice.vendor || 'Unknown Vendor'}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Invoice #{invoice.invoice_number}
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
                <Hash className="h-4 w-4" />
                <span className="text-xs">Invoice #</span>
              </div>
              <p className="font-medium text-foreground text-sm">
                {invoice.invoice_number || 'N/A'}
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
                {invoice.date || new Date(invoice.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {items.length > 0 ? items.map((item: any, index: number) => (
                <div 
                  key={index}
                  className="flex items-start justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm text-foreground">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No line items</p>
              )}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-3 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${(invoice.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {notes && (
          <Card className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
