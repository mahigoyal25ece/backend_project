import { Router } from 'express';
import { createPost, deletePost, getPost, listPosts, updatePost } from '../controllers/post.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', listPosts);
router.get('/:id', getPost);
router.post('/', requireAuth, createPost);
router.patch('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, deletePost);
export default router;
