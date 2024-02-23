import { Router } from 'express';
import userAuth from '../middleware/authMiddleware.js';
import { createPost, getPosts } from '../controllers/post.js';

export const postRouter = Router();

postRouter.post('/create-post', userAuth, createPost);
postRouter.get('/', userAuth, getPosts);
postRouter.post('/:id', userAuth, getPost);

postRouter.post('/get-user-post/:id', userAuth, getUserPost);

postRouter.get('/comments/:postId', getComments);

//like and comment on posts
postRouter.post('/like/:id', userAuth, likePost);
postRouter.post('/like-comment/:id/:rid?', userAuth, likePostComment);
postRouter.post('/comment/:id', userAuth, commentPost);
postRouter.post('/reply-comment/:id', userAuth, replyPostComment);
