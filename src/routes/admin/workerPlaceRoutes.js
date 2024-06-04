import express from "express";
import expressAsyncHandler from "express-async-handler";
import WorkerPlace from "../../models/workerPlace.js";
import { isAuth, isAdmin } from '../../utils.js';
import slugify from "slugify";

const workerPlaceRouter = express.Router();

workerPlaceRouter.get("/", async (req, res) => {
    const workerPlaces = await WorkerPlace.find()
        .sort({ name: 1 })
        .populate("workerCategory")
        .exec();
    res.send(workerPlaces);
});

workerPlaceRouter.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            req.body.slug = slugify(req.body.name);
            const newWorkerPlace = await new WorkerPlace(req.body).save();
            res.json(newWorkerPlace);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

workerPlaceRouter.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const workerPlaceId = req.params.id;
        req.body.slug = slugify(req.body.values.name);
        const workerPlace = await WorkerPlace.findById(workerPlaceId);

        if (workerPlace) {
            workerPlace.name = req.body.values.name;
            workerPlace.slug = req.body.slug;
            workerPlace.workerCategory = req.body.values.workerCategory;
            workerPlace.basicSalary = req.body.values.basicSalary;
            workerPlace.bonifications = req.body.values.bonifications;
            workerPlace.foodSupplier = req.body.values.foodSupplier;
            workerPlace.movilizations = req.body.values.movilizations;
            workerPlace.brutSalary = req.body.values.brutSalary;
            await workerPlace.save();
            res.send({ message: "Worker Position updated successfully" });
        } else {
            res.status(404).send({ message: "Worker Position not found" });
        }
    })
);

workerPlaceRouter.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const workerPlace = await WorkerPlace.findById(req.params.id);
        if (workerPlace) {
            await workerPlace.remove();
            res.send({ message: "Worker Position Deleted" });
        } else {
            res.status(404).send({ message: "Worker Position Not Found" });
        }
    })
);

workerPlaceRouter.get("/:id", async (req, res) => {
    const workerPlace = await WorkerPlace.findById(req.params.id)
        .populate("workerCategory")
        .exec();
    if (workerPlace) {
        res.send(workerPlace);
    } else {
        res.status(404).send({ message: "Worker Position Not Found" });
    }
});

export default workerPlaceRouter;