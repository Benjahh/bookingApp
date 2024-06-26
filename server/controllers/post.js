import { dbclient } from '../dbConfig/index.js';
import {
  commentPostQuery,
  createPostQuery,
  deletePostQuery,
  getCommentsQuery,
  getPostQuery,
  getPostsQuery,
  getUserPostQuery,
  likePostCommentQuery,
  likePostQuery,
  replyPostCommentQuery,
} from '../models/post.js';
import { userRouter } from '../routes/user.js';

export const createPost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    console.log(req.body);

    if (!req.body.data.description) {
      next('You must provide a description');
      return;
    }

    const { status, message, data } = await createPostQuery(
      userId,
      req.body.data
    );
    res.status(200).json({
      status,
      message,
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message, status: 'failed' });
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { search } = req.body;

    const { status, message, data } = await getPostsQuery(userId, search);

    res.status(200).json({
      status,
      message,
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { success, message, data } = await getPostQuery(id);
    res.status(200).json({ success, message, data });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUserPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { success, message, data } = await getUserPostQuery(id);
    res.status(200).json({ success, message, data });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { success, message, data } = await getCommentsQuery(postId);
    res.status(200).json({ success, message, data });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const likePost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id: postId } = req.params;
    const { status, message, data } = await likePostQuery(userId, postId);
    res.status(200).json({ status, message, data });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const likePostComment = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { success, message, data } = await likePostCommentQuery(
      userId,
      req.params
    );
    res.status(200).json({ success, message, data });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const commentPost = async (req, res, next) => {
  try {
    const comment = req.body;
    const { userId } = req.body.user;
    const { id: postId } = req.params;

    console.log(comment, userId, postId);
    const { status, message, data } = await commentPostQuery(
      comment,
      userId,
      postId
    );
    res.status(200).json({ status, message, data });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const replyPostComment = async (req, res, next) => {
  try {
    const comment = req.body;
    const { userId } = req.body.user;
    const { id: commentId } = req.params;

    const { success, message, data } = await replyPostCommentQuery(
      userId,
      comment,
      commentId
    );
    res.status(200).json({ success, message, data });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { success, message } = await deletePostQuery(id);
    res.status(200).json({ success, message });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
