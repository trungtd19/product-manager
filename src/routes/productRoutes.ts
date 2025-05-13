import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Product } from "../models/Product";
import products from "../data/products.json";

const router = Router();

const upload = multer({ dest: path.join(__dirname, "../../public/uploads") });

const dataFile = path.join(__dirname, "../data/products.json");

const saveProducts = (data: Product[]) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

router.get("/", (req, res) => {
  try {
    // Đọc dữ liệu từ file JSON mỗi khi route được gọi
    const rawData = fs.readFileSync(dataFile, "utf-8");
    const products: Product[] = JSON.parse(rawData);

    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const sort = req.query.sort as string || "asc";

    if (!Array.isArray(products)) {
      throw new Error("Products data is not an array.");
    }

    let sorted: Product[] = [...products];
    if (sort === "asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "desc") sorted.sort((a, b) => b.price - a.price);

    const paginated = sorted.slice((page - 1) * size, page * size);

    res.render("index", {
      products: paginated,
      page,
      size,
      total: products.length,
    });
  } catch (error) {
    console.error("Error in / route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/add", (req, res) => {
  res.render("add");
});

router.post("/add", upload.array("images"), (req, res) => {
  const { name, price, area, description, notes } = req.body;
  const imageFiles = req.files as Express.Multer.File[];
  const images = imageFiles.map(file => "/uploads/" + file.filename);

  const newProduct: Product = {
    id: Date.now().toString(),
    name,
    price: parseFloat(price),
    area: parseFloat(area),
    description,
    notes,
    images,
  };

  // Kiểm tra xem sản phẩm có trùng ID hay không
  const existingProduct = products.find((p: Product) => p.id === newProduct.id);
  if (existingProduct) {
    return res.status(400).send("Error: Product with the same ID already exists.");
  }

  const updatedProducts = [...products, newProduct];
  saveProducts(updatedProducts);

  res.redirect("/");
});

router.get("/detail/:id", (req, res) => {
const product = products.find((p: Product) => p.id === req.params.id);
  if (!product) return res.status(404).send("Not found");
  res.render("detail", { product });
});

router.get("/edit/:id", (req, res) => {
  try {
    const rawData = fs.readFileSync(dataFile, "utf-8");
    const products: Product[] = JSON.parse(rawData);

    const product = products.find((p: Product) => p.id === req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Chuyển đổi giá từ đồng sang tỷ đồng
    product.price = product.price / 1_000_000_000;

    res.render("edit", { product });
  } catch (error) {
    console.error("Error in /edit/:id route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/edit/:id", upload.array("images"), (req, res) => {
  try {
    const rawData = fs.readFileSync(dataFile, "utf-8");
    let products: Product[] = JSON.parse(rawData);

    const { name, price, area, description, notes } = req.body;
    const imageFiles = req.files as Express.Multer.File[];
    const images = imageFiles.map(file => "/uploads/" + file.filename);

    const productIndex = products.findIndex((p: Product) => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).send("Product not found");
    }

    // Cập nhật sản phẩm
    products[productIndex] = {
      ...products[productIndex],
      name,
      price: parseFloat(price) * 1_000_000_000, // Chuyển đổi từ tỷ đồng sang đồng
      area: parseFloat(area),
      description,
      notes,
      images: images.length > 0 ? images : products[productIndex].images,
    };

    // Lưu lại file JSON
    saveProducts(products);

    res.redirect("/");
  } catch (error) {
    console.error("Error in /edit/:id route:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
