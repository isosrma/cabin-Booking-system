import express from "express";
import { accessTo, protectedRoutes } from "../middleware/protectedRoutes.js";
import { createBooking, deleteBooking, getAllBookings, getOwnBooking, updateBooking, updateBookingStatus } from "../controller/booking.controller.js";

const router = express.Router();
router.post("/",protectedRoutes,accessTo("ADMIN"),createBooking);
router.get("/",protectedRoutes,accessTo("ADMIN"),getAllBookings);
router.patch("/:id",protectedRoutes,accessTo("ADMIN"),updateBooking);
router.delete("/:id",protectedRoutes,accessTo("ADMIN"),deleteBooking);
router.get("/user",protectedRoutes,accessTo("USER"),getOwnBooking);
router.patch("/:id/status",protectedRoutes,accessTo("ADMIN"),updateBookingStatus);

export default router;

