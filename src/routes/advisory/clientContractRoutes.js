import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import ClientContract from "../../models/clientContract.js"

import { isAuth, isAdmin } from "../../utils.js";

const clientContractsRoutes = express.Router();

clientContractsRoutes.get(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientContracts = await ClientContract.find()
            .sort({ signedDate: 1 })
            .populate("contractType", "name")
            .populate('client', 'razSocial')
            .exec();
        res.send(clientContracts);
    })
);

clientContractsRoutes.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            const newClientContract = await new ClientContract(req.body).save();
            res.json(newClientContract);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

clientContractsRoutes.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        console.log(req.body);
        const clientContract = await ClientContract.findById(req.params.id);

        if (clientContract) {
            clientContract.numberContract = req.body.values.numberContract;
            clientContract.contractType = req.body.values.contractType;
            clientContract.numberOrder = req.body.values.numberOrder;
            clientContract.numberProject = req.body.values.numberProject;
            clientContract.client = req.body.values.client;
            clientContract.razSocial = req.body.values.razSocial;
            clientContract.observations = req.body.values.observations;
            clientContract.contractItems = req.body.values.contractItems;
            clientContract.subtotal = req.body.values.subtotal;
            clientContract.igv = req.body.values.igv;
            clientContract.total = req.body.values.total;
            clientContract.charges = req.body.values.charges;
            clientContract.balanceOutstanding = req.body.values.balanceOutstanding;
            clientContract.contractClauses = req.body.values.contractClauses;
            clientContract.signedDate = req.body.values.signedDate;
            clientContract.beginDate = req.body.values.beginDate;
            clientContract.endDate = req.body.values.endDate;
            clientContract.rescindedDate = req.body.values.rescindedDate;
            clientContract.cash_credit = req.body.values.cash_credit;
            clientContract.isValid = req.body.values.isValid;
            clientContract.finished = req.body.values.finished;
            await clientContract.save();
            res.send({ message: "Client Contract updated successfully" });
        } else {
            res.status(404).send({ message: "Client Contract not found" });
        }
    })
);

clientContractsRoutes.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientContract = await ClientContract.findById(req.params.id);

        if (clientContract) {
            await clientContract.remove();
            res.send({ message: "Client Contract deleted successfully" });
        } else {
            res.status(404).send({ message: "Client Contract not found" });
        }
    })
);

const PAGE_SIZE = 11;

clientContractsRoutes.get(
    "/admin",
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const contracts = await ClientContract.find()
            .sort({ signedDate: -1 })
            .populate("contractType", "name")
            .populate('client', 'razSocial')
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countContracts = await ClientContract.countDocuments();

        res.send({
            contracts,
            countContracts,
            page,
            pages: Math.ceil(countContracts / pageSize),
        });
    })
);

clientContractsRoutes.get(
    '/search',
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const pageSize = query.pageSize || PAGE_SIZE;
        const page = query.page || 1;
        const numberProject = query.numberProject || '';
        const worker = query.worker || '';
        const category = query.category || '';
        const total = query.total || '';
        const cash_credit = query.cash_credit || '';
        const isValid = query.isValid || '';
        const finished = query.finished || '';
        const order = query.order || '';
        const searchQuery = query.query || '';

        let categories = [];

        if (category !== 'all') {
            categories = category.split(',');
        };

        const queryFilter =
            searchQuery && searchQuery !== 'all'
                ? {
                    razSocial: {
                        $regex: searchQuery,
                        $options: 'i',
                    },
                }
                : {};

        const numberProjectFilter =
            numberProject && numberProject != 'all'
                ? {
                    numberProject: {
                        $regex: numberProject,
                        $options: 'i',
                    },
                }
                : {};

        const workerFilter = worker && worker !== 'all' ? { worker } : {};

        const categoryFilter =
            category && category !== 'all' ? { contractType: { $in: categories } } : {};

        const totalFilter =
            total && total !== 'all'
                ? {
                    total: {
                        $gte: Number(total.split(',')[0]),
                        $lte: Number(total.split(',')[1]),
                    },
                }
                : {};

        const cash_creditFilter =
            cash_credit && cash_credit !== 'all'
                ? { cash_credit }
                : {};

        const isValidFilter =
            isValid && isValid !== 'all'
                ? { isValid }
                : {};

        const finishedFilter =
            finished && finished !== 'all'
                ? { finished }
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
                                ? { signedDate: -1 }
                                : order === 'oldest'
                                    ? { signedDate: 1 }
                                    : { _id: -1 };

        const contracts = await ClientContract.find({
            ...queryFilter,
            ...numberProjectFilter,
            ...workerFilter,
            ...categoryFilter,
            ...totalFilter,
            ...cash_creditFilter,
            ...isValidFilter,
            ...finishedFilter,
        })
            .sort(sortOrder)
            .populate("contractType", "name")
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countContracts = await ClientContract.countDocuments({
            ...queryFilter,
            ...numberProjectFilter,
            ...workerFilter,
            ...categoryFilter,
            ...totalFilter,
            ...cash_creditFilter,
            ...isValidFilter,
            ...finishedFilter,
        })

        res.send({
            contracts,
            countContracts,
            page,
            pages: Math.ceil(countContracts / pageSize),
        });
    })
);

clientContractsRoutes.get(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const clientContract = await ClientContract.findById(req.params.id)
            .populate("client")
            .exec();
        if (clientContract) {
            res.send(clientContract);
        } else {
            res.status(404).send({ message: 'Client Contract Not Found' });
        }
    })
);

export default clientContractsRoutes;