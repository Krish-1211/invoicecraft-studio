const pool = require('../config/db');

class ClientModel {
    static async findAll() {
        const query = `
      SELECT c.*, COUNT(i.id) as total_invoices 
      FROM clients c 
      LEFT JOIN invoices i ON c.id = i.client_id 
      GROUP BY c.id 
      ORDER BY c.created_at DESC
    `;
        const result = await pool.query(query);
        return result.rows.map(row => ({
            ...row,
            totalInvoices: parseInt(row.total_invoices)
        }));
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async create({ name, email, status = 'active' }) {
        const result = await pool.query(
            'INSERT INTO clients (name, email, status) VALUES ($1, $2, $3) RETURNING *',
            [name, email, status]
        );
        return result.rows[0];
    }

    static async update(id, { name, email, status }) {
        const result = await pool.query(
            'UPDATE clients SET name = $1, email = $2, status = $3 WHERE id = $4 RETURNING *',
            [name, email, status, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = ClientModel;
