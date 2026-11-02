import mongoose from 'mongoose';
import { Post } from '../models/post.model.js';

const fields = ['name', 'description', 'age'];

function validatePostInput(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Send a JSON object.';
  const keys = Object.keys(body);
  if (keys.some((key) => !fields.includes(key))) return `Only these fields can be changed: ${fields.join(', ')}.`;
  if (!partial && fields.some((key) => body[key] === undefined)) return 'Name, description, and age are required.';
  if (partial && keys.length === 0) return 'Provide at least one field to update.';
  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) return 'Name must be a non-empty string.';
  if (body.description !== undefined && (typeof body.description !== 'string' || !body.description.trim())) return 'Description must be a non-empty string.';
  if (body.age !== undefined && (!Number.isInteger(body.age) || body.age < 1 || body.age > 150)) return 'Age must be a whole number between 1 and 150.';
  return null;
}

export async function createPost(req, res, next) {
  const error = validatePostInput(req.body);
  if (error) return res.status(400).json({ message: error });
  try {
    const post = await Post.create({ ...req.body, name: req.body.name.trim(), description: req.body.description.trim(), author: req.user._id });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

export async function listPosts(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const posts = await Post.find().sort({ createdAt: -1 }).limit(limit).populate('author', 'username');
    res.json({ posts });
  } catch (err) {
    next(err);
  }
}

export async function getPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req, res, next) {
  const error = validatePostInput(req.body, true);
  if (error) return res.status(400).json({ message: error });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'The supplied id is invalid.' });
  try {
    const changes = { ...req.body };
    for (const field of ['name', 'description']) if (changes[field] !== undefined) changes[field] = changes[field].trim();
    const post = await Post.findOneAndUpdate({ _id: req.params.id, author: req.user._id }, changes, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'The supplied id is invalid.' });
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    next(err);
  }
}
