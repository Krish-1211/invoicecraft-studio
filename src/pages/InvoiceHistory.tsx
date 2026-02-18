import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Download, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { useInvoices } from "@/hooks/useData";

const InvoiceHistory: React.FC = () => {
  const navigate = useNavigate();
  const { data: invoicesData } = useInvoices();
  const invoices = invoicesData || [];

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = invoices.filter((inv: any) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || inv.status.toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8 animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">View and manage all your invoices.</p>
        </div>
        <Button size="sm" onClick={() => navigate("/invoices/new")}>
          <Plus className="w-4 h-4 mr-1" /> New Invoice
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(["All", "Paid", "Pending", "Overdue"] as const).map(s => {
          const count = s === "All"
            ? invoices.length
            : invoices.filter((i: any) => i.status.toLowerCase() === s.toLowerCase()).length;
          const amount = s === "All"
            ? invoices.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
            : invoices.filter((i: any) => i.status.toLowerCase() === s.toLowerCase()).reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`stat-card text-left transition-all ${filterStatus === s ? "ring-2 ring-primary" : "hover:border-primary/40"}`}
            >
              <p className="text-xs text-muted-foreground font-medium">{s === "All" ? "All Invoices" : s}</p>
              <p className="text-lg font-semibold mt-0.5">{count}</p>
              <p className="text-xs text-muted-foreground">${amount.toFixed(2)}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search invoices…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} invoices</span>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No invoices found.</td></tr>
            )}
            {filtered.map(inv => (
              <tr key={inv.id}>
                <td className="font-medium text-primary">{inv.invoiceNumber}</td>
                <td className="text-foreground">{inv.clientName}</td>
                <td className="text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</td>
                <td className="text-muted-foreground">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td>
                <td className="font-semibold">${inv.amount.toFixed(2)}</td>
                <td><StatusBadge status={inv.status} /></td>
                <td>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceHistory;
