import jwt from 'jsonwebtoken'
export const protectedRoutes = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    let authToken;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        authToken = authHeader.split(" ")[1];
    }
    console.log(authToken)

    if (!authToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("user", req.user);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const accessTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};
