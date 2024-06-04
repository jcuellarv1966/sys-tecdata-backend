import express from "express";
import expressAsyncHandler from "express-async-handler";
import Worker from "../../models/worker.js";
import { isAuth, isAdmin } from '../../utils.js';
import slugify from "slugify";
import multer from "multer";
import shortid from "shortid";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerRouter = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), "../../uploads/workers"));
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + "-" + file.originalname);
    },
});

const uploadImage = multer({ storage });

workerRouter.get("/", async (req, res) => {
    const workers = await Worker.find()
        .sort({ lastName: 1 })
        .populate("workerCategory")
        .populate("workerPlace")
        .exec();
    res.send(workers);
});

workerRouter.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            req.body.slug = slugify(req.body.lastName);
            const newWorker = await new Worker(req.body).save();
            res.json(newWorker);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

workerRouter.post(
    "/uploadimage",
    isAuth,
    isAdmin,
    uploadImage.single("workerImage"),
    expressAsyncHandler(async (req, res) => {
        let file = req.file.filename;
        res.status(200).json({ file });
    })
);

workerRouter.post(
    "/removeimage",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const DIR = 'uploads/workers';
        fs.unlinkSync(DIR + '/' + req.body.file);
        return res.status(200).send('Successfully! Image has been Deleted');
    })
);

workerRouter.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        console.log(req.body);
        const workerId = req.params.id;
        req.body.slug = slugify(req.body.values.lastName);
        const worker = await Worker.findById(workerId);

        if (worker) {
            worker.dni = req.body.values.dni;
            worker.rut = req.body.values.rut;
            worker.firstName = req.body.values.firstName;
            worker.lastName = req.body.values.lastName;
            worker.slug = req.body.slug;
            worker.address = req.body.values.address;
            worker.email = req.body.values.email;
            worker.contactNumber = req.body.values.contactNumber;
            worker.workerCategory = req.body.values.workerCategory;
            worker.workerPlace = req.body.values.workerPlace;
            worker.basicSalary = req.body.values.basicSalary;
            worker.bonifications = req.body.values.bonifications;
            worker.foodSupplier = req.body.values.foodSupplier;
            worker.movilizations = req.body.values.movilizations;
            worker.brutSalary = req.body.values.brutSalary;
            worker.discountESSALUD = req.body.values.discountESSALUD;
            worker.discountFONASA = req.body.values.discountFONASA;
            worker.discountAFP = req.body.values.discountAFP;
            worker.totalDiscounts = req.body.values.totalDiscounts;
            worker.percentDiscountESSALUD = req.body.values.percentDiscountESSALUD;
            worker.percentDiscountFONASA = req.body.values.percentDiscountFONASA;
            worker.percentDiscountAFP = req.body.values.percentDiscountAFP;
            worker.netSalary = req.body.values.netSalary;
            worker.bornDate = req.body.values.bornDate;
            worker.bornDate = req.body.values.bornDate;
            worker.beginDate = req.body.values.beginDate;
            worker.endDate = req.body.values.endDate;
            worker.images = req.body.values.images;
            await worker.save();
            res.send({ message: "worker updated successfully" });
        } else {
            res.status(404).send({ message: "worker not found" });
        }
    })
);

workerRouter.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const worker = await Worker.findById(req.params.id);
        if (worker) {
            await worker.remove();
            res.send({ message: "Worker Deleted" });
        } else {
            res.status(404).send({ message: "Worker Not Found" });
        }
    })
);

const PAGE_SIZE = 11;

workerRouter.get(
    "/admin",
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const workers = await Worker.find()
            .sort("lastName")
            .populate("workerCategory")
            .populate("workerPlace")
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countWorkers = await Worker.countDocuments();

        res.send({
            workers,
            countWorkers,
            page,
            pages: Math.ceil(countWorkers / pageSize),
        });
    })
);

workerRouter.get(
    '/search',
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const pageSize = query.pageSize || PAGE_SIZE;
        const page = query.page || 1;
        const workerCategory = query.workerCategory || '';
        const workerPlace = query.workerPlace || '';
        const basicSalary = query.basicSalary || '';
        const order = query.order || '';
        const searchQuery = query.query || '';

        let workerCategories = [];

        if (workerCategory !== 'all') {
            workerCategories = workerCategory.split(',');
        };

        const queryFilter =
            searchQuery && searchQuery !== 'all'
                ? {
                    lastName: {
                        $regex: searchQuery,
                        $options: 'i',
                    },
                }
                : {};

        const workerCategoryFilter =
            workerCategory && workerCategory !== 'all' ? { workerCategory: { $in: workerCategories } } : {};

        const workerPlaceFilter = workerPlace && workerPlace !== 'all' ? { workerPlace } : {};

        const basicSalaryFilter =
            basicSalary && basicSalary !== 'all'
                ? {
                    basicSalary: {
                        $gte: Number(basicSalary.split(',')[0]),
                        $lte: Number(basicSalary.split(',')[1]),
                    },
                }
                : {};

        const sortOrder =
            order === 'lastNameAsc'
                ? { lastName: 1 }
                : order === 'lastNameDesc'
                    ? { lastName: -1 }
                    : order === 'lowest'
                        ? { basicSalary: 1 }
                        : order === 'highest'
                            ? { basicSalary: -1 }
                            : order === 'newest'
                                ? { beginDate: -1 }
                                : { _id: -1 };

        const workers = await Worker.find({
            ...queryFilter,
            ...workerCategoryFilter,
            ...workerPlaceFilter,
            ...basicSalaryFilter
        })
            .sort(sortOrder)
            .populate("workerCategory")
            .populate("workerPlace")
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countWorkers = await Worker.countDocuments({
            ...queryFilter,
            ...workerCategoryFilter,
            ...workerPlaceFilter,
            ...basicSalaryFilter
        })

        res.send({
            workers,
            countWorkers,
            page,
            pages: Math.ceil(countWorkers / pageSize),
        });
    })
);

workerRouter.get("/:id", async (req, res) => {
    const worker = await Worker.findById(req.params.id)
        .populate("workerCategory")
        .populate("workerPlace")
        .exec();
    if (worker) {
        res.send(worker);
    } else {
        res.status(404).send({ message: "Worker Not Found" });
    }
});

export default workerRouter;