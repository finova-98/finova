import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { UploadBox } from "@/components/upload/UploadBox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExtractedData {
  vendor: string;
  date: string;
  total: number;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  tax: number;
  invoiceNumber: string;
}

export default function Upload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setExtractedData(null);
    setError(null);
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsExtracting(true);
    setError(null);

    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock extracted data
    const mockData: ExtractedData = {
      vendor: "AWS Services Inc.",
      date: "December 5, 2024",
      total: 1250.00,
      items: [
        { description: "EC2 Instances - m5.large", quantity: 3, price: 350.00 },
        { description: "S3 Storage - 500GB", quantity: 1, price: 150.00 },
        { description: "CloudFront CDN", quantity: 1, price: 200.00 },
      ],
      tax: 100.00,
      invoiceNumber: "INV-2024-1205",
    };

    setExtractedData(mockData);
    setIsExtracting(false);

    toast({
      title: "Invoice extracted!",
      description: "Data has been successfully extracted from your invoice.",
    });
  };

  return (
    <AppLayout title="Upload Invoice">
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Upload Box */}
        <div className="animate-fade-in-up">
          <UploadBox onFileSelect={handleFileSelect} />
        </div>

        {/* Extract Button */}
        {file && !extractedData && (
          <Button
            className="w-full animate-fade-in-up"
            size="lg"
            onClick={handleExtract}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Extracting data...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Extract Invoice Data
              </>
            )}
          </Button>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <Card className="animate-fade-in-up overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Extraction Complete</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {extractedData.invoiceNumber}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Vendor</p>
                  <p className="font-medium text-foreground">{extractedData.vendor}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Date</p>
                  <p className="font-medium text-foreground">{extractedData.date}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {extractedData.items.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {item.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ${(extractedData.total - extractedData.tax).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">
                    ${extractedData.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">
                    ${extractedData.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="gpt" className="flex-1">
                  Edit
                </Button>
                <Button className="flex-1">
                  Save Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
