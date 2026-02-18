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
}

module.exports = ProductModel;
