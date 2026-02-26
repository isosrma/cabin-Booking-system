import express from "express";
import dotenv from "dotenv";
import cabinRoutes from "./routes/cabin.route.js";
import authRoutes from "./routes/user.route.js";
import { connectDB } from "./database.js";
import bookingRoutes from './routes/booking.route.js';
import paymentRoutes from './routes/payment.Routes.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Cabin Booking API is running");
});

app.use("/api/v1/cabins", cabinRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
