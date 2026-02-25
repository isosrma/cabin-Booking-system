import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import prisma from "../database.js"
import { generateOtp } from "../utils/generateOtp.js";
import { sendMail } from "../utils/sendMail.js";


export const registerUser = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            confirmPassword,
            phoneNumber,
            nationality,
            profileImage
        } = req.body;

        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                phoneNumber,
                nationality,
                profileImage
            }
        });

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        res.status(201).json({
            message: "Registered successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const handleForgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Please provide email" });
    }

    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        return res.status(404).json({ email: "Email not registered" });
    }

    const otp = generateOtp();
    await sendMail({
        email: user.email,
        subject: "Reset Password OTP",
        message: `Your OTP is ${otp}`,
    });

    const updatedUser = await prisma.user.update({
        where: { email },
        data: {
            otp,
        }
    });

    return res.status(200).json({ message: "OTP sent to email!" });
};

 export const handleVerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP required" });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        return res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const handleResetPassword = async (req, res) => {
    try {
        const { email, otp, password, confirmPassword } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }

        if (!password || !confirmPassword) {
            return res.status(400).json({
                message: "Please provide password and confirmPassword",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }

        const user = await prisma.user.findFirst({
            where: {
                email,
                otp,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: "Invalid email or OTP",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                otp: null, // clear OTP after use
            },
        });

        return res.status(200).json({
            message: "Password reset successfully!",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};