import { dbclient, handleDBConnection } from '../dbConfig/index.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_KEY,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

await handleDBConnection();

export const createPostQuery = async (userId, { description, image }) => {
  try {
    console.log(userId);

    const photoUrl = await cloudinary.uploader.upload(photo);
    const {
      rows: [createdPost],
    } = await dbclient.query(
      'INSERT INTO "post" ("userId", description, image) VALUES ($1, $2, $3) RETURNING *',
      [userId, description, photoUrl.url]
    );

    return {
      sucess: true,
      message: 'Post created successfully',
      data: createdPost,
    };
  } catch (error) {
    console.log('adaafafasfasfawqotuóquotqojytóqjt', error.message);
  }
};

export const getPostsQuery = async (userId, search) => {
  try {
    const {
      rows: [user],
    } = await dbclient.query('SELECT * FROM "user" WHERE id = $1 ', [userId]);

    let posts = [];

    if (search) {
      const {
        rows: [searchPosts],
      } = await dbclient.query(
        'SELECT * FROM "post" WHERE description ILIKE $1',
        [`%${search}%`]
      );
      posts = [searchPosts];
    } else {
      const {
        rows: [userPosts],
      } = await dbclient.query('SELECT * FROM "post" WHERE "userId" = $1', [
        userId,
      ]);
      posts = [userPosts];
    }

    console.log('PPP', posts);

    const friends = user?.friends?.toString().split(',') || [];
    friends.push(userId);

    console.log('friends', friends);

    const friendsPosts = posts?.filter((post) =>
      friends.includes(post.userId.toString())
    );

    console.log('friendsposts', friendsPosts);

    const otherPosts = posts?.filter(
      (post) => !friends.includes(post.userId.toString())
    );

    console.log('Otherposts', otherPosts);

    const postsRes =
      friendsPosts.length > 0
        ? search
          ? friendsPosts
          : [...friendsPosts, ...otherPosts]
        : posts;

    console.log(postsRes);

    return { success: true, message: 'Successfully', data: postsRes[0] };
  } catch (error) {
    console.log(error);
  }
};

export const getPostQuery = async (postId) => {
  try {
    const {
      rows: [post],
    } = await dbclient.query('SELECT * FROM "post" WHERE id = $1 ', [postId]);
    return { success: true, message: 'Successfully', data: post };
  } catch (error) {
    console.log(error);
  }
};

export const getUserPostQuery = async (id) => {
  try {
    const {
      rows: [post],
    } = await dbclient.query('SELECT * FROM "post" WHERE "userId"= $1 ', [id]);
    return { success: true, message: 'Successfully', data: post };
  } catch (error) {
    console.log(error);
  }
};

export const getCommentsQuery = async (postId) => {
  try {
    const {
      rows: [comment],
    } = await dbclient.query('SELECT * FROM "comment" WHERE "postId" = $1 ', [
      postId,
    ]);
    return { success: true, message: 'Successfully', data: comment };
  } catch (error) {
    console.log(error);
  }
};

export const likePostQuery = async (userId, postId) => {
  try {
    const {
      rows: [post],
    } = await dbclient.query('SELECT * FROM "post" WHERE id = $1 ', [postId]);

    const index = post.likes.findIndex((pid) => pid === String(userId));

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((pid) => pid !== String(userId));
    }
    console.log(post);

    const {
      rows: [newPost],
    } = await dbclient.query(
      'UPDATE "post" SET likes = array_append(likes, $1) WHERE id = $2 RETURNING *',
      [post.likes, postId]
    );

    return { success: true, message: 'Successfully', data: newPost };
  } catch (error) {
    console.log(error);
  }
};

export const likePostCommentQuery = async (userId, { id, rid }) => {
  try {
    let updatedComment;
    let updatedReply;

    handleDBConnection();
    if (rid === undefined || rid === null || rid === `false`) {
      const {
        rows: [comment],
      } = await dbclient.query('SELECT * FROM "comment" WHERE id = $1  ', [id]);

      const index = comment.likes.findIndex((el) => el === String(userId));

      if (index === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter((i) => i !== String(userId));
      }

      const {
        rows: [newComment],
      } = await dbclient.query(
        'UPDATE "comment" SET likes = array_append(likes, $1) WHERE id = $2 RETURNING * ',
        [comment.likes, id]
      );

      updatedComment = newComment;
    } else {
      const {
        rows: [replyComments],
      } = await dbclient.query('SELECT * FROM "reply" WHERE id = $1  ', [rid]);

      const index = replyComments?.replies[0]?.likes.findIndex(
        (i) => i === String(userId)
      );

      if (index === -1) {
        replyComments.replies[0].likes.push(userId);
      } else {
        replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
          (i) => i !== String(userId)
        );

        const query = { _id: id, 'replies._id': rid };

        const updated = {
          $set: {
            'replies.$.likes': replyComments.replies[0].likes,
          },
        };
      }
      const {
        rows: [updatedComment],
      } = await dbclient.query(
        'UPDATE "replies" SET likes = $3  WHERE rowid = $1 AND "commentId" = $2 ',
        [rid, id, replyComments.replies[0].likes]
      );
    }

    return { success: true, message: 'Successfully', data: updatedComment };
  } catch (error) {
    console.log(error);
  }
};

export const commentPostQuery = async ({ comment, from }, userId, postId) => {
  try {
    const {
      rows: [newComment],
    } = await dbclient.query(
      'INSERT INTO "comment" (comment, "from", "userId", "postId") VALUES ($1, $2, $3, $4) RETURNING *',
      [comment, from, userId, postId]
    );

    return { success: true, message: 'Successfully', data: newComment };
  } catch (error) {
    console.log(error);
  }
};

export const replyPostCommentQuery = async (
  userId,
  { comment, replyAt, from },
  commentId
) => {
  try {
    handleDBConnection();
    const {
      rows: [reply],
    } = await dbclient.query(
      'INSERT INTO "reply" ("commentId", "comment",  "from", "userId") VALUES ($1, $2, $3, $4) RETURNING *',
      [commentId, comment, from, userId]
    );
    return { success: true, message: 'Successfully', data: reply };
  } catch (error) {
    console.log(error);
  }
};

export const deletePostQuery = async (postId) => {
  try {
    handleDBConnection();
    await dbclient.query('DELETE FROM "post" WHERE rowid = $1', [postId]);

    return { success: true, message: 'Deleted uccessfully' };
  } catch (error) {
    console.log(error);
  }
};
