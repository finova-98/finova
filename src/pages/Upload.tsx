import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, FileText, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export default function Upload() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
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
