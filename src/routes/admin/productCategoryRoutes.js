import express from "express";
import expressAsyncHandler from "express-async-handler";
import ProductCategory from "../../models/productCategory.js";
import { isAuth, isAdmin } from '../../utils.js';
import slugify from "slugify";
import multer from "multer";
import shortid from "shortid";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productCategoryRouter = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), "../../uploads/productscategories"));
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + "-" + file.originalname);
    },
});

const uploadImage = multer({ storage });

productCategoryRouter.get("/", async (req, res) => {
    const productCategories = await ProductCategory.find().sort({ name: 1 });
    res.send(productCategories);
});

productCategoryRouter.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            req.body.slug = slugify(req.body.name);
            const newProductCategory = await new ProductCategory(req.body).save();
            res.json(newProductCategory);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

productCategoryRouter.post(
    "/uploadimage",
    // isAuth,
    // isAdmin,
    uploadImage.single("productCategoryImage"),
    expressAsyncHandler(async (req, res) => {
        let file = req.file.filename;
        res.status(200).json({ file });
    })
);

productCategoryRouter.post(
    "/removeimage",
    // isAuth,
    // isAdmin,
    expressAsyncHandler(async (req, res) => {
        const DIR = 'uploads/productscategories';
        fs.unlinkSync(DIR + '/' + req.body.file);
        return res.status(200).send('Successfully! Image has been Deleted');
    })
);

productCategoryRouter.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const productCategoryId = req.params.id;
        req.body.slug = slugify(req.body.values.name);
        const productCategory = await ProductCategory.findById(productCategoryId);

        if (productCategory) {
            productCategory.name = req.body.values.name;
            productCategory.slug = req.body.slug;
            productCategory.images = req.body.values.images;
            await productCategory.save();
            res.send({ message: "Product Category updated successfully" });
        } else {
            res.status(404).send({ message: "Product Category not found" });
        }
    })
);

productCategoryRouter.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const productCategory = await ProductCategory.findById(req.params.id);
        if (productCategory) {
            await productCategory.remove();
            res.send({ message: "Product Category Deleted" });
        } else {
            res.status(404).send({ message: "Product Category Not Found" });
        }
    })
);

productCategoryRouter.get("/:id", async (req, res) => {
    const productCategory = await ProductCategory.findById(req.params.id);
    if (productCategory) {
        res.send(productCategory);
    } else {
        res.status(404).send({ message: "Product Category Not Found" });
    }
});

productCategoryRouter.get("/slug/:slug", async (req, res) => {
    console.log(req.params.slug);
    const productCategory = await ProductCategory.findOne({ slug: req.params.slug });
    console.log(productCategory);
    if (productCategory) {
        res.send(productCategory);
    } else {
        res.status(404).send({ message: "Product Not Found" });
    }
});

export default productCategoryRouter;