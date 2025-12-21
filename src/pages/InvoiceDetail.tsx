import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Mock data - in real app, fetch from API
const mockInvoiceData = {
  id: "1",
  vendor: "AWS Services Inc.",
  vendorAddress: "410 Terry Ave N, Seattle, WA 98109",
  date: "December 5, 2024",
  dueDate: "January 5, 2025",
  invoiceNumber: "INV-2024-1205",
  status: "paid" as const,
  items: [
    { description: "EC2 Instances - m5.large (3x)", quantity: 3, price: 350.00 },
    { description: "S3 Storage - 500GB", quantity: 1, price: 150.00 },
    { description: "CloudFront CDN - 1TB transfer", quantity: 1, price: 200.00 },
    { description: "Route 53 DNS - 10 zones", quantity: 10, price: 50.00 },
  ],
  subtotal: 1150.00,
  tax: 100.00,
  total: 1250.00,
  notes: "Payment received via ACH transfer",
  fileUrl: "#",
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // In real app, fetch invoice by id
  const invoice = mockInvoiceData;

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
                    {invoice.vendor}
                  </h2>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                    statusColors[invoice.status]
                  )}>
                    {invoice.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {invoice.vendorAddress}
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
                {invoice.invoiceNumber}
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
                {invoice.date}
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
              {invoice.items.map((item, index) => (
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
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-3 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">${invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Button variant="gpt" className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="gpt" className="flex-1 gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="gpt" size="icon">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
