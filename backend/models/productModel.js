const pool = require('../config/db');

class ProductModel {
    static async findAll() {
        const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create({ name, price, stock, status = 'active' }) {
        const result = await pool.query(
            'INSERT INTO products (name, price, stock, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, price, stock, status]
        );
        return result.rows[0];
    }

    static async update(id, { name, price, stock, status }) {
        const result = await pool.query(
            'UPDATE products SET name = $1, price = $2, stock = $3, status = $4 WHERE id = $5 RETURNING *',
            [name, price, stock, status, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async getRecommendations(productId, limit = 4) {
        // Collaborative Filtering: "Customers who bought this also bought..."
        const coPurchaseQuery = `
            SELECT 
                p.id, 
                p.name, 
                p.price, 
                p.category,
                p.stock,
                p.status,
                COUNT(ii2.product_id) as frequency
            FROM invoice_items ii1
            JOIN invoice_items ii2 ON ii1.invoice_id = ii2.invoice_id
            JOIN products p ON ii2.product_id = p.id
            WHERE ii1.product_id = $1 
              AND ii2.product_id <> $1
              AND p.status = 'active'
            GROUP BY p.id, p.name, p.price, p.category, p.stock, p.status
            ORDER BY frequency DESC
            LIMIT $2
        `;

        try {
            const coPurchaseResult = await pool.query(coPurchaseQuery, [productId, limit]);
            let recommendations = coPurchaseResult.rows;

            // Fallback: If not enough co-purchase data, fill with products from the same category
            if (recommendations.length < limit) {
                const product = await this.findById(productId);
                if (product && product.category) {
                    const remainingLimit = limit - recommendations.length;
                    const excludedIds = [productId, ...recommendations.map(r => r.id)];

                    const categoryQuery = `
                        SELECT * FROM products 
                        WHERE category = $1 
                          AND id != ALL($2::uuid[])
                          AND status = 'active'
                        ORDER BY created_at DESC
                        LIMIT $3
                    `;
                    const categoryResult = await pool.query(categoryQuery, [product.category, excludedIds, remainingLimit]);
                    recommendations = [...recommendations, ...categoryResult.rows];
                }
            }

            // Final Fallback: If still not enough, fill with latest products
            if (recommendations.length < limit) {
                const remainingLimit = limit - recommendations.length;
                const excludedIds = [productId, ...recommendations.map(r => r.id)];
                const generalQuery = `
                    SELECT * FROM products 
                    WHERE id != ALL($1::uuid[])
                      AND status = 'active'
                    ORDER BY created_at DESC
                    LIMIT $2
                 `;
                const generalResult = await pool.query(generalQuery, [excludedIds, remainingLimit]);
                recommendations = [...recommendations, ...generalResult.rows];
            }

            return recommendations;
        } catch (error) {
            console.error('Error in getRecommendations:', error);
            return [];
        }
    }
}

module.exports = ProductModel;
