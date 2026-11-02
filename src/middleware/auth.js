import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: 'Sign in to continue.' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id username email');
    if (!user) return res.status(401).json({ message: 'Your session is no longer valid.' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
}
