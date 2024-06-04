import express from "express";
import expressAsyncHandler from "express-async-handler";
import ClientContractClause from "../../models/clientContractClause.js";
import { isAuth, isAdmin } from '../../utils.js';
import slugify from "slugify";

const clientContractClauseRouter = express.Router();

clientContractClauseRouter.get("/", async (req, res) => {
    const clientContractClauses = await ClientContractClause.find().sort({ name: 1 });
    res.send(clientContractClauses);
});

clientContractClauseRouter.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            req.body.slug = slugify(req.body.name);
            const newClientContractClause = await new ClientContractClause(req.body).save();
            res.json(newClientContractClause);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

clientContractClauseRouter.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientContractClauseId = req.params.id;
        req.body.slug = slugify(req.body.values.name);
        const clientContractClause = await ClientContractClause.findById(clientContractClauseId);

        if (clientContractClause) {
            clientContractClause.name = req.body.values.name;
            clientContractClause.slug = req.body.slug;
            await clientContractClause.save();
            res.send({ message: "Client Contract Clause updated successfully" });
        } else {
            res.status(404).send({ message: "Client Contract Clause not found" });
        }
    })
);

clientContractClauseRouter.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientContractClause = await ClientContractClause.findById(req.params.id);
        if (clientContractClause) {
            await clientContractClause.remove();
            res.send({ message: "Client Contract Clause Deleted" });
        } else {
            res.status(404).send({ message: "Client Contract Clause Not Found" });
        }
    })
);

clientContractClauseRouter.get("/:id", async (req, res) => {
    const clientContractClause = await ClientContractClause.findById(req.params.id);
    if (clientContractClause) {
        res.send(clientContractClause);
    } else {
        res.status(404).send({ message: "Client Contract Clause Not Found" });
    }
});

clientContractClauseRouter.get("/slug/:slug", async (req, res) => {
    console.log(req.params.slug);
    const clientContractClause = await ClientContractClause.findOne({ slug: req.params.slug });
    console.log(clientContractClause);
    if (clientContractClause) {
        res.send(clientContractClause);
    } else {
        res.status(404).send({ message: "Client Contract Clause Not Found" });
    }
});

export default clientContractClauseRouter;