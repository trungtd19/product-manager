"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const connectPostgres_1 = require("../connectPostgres");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: path_1.default.join(__dirname, "../../public/uploads") });
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const sort = req.query.sort || "asc";
        const sortOrder = sort === "asc" ? "ASC" : "DESC";
        const offset = (page - 1) * size;
        // Truy vấn danh sách sản phẩm
        const productsQuery = `
      SELECT * FROM products
      ORDER BY price ${sortOrder}
      LIMIT $1 OFFSET $2
    `;
        const productsResult = await connectPostgres_1.pool.query(productsQuery, [size, offset]);
        // Truy vấn tổng số sản phẩm
        const totalQuery = "SELECT COUNT(*) AS total FROM products";
        const totalResult = await connectPostgres_1.pool.query(totalQuery);
        const products = productsResult.rows;
        const total = parseInt(totalResult.rows[0].total, 10);
        res.render("index", {
            products,
            page,
            size,
            total,
        });
    }
    catch (error) {
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
        const imageFiles = req.files;
        const images = imageFiles.length > 0
            ? imageFiles.map(file => "/uploads/" + file.filename)
            : [];
        const insertQuery = `
      INSERT INTO products (name, price, area, description, notes, images)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
        await connectPostgres_1.pool.query(insertQuery, [name, parseFloat(price), parseFloat(area), description, notes, images]);
        res.redirect("/");
    }
    catch (error) {
        console.error("Error in /add route:", error);
        res.status(500).send("Internal Server Error");
    }
});
router.get("/detail/:id", async (req, res) => {
    try {
        const productQuery = "SELECT * FROM products WHERE id = $1";
        const productResult = await connectPostgres_1.pool.query(productQuery, [req.params.id]);
        if (productResult.rows.length === 0) {
            return res.status(404).send("Product not found");
        }
        const product = productResult.rows[0];
        res.render("detail", { product });
    }
    catch (error) {
        console.error("Error in /detail/:id route:", error);
        res.status(500).send("Internal Server Error");
    }
});
router.get("/edit/:id", async (req, res) => {
    try {
        const productQuery = "SELECT * FROM products WHERE id = $1";
        const productResult = await connectPostgres_1.pool.query(productQuery, [req.params.id]);
        if (productResult.rows.length === 0) {
            return res.status(404).send("Product not found");
        }
        const product = productResult.rows[0];
        // Chuyển đổi giá từ đồng sang tỷ đồng
        product.price = product.price / 1000000000;
        res.render("edit", { product });
    }
    catch (error) {
        console.error("Error in /edit/:id route:", error);
        res.status(500).send("Internal Server Error");
    }
});
router.post("/edit/:id", upload.array("images"), async (req, res) => {
    try {
        const { name, price, area, description, notes } = req.body;
        const imageFiles = req.files;
        const images = imageFiles.length > 0
            ? imageFiles.map(file => "/uploads/" + file.filename)
            : [];

        const updateQuery = `
      UPDATE products
      SET name = $1, price = $2, area = $3, description = $4, notes = $5, images = $6
      WHERE id = $7
    `;
        await connectPostgres_1.pool.query(updateQuery, [
            name,
            parseFloat(price),
            parseFloat(area),
            description,
            notes,
            images,
            req.params.id,
        ]);

        res.redirect("/");
    }
    catch (error) {
        console.error("Error in /edit/:id route:", error);
        res.status(500).send("Internal Server Error");
    }
});
exports.default = router;
