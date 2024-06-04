import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import AccountType from "../../models/AccountType.js";

import { isAuth, isAdmin } from "../../utils.js";

const accountTypesRoutes = express.Router();

accountTypesRoutes.get(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const accountTypes = await AccountType.find()
            .sort({ name: 1 })
            .exec();
        res.send(accountTypes);
    })
);

accountTypesRoutes.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            const newAccountType = await new AccountType(req.body).save();
            res.json(newAccountType);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

accountTypesRoutes.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        console.log(req.body);
        const accountType = await AccountType.findById(req.params.id);

        if (accountType) {
            accountType.name = req.body.values.name;
            accountType.description = req.body.values.description;
            await accountType.save();
            res.send({ message: "Account Type updated successfully" });
        } else {
            res.status(404).send({ message: "Account Type not found" });
        }
    })
);

accountTypesRoutes.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const accountType = await AccountType.findById(req.params.id);

        if (accountType) {
            await accountType.remove();
            res.send({ message: "Account Type deleted successfully" });
        } else {
            res.status(404).send({ message: "Account Type not found" });
        }
    })
);

const PAGE_SIZE = 11;

accountTypesRoutes.get(
    "/admin",
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const accountTypes = await AccountType.find()
            .sort({ name: 1 })
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countAccountTypes = await AccountType.countDocuments();

        res.send({
            accountTypes,
            countAccountTypes,
            page,
            pages: Math.ceil(countAccountTypes / pageSize),
        });
    })
);

accountTypesRoutes.get(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const accountType = await AccountType.findById(req.params.id)
            .sort({ name: 1 })
            .exec();
        if (accountType) {
            res.send(accountType);
        } else {
            res.status(404).send({ message: 'Account Type Not Found' });
        }
    })
);

export default accountTypesRoutes;