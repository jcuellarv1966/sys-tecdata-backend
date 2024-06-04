import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import ClientProform from "../../models/clientProform.js";

import { isAuth, isAdmin } from "../../utils.js";

const clientProformsRoutes = express.Router();

clientProformsRoutes.get(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientProforms = await ClientProform.find()
            .sort({ issueDate: 1 })
            .populate('client', 'razSocial')
            .exec();
        res.send(clientProforms);
    })
);

clientProformsRoutes.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            const newClientProform = await new ClientProform(req.body).save();
            res.json(newClientProform);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

clientProformsRoutes.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        console.log(req.body);
        const clientProform = await ClientProform.findById(req.params.id);

        if (clientProform) {
            clientProform.numberProform = req.body.values.numberProform;
            clientProform.client = req.body.values.client;
            clientProform.razSocial = req.body.values.razSocial;
            clientProform.observations = req.body.values.observations;
            clientProform.proformItems = req.body.values.proformItems;
            clientProform.subtotal = req.body.values.subtotal;
            clientProform.igv = req.body.values.igv;
            clientProform.total = req.body.values.total;
            clientProform.issueDate = req.body.values.issueDate;
            clientProform.receptionDate = req.body.values.receptionDate;
            clientProform.acceptanceDate = req.body.values.acceptanceDate;
            clientProform.acceptance = req.body.values.acceptance;
            await clientProform.save();
            res.send({ message: "Client Proform updated successfully" });
        } else {
            res.status(404).send({ message: "Client Proform not found" });
        }
    })
);

clientProformsRoutes.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientProform = await ClientProform.findById(req.params.id);

        if (clientProform) {
            await clientProform.remove();
            res.send({ message: "Client Proform deleted successfully" });
        } else {
            res.status(404).send({ message: "Client Proform not found" });
        }
    })
);

const PAGE_SIZE = 11;

clientProformsRoutes.get(
    "/admin",
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const proforms = await ClientProform.find()
            .sort({ issueDate: -1 })
            .populate('client', 'razSocial')
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countProforms = await ClientProform.countDocuments();

        res.send({
            proforms,
            countProforms,
            page,
            pages: Math.ceil(countProforms / pageSize),
        });
    })
);

clientProformsRoutes.get(
    '/search',
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const pageSize = query.pageSize || PAGE_SIZE;
        const page = query.page || 1;
        const total = query.total || '';
        const acceptance = query.acceptance || false;
        const order = query.order || '';
        const searchQuery = query.query || '';

        const queryFilter =
            searchQuery && searchQuery !== 'all'
                ? {
                    razSocial: {
                        $regex: searchQuery,
                        $options: 'i',
                    },
                }
                : {};

        const totalFilter =
            total && total !== 'all'
                ? {
                    total: {
                        $gte: Number(total.split(',')[0]),
                        $lte: Number(total.split(',')[1]),
                    },
                }
                : {};

        const acceptanceFilter =
            acceptance && acceptance !== 'all'
                ? { acceptance }
                : {};

        const sortOrder =
            order === 'razSocialAsc'
                ? { razSocial: 1 }
                : order === 'razSocialDesc'
                    ? { razSocial: -1 }
                    : order === 'lowest'
                        ? { total: 1 }
                        : order === 'highest'
                            ? { total: -1 }
                            : order === 'newest'
                                ? { issueDate: -1 }
                                : order === 'oldest'
                                    ? { issueDate: 1 }
                                    : { _id: -1 };

        const proforms = await ClientProform.find({
            ...queryFilter,
            ...totalFilter,
            ...acceptanceFilter,
        })
            .sort(sortOrder)
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countProforms = await ClientProform.countDocuments({
            ...queryFilter,
            ...totalFilter,
            ...acceptanceFilter,
        })

        res.send({
            proforms,
            countProforms,
            page,
            pages: Math.ceil(countProforms / pageSize),
        });
    })
);

clientProformsRoutes.get(
    "/findbyclient/:id",
    expressAsyncHandler(async (req, res) => {
        const clientProforns = await ClientProform.find({ client: req.params.id })
            .sort({ issueDate: 1 })
            .populate("client")
            .exec();

        if (clientProforns.length > 0) {
            res.send(clientProforns);
        } else {
            res.status(404).send({ message: "Client Proforms not found" });
        }
    })
);

clientProformsRoutes.get(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const clientProform = await ClientProform.findById(req.params.id)
            .populate("client")
            .exec();
        if (clientProform) {
            res.send(clientProform);
        } else {
            res.status(404).send({ message: 'Client Proform Not Found' });
        }
    })
);

export default clientProformsRoutes;