import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import axios from 'axios';
import prisma from '../database.js';

export const initiatePayment = async (req, res) => {
    const { bookingId, paymentMethod } = req.body;
    const userId = req.user.id;

    try {
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, userId },
        });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status !== BookingStatus.UNCONFIRMED)
            return res.status(400).json({ message: 'Booking already confirmed or cancelled' });

        const existingPayment = await prisma.payment.findFirst({
            where: { bookingId: booking.id, status: PaymentStatus.PENDING },
        });
        if (existingPayment) return res.json({ payment: existingPayment });

        // Khalti Payment
        if (paymentMethod === PaymentMethod.KHALTI) {
            const payload = {
                return_url: `${process.env.FRONTEND_URL}/payment-verify`,
                purchase_order_id: booking.id,
                purchase_order_name: `Booking_${booking.id}`,
                amount: Math.round(booking.totalPrice * 100),
                website_url: process.env.FRONTEND_URL,
            };

            const resp = await axios.post(
                'https://a.khalti.com/api/v2/epayment/initiate/',
                payload,
                { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
            );

            if (!resp.data?.pidx || !resp.data?.payment_url)
                return res.status(400).json({ message: 'Invalid Khalti response' });

            const payment = await prisma.payment.create({
                data: {
                    bookingId: booking.id,
                    amount: booking.totalPrice,
                    paymentMethod: PaymentMethod.KHALTI,
                    status: PaymentStatus.PENDING,
                    pidx: resp.data.pidx,
                },
            });

            return res.json({ paymentUrl: resp.data.payment_url, payment });
        }

        // Cash on Arrival
        if (paymentMethod === PaymentMethod.COD) {
            const [payment] = await prisma.$transaction([
                prisma.payment.create({
                    data: {
                        bookingId: booking.id,
                        amount: booking.totalPrice,
                        paymentMethod: PaymentMethod.COD,
                        status: PaymentStatus.COMPLETED,
                    },
                }),
                prisma.booking.update({
                    where: { id: booking.id },
                    data: { status: BookingStatus.CHECKEDOUT },
                }),
            ]);

            return res.json({ message: 'Booking placed successfully', payment });
        }

        return res.status(400).json({ message: 'Unsupported payment method' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
    const { pidx } = req.body;
    const userId = req.user?.id;

    try {
        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/lookup/',
            { pidx },
            { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
        );

        const payment = await prisma.payment.findUnique({ where: { pidx } });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        const status = response.data.status?.toString().toLowerCase();
        const isSuccess = status === 'completed' || status === 'success';
        let updatedPayment = payment;

        if (isSuccess && payment.status !== PaymentStatus.COMPLETED) {
            [updatedPayment] = await prisma.$transaction([
                prisma.payment.update({
                    where: { pidx },
                    data: { status: PaymentStatus.COMPLETED },
                }),
                prisma.booking.update({
                    where: { id: payment.bookingId },
                    data: { status: BookingStatus.CHECKEDOUT },
                }),
            ]);
        }

        return res.json({
            success: isSuccess,
            message: isSuccess ? 'Payment verified successfully' : 'Payment pending or failed',
            bookingId: updatedPayment.bookingId,
        });
    } catch (error) {
        console.error('Khalti lookup error:', error.response?.data || error);
        return res.status(400).json({ message: error.response?.data?.message || 'Payment verification failed' });
    }
};