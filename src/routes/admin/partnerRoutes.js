import express from "express";
import expressAsyncHandler from "express-async-handler";
import Partner from "../../models/Partner.js";
import { isAuth, isAdmin } from '../../utils.js';
import slugify from "slugify";
import multer from "multer";
import shortid from "shortid";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const partnerRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "../../uploads/partners"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const uploadImage = multer({ storage });

partnerRouter.get("/", async (req, res) => {
  const partners = await Partner.find().sort("razSocial");
  res.send(partners);
});

partnerRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      console.log(req.body);
      req.body.slug = slugify(req.body.razSocial);
      const newPartner = await new Partner(req.body).save();
      res.json(newPartner);
    } catch (err) {
      console.log(err);
      res.status(400).json({ err: err.message });
    }
  })
);

partnerRouter.post(
  "/uploadimage",
  isAuth,
  isAdmin,
  uploadImage.single("partnerImage"),
  expressAsyncHandler(async (req, res) => {
    let file = req.file.filename;
    res.status(200).json({ file });
  })
);

partnerRouter.post(
  "/removeimage",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const DIR = 'uploads/partners';
    fs.unlinkSync(DIR + '/' + req.body.file);
    return res.status(200).send('Successfully! Image has been Deleted');
  })
);

partnerRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    const partnerId = req.params.id;
    req.body.slug = slugify(req.body.values.razSocial);
    const partner = await Partner.findById(partnerId);

    if (partner) {
      partner.rut = req.body.values.rut;
      partner.razSocial = req.body.values.razSocial;
      partner.slug = req.body.slug;
      partner.address = req.body.values.address;
      partner.email = req.body.values.email;
      partner.contactNumber = req.body.values.contactNumber;
      partner.credit = req.body.values.credit;
      partner.bornDate = req.body.values.bornDate;
      partner.beginDate = req.body.values.beginDate;
      partner.endDate = req.body.values.endDate;
      partner.images = req.body.values.images;
      partner.current = req.body.values.current;
      await partner.save();
      res.send({ message: "Partner updated successfully" });
    } else {
      res.status(404).send({ message: "Partner not found" });
    }
  })
);

partnerRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const partner = await Partner.findById(req.params.id);
    if (partner) {
      await partner.remove();
      res.send({ message: "Partner Deleted" });
    } else {
      res.status(404).send({ message: "Partner Not Found" });
    }
  })
);

const PAGE_SIZE = 11;

partnerRouter.get(
  "/admin",
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const partners = await Partner.find()
      .sort("razSocial")
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countPartners = await Partner.countDocuments();

    res.send({
      partners,
      countPartners,
      page,
      pages: Math.ceil(countPartners / pageSize),
    });
  })
);

partnerRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const credit = query.credit || '';
    const current = query.current || '';
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

    const creditFilter =
      credit && credit !== 'all'
        ? {
          credit: {
            $gte: Number(credit.split(',')[0]),
            $lte: Number(credit.split(',')[1]),
          },
        }
        : {};

    const currentFilter =
      current && current !== 'all'
        ? { current }
        : {};

    const sortOrder =
      order === 'razSocialAsc'
        ? { razSocial: 1 }
        : order === 'razSocialDesc'
          ? { razSocial: -1 }
          : order === 'lowest'
            ? { credit: 1 }
            : order === 'highest'
              ? { credit: -1 }
              : order === 'newest'
                ? { beginDate: -1 }
                : { _id: -1 };

    const partners = await Partner.find({
      ...queryFilter,
      ...creditFilter,
      ...currentFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countPartners = await Partner.countDocuments({
      ...queryFilter,
      ...creditFilter,
      ...currentFilter,
    });

    res.send({
      partners,
      countPartners,
      page,
      pages: Math.ceil(countPartners / pageSize),
    });
  })
);

partnerRouter.get("/:id", async (req, res) => {
  const partner = await Partner.findById(req.params.id);
  if (partner) {
    res.send(partner);
  } else {
    res.status(404).send({ message: "Partner Not Found" });
  }
});

partnerRouter.get("/slug/:slug", async (req, res) => {
  const partner = await Partner.findOne({ slug: req.params.slug });
  if (partner) {
    res.send(partner);
  } else {
    res.status(404).send({ message: "Partner Not Found" });
  }
});

export default partnerRouter;
