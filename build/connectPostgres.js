"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Bắt buộc với Render
    },
});
// Ví dụ truy vấn:
(async () => {
    await pool.query("INSERT INTO products (name, price, area, description, notes, images) VALUES ($1, $2, $3, $4, $5, $6)", ["Sản phẩm A", 1000000, 50, "Mô tả", "Ghi chú", ["img1.jpg", "img2.jpg"]]);
})();
