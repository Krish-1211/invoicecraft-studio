import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients, useProducts, useCreateInvoice } from "@/hooks/useData";

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

const emptyItem = (): LineItem => ({
  id: `row${Date.now()}`,
  productId: "",
  productName: "",
  quantity: 1,
  unitPrice: 0,
});

const InvoiceGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { data: clientsData } = useClients();
  const { data: productsData } = useProducts();
  const createInvoice = useCreateInvoice();

  const clients = clientsData || [];
  const products = productsData || [];

  const [selectedClient, setSelectedClient] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10)); // Used for display/logic? Backend creates `created_at`. I might want to pass it.
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [taxName, setTaxName] = useState("Service Tax");
  const [taxRate, setTaxRate] = useState<number>(0);

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (field === "productId") {
        const prod = products.find((p: any) => p.id === value);
        return { ...item, productId: value as string, productName: prod?.name ?? "", unitPrice: typeof prod?.price === 'string' ? parseFloat(prod.price) : (prod?.price ?? 0) };
      }
      return { ...item, [field]: value };
    }));
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const handleCreate = (status: "draft" | "pending") => {
    if (!selectedClient) return alert("Please select a client");
    if (items.some(i => !i.productId)) return alert("Please select products for all items");

    createInvoice.mutate({
      clientId: selectedClient,
      invoiceNumber: `INV-${Date.now()}`, // Simple generation
      dueDate: dueDate || null, // Optional
      status,
      taxName,
      taxRate,
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.unitPrice }))
    }, {
      onSuccess: () => navigate("/invoices")
    });
  };

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className="p-4 sm:p-8 animate-fade-in max-w-5xl">
      <div className="page-header flex items-center gap-3">
        <button onClick={() => navigate("/invoices")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">New Invoice</h1>
          <p className="page-subtitle">Fill in the details to generate a new invoice.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Invoice meta */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select client…" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — {c.company}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Invoice Date</Label>
              <Input type="date" className="mt-1.5" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" className="mt-1.5" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Line Items</h2>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table min-w-[700px] lg:min-w-0">
              <thead>
                <tr>
                  <th className="w-[40%]">Product</th>
                  <th className="w-[15%]">Qty</th>
                  <th className="w-[20%]">Unit Price</th>
                  <th className="w-[15%] text-right">Subtotal</th>
                  <th className="w-[10%]"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <Select value={item.productId} onValueChange={v => updateItem(item.id, "productId", v)}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select product…" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td>
                      <Input
                        type="number" min={1} value={item.quantity}
                        onChange={e => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="h-8 w-full text-sm"
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-xs">$</span>
                        <Input
                          type="number" min={0} value={item.unitPrice}
                          onChange={e => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="h-8 w-full text-sm"
                        />
                      </div>
                    </td>
                    <td className="font-medium text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    <td className="text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-danger transition-colors p-1"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-border px-4 sm:px-6 py-4">
            <div className="ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={taxName}
                    onChange={e => setTaxName(e.target.value)}
                    placeholder="Tax Name"
                    className="h-7 w-24 text-xs"
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      type="number" min={0}
                      value={taxRate}
                      onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="h-7 w-16 text-xs px-2"
                    />
                    <span className="text-xs">%</span>
                  </div>
                </div>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm">
          <Label>Notes / Terms</Label>
          <textarea
            className="mt-1.5 w-full h-24 px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Payment terms, special instructions, thank-you note…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button variant="outline" onClick={() => navigate("/invoices")} className="w-full sm:w-auto order-3 sm:order-1">Cancel</Button>
          <Button variant="outline" onClick={() => handleCreate("draft")} className="w-full sm:w-auto order-2 sm:order-2">Save as Draft</Button>
          <Button onClick={() => handleCreate("pending")} className="w-full sm:w-auto order-1 sm:order-3">Generate Invoice</Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
