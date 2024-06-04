import express from "express";
import expressAsyncHandler from "express-async-handler";
import ClientContractType from "../../models/clientContractType.js";
import { isAuth, isAdmin } from '../../utils.js';
import slugify from "slugify";

const clientContractTypeRouter = express.Router();

clientContractTypeRouter.get("/", async (req, res) => {
    const clientContractTypes = await ClientContractType.find().sort({ name: 1 });
    res.send(clientContractTypes);
});

clientContractTypeRouter.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            req.body.slug = slugify(req.body.name);
            const newClientContractType = await new ClientContractType(req.body).save();
            res.json(newClientContractType);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

clientContractTypeRouter.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientContractTypeId = req.params.id;
        req.body.slug = slugify(req.body.values.name);
        const clientContractType = await ClientContractType.findById(clientContractTypeId);

        if (clientContractType) {
            clientContractType.name = req.body.values.name;
            clientContractType.slug = req.body.slug;
            await clientContractType.save();
            res.send({ message: "Client Contract Type updated successfully" });
        } else {
            res.status(404).send({ message: "Client Contract Type not found" });
        }
    })
);

clientContractTypeRouter.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientContractType = await ClientContractType.findById(req.params.id);
        if (clientContractType) {
            await clientContractType.remove();
            res.send({ message: "Client Contract Type Deleted" });
        } else {
            res.status(404).send({ message: "Client Contract Type Not Found" });
        }
    })
);

clientContractTypeRouter.get("/:id", async (req, res) => {
    const clientContractType = await ClientContractType.findById(req.params.id);
    if (clientContractType) {
        res.send(clientContractType);
    } else {
        res.status(404).send({ message: "Client Contract Type Not Found" });
    }
});

clientContractTypeRouter.get("/slug/:slug", async (req, res) => {
    console.log(req.params.slug);
    const clientContractType = await ClientContractType.findOne({ slug: req.params.slug });
    console.log(clientContractType);
    if (clientContractType) {
        res.send(clientContractType);
    } else {
        res.status(404).send({ message: "Client Contract Type Not Found" });
    }
});

export default clientContractTypeRouter;