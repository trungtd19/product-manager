import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Bắt buộc với Render
  },
});

// Ví dụ truy vấn:
(async () => {
  await pool.query(
    "INSERT INTO products (name, price, area, description, notes, images) VALUES ($1, $2, $3, $4, $5, $6)",
    ["Sản phẩm A", 1000000, 50, "Mô tả", "Ghi chú", ["img1.jpg", "img2.jpg"]]
  );
})();