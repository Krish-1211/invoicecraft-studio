import React from 'react';
import { useProductRecommendations } from '@/hooks/useData';
import { getProductImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductRecommendationsProps {
    productId: string;
    onAdd: (product: any) => void;
    title?: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ productId, onAdd, title = "Customers also bought" }) => {
    const { data: recommendations, isLoading } = useProductRecommendations(productId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold tracking-tight">{title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {recommendations.map((product) => (
                    <Card key={product.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors bg-muted/20">
                        <div className="aspect-square bg-muted overflow-hidden">
                            <img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <CardContent className="p-2 space-y-2">
                            <div>
                                <h4 className="text-[11px] font-semibold line-clamp-1 leading-tight">{product.name}</h4>
                                <p className="text-xs font-bold text-primary">${product.price.toFixed(2)}</p>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="w-full h-7 text-[10px] gap-1 px-1"
                                onClick={() => onAdd(product)}
                            >
                                <Plus className="w-3 h-3" />
                                Add
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;
