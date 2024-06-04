import express from "express";
import expressAsyncHandler from "express-async-handler";
import WorkerCategory from "../../models/workerCategory.js";
import WorkerPlace from "../../models/workerPlace.js";
import { isAuth, isAdmin } from '../../utils.js';
import slugify from "slugify";

const workerCategoryRouter = express.Router();

workerCategoryRouter.get("/", async (req, res) => {
    const workerCategories = await WorkerCategory.find().sort({ name: 1 });
    res.send(workerCategories);
});

workerCategoryRouter.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            req.body.slug = slugify(req.body.name);
            const newWorkerCategory = await new WorkerCategory(req.body).save();
            res.json(newWorkerCategory);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

workerCategoryRouter.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const workerCategoryId = req.params.id;
        req.body.slug = slugify(req.body.values.name);
        const workerCategory = await WorkerCategory.findById(workerCategoryId);

        if (workerCategory) {
            workerCategory.name = req.body.values.name;
            workerCategory.slug = req.body.slug;
            await workerCategory.save();
            res.send({ message: "Worker Category updated successfully" });
        } else {
            res.status(404).send({ message: "Worker Category not found" });
        }
    })
);

workerCategoryRouter.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const workerCategory = await WorkerCategory.findById(req.params.id);
        if (workerCategory) {
            await workerCategory.remove();
            res.send({ message: "Worker Category Deleted" });
        } else {
            res.status(404).send({ message: "Worker Category Not Found" });
        }
    })
);

workerCategoryRouter.get("/:id", async (req, res) => {
    const workerCategory = await WorkerCategory.findById(req.params.id);
    if (workerCategory) {
        res.send(workerCategory);
    } else {
        res.status(404).send({ message: "Worker Category Not Found" });
    }
});

workerCategoryRouter.post("/workersplaces", async (req, res) => {
    console.log(req.body.selectedCategory);
    WorkerPlace.find({ workerCategory: req.body.selectedCategory })
        .populate("workerCategory")
        .sort({ name: 1 })
        .exec((err, subs) => {
            if (err) console.log(err);
            res.json(subs);
        });
});

workerCategoryRouter.post("/workersplacesfindone", async (req, res) => {
    console.log(req.body.selectedWorkerPlace);
    WorkerPlace.find({ _id: req.body.selectedWorkerPlace })
        .exec((err, workerPlace) => {
            if (err) console.log(err);
            res.json(workerPlace);
        });
});

export default workerCategoryRouter;