"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const products_json_1 = __importDefault(require("../data/products.json"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: path_1.default.join(__dirname, "../../public/uploads") });
const dataFile = path_1.default.join(__dirname, "../data/products.json");
const saveProducts = (data) => {
    fs_1.default.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};
router.get("/", (req, res) => {
    try {
        // Đọc dữ liệu từ file JSON mỗi khi route được gọi
        const rawData = fs_1.default.readFileSync(dataFile, "utf-8");
        const products = JSON.parse(rawData);
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const sort = req.query.sort || "asc";
        if (!Array.isArray(products)) {
            throw new Error("Products data is not an array.");
        }
        let sorted = [...products];
        if (sort === "asc")
            sorted.sort((a, b) => a.price - b.price);
        else if (sort === "desc")
            sorted.sort((a, b) => b.price - a.price);
        const paginated = sorted.slice((page - 1) * size, page * size);
        res.render("index", {
            products: paginated,
            page,
            size,
            total: products.length,
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
router.post("/add", upload.array("images"), (req, res) => {
    const { name, price, area, description, notes } = req.body;
    const imageFiles = req.files;
    const images = imageFiles.map(file => "/uploads/" + file.filename);
    const newProduct = {
        id: Date.now().toString(),
        name,
        price: parseFloat(price),
        area: parseFloat(area),
        description,
        notes,
        images,
    };
    // Kiểm tra xem sản phẩm có trùng ID hay không
    const existingProduct = products_json_1.default.find((p) => p.id === newProduct.id);
    if (existingProduct) {
        return res.status(400).send("Error: Product with the same ID already exists.");
    }
    const updatedProducts = [...products_json_1.default, newProduct];
    saveProducts(updatedProducts);
    res.redirect("/");
});
router.get("/detail/:id", (req, res) => {
    const product = products_json_1.default.find((p) => p.id === req.params.id);
    if (!product)
        return res.status(404).send("Not found");
    res.render("detail", { product });
});
router.get("/edit/:id", (req, res) => {
    try {
        const rawData = fs_1.default.readFileSync(dataFile, "utf-8");
        const products = JSON.parse(rawData);
        const product = products.find((p) => p.id === req.params.id);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        // Chuyển đổi giá từ đồng sang tỷ đồng
        product.price = product.price / 1000000000;
        res.render("edit", { product });
    }
    catch (error) {
        console.error("Error in /edit/:id route:", error);
        res.status(500).send("Internal Server Error");
    }
});
router.post("/edit/:id", upload.array("images"), (req, res) => {
    try {
        const rawData = fs_1.default.readFileSync(dataFile, "utf-8");
        let products = JSON.parse(rawData);
        const { name, price, area, description, notes } = req.body;
        const imageFiles = req.files;
        const images = imageFiles.map(file => "/uploads/" + file.filename);
        const productIndex = products.findIndex((p) => p.id === req.params.id);
        if (productIndex === -1) {
            return res.status(404).send("Product not found");
        }
        // Cập nhật sản phẩm
        products[productIndex] = Object.assign(Object.assign({}, products[productIndex]), { name, price: parseFloat(price) * 1000000000, area: parseFloat(area), description,
            notes, images: images.length > 0 ? images : products[productIndex].images });
        // Lưu lại file JSON
        saveProducts(products);
        res.redirect("/");
    }
    catch (error) {
        console.error("Error in /edit/:id route:", error);
        res.status(500).send("Internal Server Error");
    }
});
exports.default = router;
