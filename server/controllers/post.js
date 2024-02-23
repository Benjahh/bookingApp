import { dbclient } from '../dbConfig/index.js';
import {
  createPostQuery,
  getCommentsQuery,
  getPostQuery,
  getPostsQuery,
  getUserPostQuery,
  likePostCommentQuery,
  likePostQuery,
} from '../models/post.js';

export const createPost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    if (!req.body.description) {
      next('You must provide a description');
      return;
    }

    const { success, message, createdPost } = await createPostQuery(
      userId,
      req.body
    );
    res.status(200).json({
      success,
      message,
      createdPost,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { search } = req.body;

    const { success, message, createdPost } = await getPostsQuery(
      userId,
      search
    );

    res.status(200).json({
      success,
      message,
      createdPost,
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
    const { success, message, data } = await likePostQuery(userId, postId);
    res.status(200).json({ success, message, data });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const likePostComment = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id, rid } = req.params;

    const { success, message, data } = await likePostCommentQuery(id);
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
