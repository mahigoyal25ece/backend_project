import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
});

function makeAccessToken(userId) {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user._id, username: user.username, email: user.email };
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body ?? {};
    if (![username, email, password].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    const user = await User.create({ username: username.trim(), email: email.trim().toLowerCase(), password });
    res.cookie('accessToken', makeAccessToken(user._id), cookieOptions());
    res.status(201).json({ message: 'Account created.', user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    res.cookie('accessToken', makeAccessToken(user._id), cookieOptions());
    res.json({ message: 'Signed in.', user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export function logout(req, res) {
  res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
  res.json({ message: 'Signed out.' });
}

export function currentUser(req, res) {
  res.json({ user: publicUser(req.user) });
}
