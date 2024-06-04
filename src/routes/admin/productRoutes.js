import express from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "../../models/Product.js";
import { isAuth, isAdmin } from '../../utils.js';
import slugify from "slugify";
import multer from "multer";
import shortid from "shortid";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "../../uploads/products"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const uploadImage = multer({ storage });

productRouter.get("/", async (req, res) => {
  const products = await Product.find()
    .sort({ title: 1 })
    .populate("category");
  res.send(products);
});

productRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      console.log(req.body);
      req.body.slug = slugify(req.body.title);
      const newProduct = await new Product(req.body).save();
      res.json(newProduct);
    } catch (err) {
      console.log(err);
      res.status(400).json({ err: err.message });
    }
  })
);

productRouter.post(
  "/uploadimage",
  isAuth,
  isAdmin,
  uploadImage.single("productImage"),
  expressAsyncHandler(async (req, res) => {
    let file = req.file.filename;
    res.status(200).json({ file });
  })
);

productRouter.post(
  "/removeimage",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const DIR = 'uploads/products';
    fs.unlinkSync(DIR + '/' + req.body.file);
    return res.status(200).send('Successfully! Image has been Deleted');
  })
);

productRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    req.body.slug = slugify(req.body.values.title);
    const product = await Product.findById(productId);

    if (product) {
      product.title = req.body.values.title;
      product.slug = req.body.slug;
      product.category = req.body.values.category;
      product.images = req.body.values.images;
      product.price = req.body.values.price;
      product.brand = req.body.values.brand;
      product.countInStock = req.body.values.countInStock;
      product.description = req.body.values.description;
      product.featuredImage = req.body.values.featuredImage;
      product.isFeatured = req.body.values.isFeatured;
      await product.save();
      res.send({ message: "Product updated successfully" });
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  })
);

productRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.send({ message: "Product Deleted" });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

const PAGE_SIZE = 12;

productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find()
      .sort({ title: 1 })
      .populate("category")
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    let categories = [];

    if (category !== 'all') {
      categories = category.split(',');
    };

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
          title: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
        : {};

    const categoryFilter =
      category && category !== 'all' ? { category: { $in: categories } } : {};

    const ratingFilter =
      rating && rating !== 'all'
        ? {
          rating: {
            $gte: Number(rating),
          },
        }
        : {};

    const priceFilter =
      price && price !== 'all'
        ? {
          price: {
            $gte: Number(price.split(',')[0]),
            $lte: Number(price.split(',')[1]),
          },
        }
        : {};

    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'titleAsc'
          ? { title: 1 }
          : order === 'titleDesc'
            ? { title: -1 }
            : order === 'lowest'
              ? { price: 1 }
              : order === 'highest'
                ? { price: -1 }
                : order === 'toprated'
                  ? { rating: -1 }
                  : order === 'newest'
                    ? { createdAt: -1 }
                    : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });

    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

productRouter.get("/slug/:slug", async (req, res) => {
  console.log(req.params.slug);
  const product = await Product.findOne({ slug: req.params.slug }).populate("category");
  console.log(product);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

export default productRouter;
