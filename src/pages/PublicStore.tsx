import React, { useState } from "react";
import { Package, User, Search, Phone, Mail, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useData";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const PublicStore: React.FC = () => {
    const navigate = useNavigate();
    const { data: productsData, isLoading } = useProducts();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const products = productsData || [];

    // Extract unique categories
    const categories = ["All", ...Array.from(new Set(products.map((p: any) => p.category)))];

    const filteredProducts = products.filter((product: any) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-muted/30 font-sans animate-fade-in flex flex-col">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight leading-none">KIM Inventory</h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Public Catalog</p>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                        <User className="w-4 h-4 mr-2" />
                        Admin Login
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                {/* Hero / Info Section */}
                <div className="bg-card border border-border rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Product Catalog</h2>
                        <p className="text-muted-foreground mt-1">
                            Browse our current inventory and stock levels.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-foreground/80">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>orders@kim-inventory.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-primary" />
                                <span>123 Warehouse Dr, Example City</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm text-muted-foreground">To place an order, please contact us<br />directly with the item details.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((c: any) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading catalog...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
                        <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-muted-foreground">No products found fitting your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product: any) => (
                            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center relative border-b border-border">
                                    <Package className="w-16 h-16 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-300" />
                                    <div className="absolute top-3 right-3">
                                        <StatusBadge status={product.status} />
                                    </div>
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{product.category}</p>
                                            <CardTitle className="text-base font-semibold line-clamp-1" title={product.name}>{product.name}</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground font-medium">Available Stock</p>
                                            <p className={`text-lg font-semibold ${product.stock === 0 ? "text-danger" : "text-foreground"}`}>
                                                {product.stock} <span className="text-sm font-normal text-muted-foreground">units</span>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-card border-t border-border py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} KIM Inventory. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicStore;
