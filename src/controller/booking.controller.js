import prisma from "../database.js";


export const createBooking = async (req, res) => {
    try {
        const { startDate, endDate, numGuests, observations, cabinId } = req.body;

        if (!startDate || !endDate || !numGuests || !cabinId) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const cabin = await prisma.cabin.findUnique({
            where: { id: cabinId },
        });

        if (!cabin) {
            return res.status(404).json({ message: "Cabin not found" });
        }

        if (numGuests > cabin.maxCapacity) {
            return res.status(400).json({
                message: `Maximum capacity is ${cabin.maxCapacity}`,
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const numNights = Math.ceil(
            (end - start) / (1000 * 60 * 60 * 24)
        );

        if (numNights <= 0) {
            return res.status(400).json({ message: "Invalid booking dates" });
        }

        const pricePerNight = cabin.regularPrice - cabin.discount;
        const cabinPrice = numNights * pricePerNight;

        const totalPrice = cabinPrice; 
        const booking = await prisma.booking.create({
            data: {
                startDate: start,
                endDate: end,
                numNights,
                numGuests,
                cabinPrice,
                extrasPrice: 0,
                totalPrice,
                observations,
                cabinId: cabin.id,
                userId: req.user.id,
            },
        });

        res.status(201).json({ booking });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                cabin: { select: { id: true, name: true } },
                user: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(bookings);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBooking = async (req, res) => {
    try {
        const bookingId = Number(req.params.id);

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                cabin: true,
                user: { select: { id: true, fullName: true, email: true } },
            },
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json(booking);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBooking = async (req, res) => {
    try {
        const bookingId = Number(req.params.id);
        const { startDate, endDate, numGuests, observations,} = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { cabin: true },
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const start = startDate ? new Date(startDate) : booking.startDate;
        const end = endDate ? new Date(endDate) : booking.endDate;
        const guests = numGuests ?? booking.numGuests;

        const numNights = Math.ceil(
            (end - start) / (1000 * 60 * 60 * 24)
        );

        const pricePerNight =
            booking.cabin.regularPrice - booking.cabin.discount;

        const cabinPrice = numNights * pricePerNight;
        const totalPrice = cabinPrice;

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                startDate: start,
                endDate: end,
                numGuests: guests,
                observations,
                numNights,
                cabinPrice,
                extrasPrice: 0,
                totalPrice,
            },
        });

        res.json(updatedBooking);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const bookingId = Number(req.params.id);
        const { status } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status,
            },
        });

        res.json(updatedBooking);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const bookingId = Number(req.params.id);

        await prisma.booking.delete({
            where: { id: bookingId },
        });

        res.json({ message: "Booking deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getOwnBooking = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                cabin: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(bookings);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

