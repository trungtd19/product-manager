import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Product } from "../models/Product";
import { pool } from "../connectPostgres";

const router = Router();

const upload = multer({ dest: path.join(__dirname, "../../public/uploads") });

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const sort = req.query.sort as string || "asc";

    const sortOrder = sort === "asc" ? "ASC" : "DESC";

    const offset = (page - 1) * size;

    // Truy vấn danh sách sản phẩm
    const productsQuery = `
      SELECT * FROM products
      ORDER BY price ${sortOrder}
      LIMIT $1 OFFSET $2
    `;
    const productsResult = await pool.query(productsQuery, [size, offset]);

    // Truy vấn tổng số sản phẩm
    const totalQuery = "SELECT COUNT(*) AS total FROM products";
    const totalResult = await pool.query(totalQuery);

    const products = productsResult.rows;
    const total = parseInt(totalResult.rows[0].total, 10);

    res.render("index", {
      products,
      page,
      size,
      total,
    });
  } catch (error) {
    console.error("Error in / route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/add", (req, res) => {
  res.render("add");
});

router.post("/add", upload.array("images"), async (req, res) => {
  try {
    const { name, price, area, description, notes } = req.body;
    const imageFiles = req.files as Express.Multer.File[];
    const images = imageFiles.map(file => "/uploads/" + file.filename).join(",");

    const insertQuery = `
      INSERT INTO products (name, price, area, description, notes, images)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pool.query(insertQuery, [name, parseFloat(price), parseFloat(area), description, notes, images]);

    res.redirect("/");
  } catch (error) {
    console.error("Error in /add route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    const productQuery = "SELECT * FROM products WHERE id = $1";
    const productResult = await pool.query(productQuery, [req.params.id]);

    if (productResult.rows.length === 0) {
      return res.status(404).send("Product not found");
    }

    const product = productResult.rows[0];
    res.render("detail", { product });
  } catch (error) {
    console.error("Error in /detail/:id route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/edit/:id", async (req, res) => {
  try {

    const productQuery = "SELECT * FROM products WHERE id = $1";
    const productResult = await pool.query(productQuery, [req.params.id]);

    if (productResult.rows.length === 0) {
      return res.status(404).send("Product not found");
    }

    const product = productResult.rows[0];

    // Chuyển đổi giá từ đồng sang tỷ đồng
    product.price = product.price / 1_000_000_000;

    res.render("edit", { product });
  } catch (error) {
    console.error("Error in /edit/:id route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/edit/:id", upload.array("images"), async (req, res) => {
  try {
    const { name, price, area, description, notes } = req.body;
    const imageFiles = req.files as Express.Multer.File[];
    const images = imageFiles.map(file => "/uploads/" + file.filename).join(",");

    const updateQuery = `
      UPDATE products
      SET name = $1, price = $2, area = $3, description = $4, notes = $5, images = $6
      WHERE id = $7
    `;
    await pool.query(updateQuery, [
      name,
      parseFloat(price),
      parseFloat(area),
      description,
      notes,
      images,
      req.params.id,
    ]);

    res.redirect("/");
  } catch (error) {
    console.error("Error in /edit/:id route:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
