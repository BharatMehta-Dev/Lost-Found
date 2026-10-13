const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        {
            userId: userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};


// ===============================
// REGISTER USER
// ===============================
const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            department,
            year,
            hostel
        } = req.body;

        // Check required fields
        if (
            !name ||
            !email ||
            !password ||
            !department ||
            !year
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        // Clean email
        const cleanEmail = email.trim().toLowerCase();

        // Validate institute email
        const collegeDomain = process.env.COLLEGE_EMAIL_DOMAIN;

        if (!collegeDomain) {
            return res.status(500).json({
                success: false,
                message: "College email domain is not configured."
            });
        }

        if (!cleanEmail.endsWith(collegeDomain.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "Please use your institute email address."
            });
        }

        // Password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });
        }

        // Check existing user
        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword,
            department: department.trim(),
            year: year.trim(),
            hostel: hostel ? hostel.trim() : ""
        });

        // Response
        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department,
                year: user.year,
                hostel: user.hostel
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating account."
        });
    }
};


// ===============================
// LOGIN USER
// ===============================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({
            email: cleanEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Generate JWT
        const token = generateToken(user._id.toString());

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department,
                year: user.year,
                hostel: user.hostel,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while logging in."
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};