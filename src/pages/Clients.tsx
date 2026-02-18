import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2, X, Mail, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/useData";
import { Client, ClientStatus } from "@/data/mockData";

const emptyClient: Omit<Client, "id" | "totalInvoices"> = {
  name: "", email: "", phone: "", company: "", status: "active",
};

const Clients: React.FC = () => {
  const { data: clientsData } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const clients = clientsData || [];

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<Omit<Client, "id" | "totalInvoices">>(emptyClient);

  const filtered = clients.filter((c: any) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setEditing(null); setForm(emptyClient); setModalOpen(true); };
  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, status: c.status });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = () => {
    if (editing) {
      updateClient.mutate({ id: editing.id, ...form });
    } else {
      createClient.mutate(form);
    }
    closeModal();
  };

  const handleDelete = (id: string) => deleteClient.mutate(id);

  return (
    <div className="p-4 sm:p-8 animate-fade-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client relationships.</p>
        </div>
        <Button size="sm" onClick={openAdd} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-1" /> Add Client</Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clients…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">{filtered.length} clients</span>
        </div>
        <span className="text-xs text-muted-foreground sm:hidden">{filtered.length} clients</span>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[900px] lg:min-w-0">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Invoices</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No clients found.</td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Building className="w-3.5 h-3.5" />{c.company}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />{c.email}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />{c.phone}
                    </div>
                  </td>
                  <td className="text-muted-foreground">{c.totalInvoices}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-danger hover:text-danger" onClick={() => handleDelete(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md p-6 animate-in slide-in-from-bottom sm:slide-in-from-none duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">{editing ? "Edit Client" : "Add Client"}</h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input className="mt-1.5" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alice Johnson" />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input className="mt-1.5" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="TechCorp" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input className="mt-1.5" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="alice@example.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input className="mt-1.5" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555-0100" />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ClientStatus }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-end">
              <Button variant="outline" onClick={closeModal} className="w-full sm:w-auto order-2 sm:order-1">Cancel</Button>
              <Button onClick={handleSave} className="w-full sm:w-auto order-1 sm:order-2">{editing ? "Save Changes" : "Add Client"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
