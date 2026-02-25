import prisma from "../database.js";
import cloudinary from "../utils/cloudinary.js";
import { getDataUri } from "../utils/datauri.js";


export const createCabin = async (req, res) => {
    try {
        const {
            name,
            maxCapacity,
            regularPrice,
            discount,
            description,
        } = req.body;

        if (!name || !maxCapacity || !regularPrice) {
            return res.status(400).json({
                message: "Name, maxCapacity and regularPrice are required",
            });
        }

        let imageUrl = null;
        if (req.file) {
            try {
                const fileUrl = getDataUri(req.file);
                const cloudResponse = await cloudinary.uploader.upload(fileUrl.content);
                imageUrl = cloudResponse.secure_url
            } catch (err) {
                return next(new AppError(500, "Failed to upload image"))

            }
        }
        const cabin = await prisma.cabin.create({
            data: {
                name,
                maxCapacity: Number(maxCapacity),
                regularPrice: Number(regularPrice),
                discount: Number(discount) || 0,
                description,
                image: imageUrl,
            },
        });

        res.status(201).json(cabin);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create cabin",
            error: error.message,
        });
    }
};

export const getCabin = async (req, res) => {
    try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const search = req.query.search || "";
            const minPrice = Number(req.query.minPrice) || 0;
            const maxCapacity = Number(req.query.maxCapacity);
            console.log("maxCapacity", maxCapacity)

            const sortBy = req.query.sortBy || "createdAt";
            const order = req.query.order  || "desc"

            const where = {
                name: {
                    contains: search,
                    mode: "insensitive",
            },
            regularPrice: {
                gte: minPrice,
            },
        };
    
        if (maxCapacity) {
            where.maxCapacity = maxCapacity
        }


        const cabins = await prisma.cabin.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        });

        res.json(cabins);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch cabins",
            error: error.message,
        });
    }
};

export const getCabinById = async (req, res) => {
    try {
        const { id } = req.params;

        const cabin = await prisma.cabin.findUnique({
            where: { id },
        });

        if (!cabin) {
            return res.status(404).json({ message: "Cabin not found" });
        }

        res.json(cabin);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch cabin",
            error: error.message,
        });
    }
};

export const updateCabin = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.cabin.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ message: "Cabin not found" });
        }

        const updatedCabin = await prisma.cabin.update({
            where: { id },
            data: req.body,
        });

        res.json(updatedCabin);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update cabin",
            error: error.message,
        });
    }
};

export const deleteCabin = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.cabin.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ message: "Cabin not found" });
        }

        await prisma.cabin.delete({
            where: { id },
        });

        res.json({ message: "Cabin deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete cabin",
            error: error.message,
        });
    }
};


