import { Router } from 'express';
import {
  getForumPosts,
  getForumPostById,
  createForumPost,
  toggleUpvotePost,
  addComment,
  toggleUpvoteComment,
  markBestAnswer,
  deleteForumPost,
} from '../controllers/forumController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/', getForumPosts);
router.get('/:id', getForumPostById);
router.post('/', protect, createForumPost);
router.post('/:id/upvote', protect, toggleUpvotePost);
router.post('/:id/comments', protect, addComment);
router.post('/comments/:commentId/upvote', protect, toggleUpvoteComment);
router.post('/:postId/comments/:commentId/best-answer', protect, markBestAnswer);
router.delete('/:id', protect, deleteForumPost);

export default router;
