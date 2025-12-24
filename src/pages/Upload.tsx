import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, FileText, Plus, Trash2, Upload as UploadIcon, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { sendChatMessageWithVision } from "@/lib/openrouter";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export default function Upload() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    vendor: "",
    invoiceNumber: "",
    date: new Date().toISOString().split('T')[0],
    tax: "",
    notes: "",
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, price: 0 }
  ]);

  // Handle file from navigation state
  useEffect(() => {
    if (location.state?.file) {
      handleFileSelect(location.state.file);
    }
  }, [location.state]);

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Extract data from image
    await extractDataFromImage(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const extractDataFromImage = async (file: File) => {
    setIsExtracting(true);
    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Use AI with vision to extract invoice data
      const messages = [
        {
          role: "system" as const,
          content: `You are an expert AI specialized in extracting structured data from invoice and receipt images with high accuracy.

INSTRUCTIONS:
1. Carefully analyze the entire invoice/receipt image
2. Extract ALL visible information accurately
3. Look for these specific fields:
   - Vendor/Company name (usually at the top, in larger text)
   - Invoice number (may be labeled as "Invoice #", "Invoice No.", "Receipt #", etc.)
   - Date (look for "Date", "Invoice Date", "Issued Date", etc.)
   - Line items in a table format (Description/Item Name, Quantity/Qty, Unit Price/Rate, Amount)
   - Tax amounts (GST, VAT, Sales Tax, etc.)
   - Subtotal and Total amounts
   - Any special notes or terms

4. For line items, extract:
   - Complete description (don't truncate)
   - Exact quantity (if not shown, assume 1)
   - Unit price (price per item, not total)

5. Return ONLY a JSON object in this EXACT format with no additional text:
{
  "vendor": "exact company name from invoice",
  "invoiceNumber": "exact invoice/receipt number",
  "date": "YYYY-MM-DD format",
  "tax": 0,
  "notes": "any terms, conditions, or special notes",
  "items": [
    {
      "description": "exact item/service description",
      "quantity": 0,
      "price": 0
    }
  ]
}

IMPORTANT:
- If a field is not visible or unclear, use empty string "" for text fields and 0 for numbers
- Ensure numbers are actual numbers, not strings
- Date must be in YYYY-MM-DD format (convert if needed)
- Extract ALL line items, not just the first one
- Be precise with decimal values`
        },
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: "Please analyze this invoice/receipt image and extract all the data in the JSON format specified. Be thorough and accurate."
            },
            {
              type: "image_url" as const,
              image_url: {
                url: base64
              }
            }
          ]
        }
      ];

      const response = await sendChatMessageWithVision(messages, "google/gemini-2.0-flash-exp:free");
      
      // Parse AI response
      let extractedData;
      try {
        // Try to find JSON in the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        } else {
          extractedData = JSON.parse(response);
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", response);
        throw new Error("Could not extract data from image. Please fill manually.");
      }

      // Validate and clean extracted data
      const cleanedData = {
        vendor: extractedData.vendor?.trim() || "",
        invoiceNumber: extractedData.invoiceNumber?.trim() || "",
        date: extractedData.date || new Date().toISOString().split('T')[0],
        tax: parseFloat(extractedData.tax) || 0,
        notes: extractedData.notes?.trim() || "",
        items: Array.isArray(extractedData.items) && extractedData.items.length > 0
          ? extractedData.items.map((item: any) => ({
              description: item.description?.trim() || "",
              quantity: parseInt(item.quantity) || 1,
              price: parseFloat(item.price) || 0
            }))
          : []
      };

      // Update form with extracted data
      setFormData({
        vendor: cleanedData.vendor || "Not extracted",
        invoiceNumber: cleanedData.invoiceNumber || "Not extracted",
        date: cleanedData.date,
        tax: cleanedData.tax.toString(),
        notes: cleanedData.notes,
      });

      if (cleanedData.items.length > 0) {
        setItems(cleanedData.items);
      } else {
        // Set default item with "Not extracted" message
        setItems([{ description: "Not extracted", quantity: 1, price: 0 }]);
      }

      toast({
        title: "Data extracted!",
        description: "Invoice data has been extracted. Please review and edit if needed.",
      });
    } catch (error) {
      console.error("Extraction error:", error);
      
      // Check if it's a rate limit error
      const errorMessage = error instanceof Error ? error.message : "";
      const isRateLimit = errorMessage.includes("429") || errorMessage.includes("rate limit") || errorMessage.includes("Provider returned error");
      
      // Set "Not extracted" for all fields when extraction fails
      setFormData({
        vendor: "Not extracted",
        invoiceNumber: "Not extracted",
        date: new Date().toISOString().split('T')[0],
        tax: "0",
        notes: "",
      });
      setItems([{ description: "Not extracted", quantity: 1, price: 0 }]);
      
      toast({
        title: isRateLimit ? "Rate limit reached" : "Extraction failed",
        description: isRateLimit 
          ? "API rate limit exceeded. Please fill in the details manually."
          : "Could not extract data automatically. Please fill in the details manually.",
        variant: "destructive",
      });
      
      // Keep the image preview so user can reference it while filling manually
    } finally {
      setIsExtracting(false);
    }
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = parseFloat(formData.tax) || 0;
    return subtotal + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !formData.vendor || !formData.invoiceNumber) {
      toast({
        title: "Missing fields",
        description: "Please fill in vendor and invoice number",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const total = calculateTotal();
      
      const { error } = await supabase.from('invoices').insert({
        user_id: user.id,
        file_url: null,
        file_name: `Manual Entry - ${formData.invoiceNumber}`,
        vendor: formData.vendor,
        date: formData.date,
        total: total,
        invoice_number: formData.invoiceNumber,
        extracted_data: {
          vendor: formData.vendor,
          date: formData.date,
          total: total,
          items: items,
          tax: parseFloat(formData.tax) || 0,
          invoiceNumber: formData.invoiceNumber,
          notes: formData.notes,
        },
      });

      if (error) throw error;

      toast({
        title: "Invoice saved!",
        description: `${formData.invoiceNumber} has been added successfully.`,
      });

      // Reset form
      setFormData({
        vendor: "",
        invoiceNumber: "",
        date: new Date().toISOString().split('T')[0],
        tax: "",
        notes: "",
      });
      setItems([{ description: "", quantity: 1, price: 0 }]);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save invoice';
      toast({
        title: "Save failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Add Invoice">
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto pb-24">
        
        {/* Image Upload Section */}
        {!uploadedFile && (
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5" />
                Upload Invoice Photo (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}>
                <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Click to upload invoice</p>
                <p className="text-xs text-muted-foreground">Upload for auto-extraction or skip to fill manually</p>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <Card className="animate-fade-in-up">
            <CardContent className="pt-6">
              <div className="relative">
                <img src={imagePreview} alt="Invoice preview" className="w-full rounded-lg" />
                {isExtracting && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm font-medium">Extracting data...</p>
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => {
                  setUploadedFile(null);
                  setImagePreview(null);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Image
              </Button>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vendor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Vendor Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., AWS Services Inc."
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  required
                />
              </div>

              {/* Invoice Number & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Invoice Number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="INV-2024-001"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Card */}
          <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Totals & Notes Card */}
          <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-6 space-y-4">
              {/* Tax */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tax Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Notes (Optional)
                </label>
                <Textarea
                  placeholder="Additional notes about this invoice..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Summary */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">${(parseFloat(formData.tax) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="gpt"
              className="flex-1"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
