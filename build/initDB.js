"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connectPostgres_1 = require("./connectPostgres");
const createTable = async () => {
    try {
        await connectPostgres_1.pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        area REAL NOT NULL,
        description TEXT,
        notes TEXT,
        images TEXT[]
      )
    `);
        console.log("✅ Table 'products' created or already exists.");
    }
    catch (err) {
        console.error("❌ Error creating table:", err);
    }
    finally {
        await connectPostgres_1.pool.end(); // Đóng kết nối
    }
};
createTable();
