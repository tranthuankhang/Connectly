import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Session from '../models/Session.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = 14 * 24 * 3600 * 1000;
export const signUp = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName } = req.body;
        if (!username || !password || !email || !firstName || !lastName) {
            return res.status(400).json({
                message: "Không để trống username, password, email, firstName, lastName"
            });
        }

        const duplicate = await User.findOne({ username });
        if (duplicate) {
            return res.status(400).json({ message: "Username đã tồn tại" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            hashedPassword,
            email,
            displayName: `${firstName} ${lastName}`
        });

        return res.status(204);
    } catch (error) {
        console.error("Lỗi khi gọi signUp", error);
        return res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

export const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "Thiếu username hoặc password."
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: "User hoặc password không chính xác." });
        }

        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

        if (!passwordCorrect) {
            return res.status(401).json({ message: "User hoặc password không chính xác." });
        }

        const accessToken = jwt.sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL }
        );

        const refreshToken = crypto.randomBytes(64).toString('hex');

        await Session.create({
            userId: user.id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: REFRESH_TOKEN_TTL,
        });

        return res.status(200).json({ message: `User ${user.displayName} đã login.`, accessToken });

    } catch (error) {
        console.error("Lỗi khi gọi signIn", error);
        return res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

export const signOut = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;

        if(token){
            await Session.deleteOne({ refreshToken: token});

            res.clearCookie("refreshToken");
        }

        return res.status(204);
    } catch (error) {
        console.error("Lỗi khi gọi signOut", error);
        return res.status(500).json({ message: "Lỗi máy chủ" });
    }
};