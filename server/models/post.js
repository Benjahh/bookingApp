import { dbclient, handleDBConnection } from '../dbConfig/index.js';

export const createPostQuery = async (userId, { description, image }) => {
  try {
    await handleDBConnection();
    const {
      rows: [createdPost],
    } = await dbclient.query(
      'INSERT INTO "post" ("userId", description, image) VALUES ($1, $2, $3) RETURNING *',
      [userId, description, image]
    );

    return {
      sucess: true,
      message: 'Post created successfully',
      data: createdPost,
    };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};

export const getPostsQuery = async (userId, search) => {
  try {
    await handleDBConnection();
    const {
      rows: [user],
    } = await dbclient.query('SELECT * FROM "user" WHERE id = $1 ', [userId]);

    const {
      rows: [posts],
    } = await dbclient.query(
      'SELECT * FROM "post" WHERE description ILIKE $1',
      [`%${search}%`]
    );

    const friends = user?.friends?.toString().split(',') || [];
    friends.push(userId);

    const friendsPosts = posts.filter((post) =>
      friends.includes(post.userId.toString())
    );
    const otherPosts = posts.filter(
      (post) => !friends.includes(post.userId.toString())
    );

    const postsRes =
      friendsPosts.length > 0
        ? search
          ? friendsPosts
          : [...friendsPosts, ...otherPosts]
        : posts;

    return { success: true, message: 'Successfully', data: postsRes };
  } catch (error) {
  } finally {
    await dbclient.end();
  }
};

export const getPostQuery = async (id) => {
  try {
    await handleDBConnection();
    const {
      rows: [post],
    } = await dbclient.query('SELECT * FROM "post" WHERE rowid = $1 ', [id]);
    return { success: true, message: 'Successfully', data: post };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};

export const getUserPostQuery = async (id) => {
  try {
    await handleDBConnection();
    const {
      rows: [post],
    } = await dbclient.query('SELECT * FROM "post" WHERE "userId"= $1 ', [id]);
    return { success: true, message: 'Successfully', data: post };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};

export const getCommentsQuery = async (postId) => {
  try {
    await handleDBConnection();
    const {
      rows: [comment],
    } = await dbclient.query('SELECT * FROM "comment" WHERE "postId" = $1 ', [
      postId,
    ]);
    return { success: true, message: 'Successfully', data: comment };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};

export const likePostQuery = async (userId, postId) => {
  try {
    await handleDBConnection();
    const {
      rows: [post],
    } = await dbclient.query('SELECT * FROM "post" WHERE rowid = $1 ', [
      postId,
    ]);

    const index = post.likes.findIndex((pid) => pid === String(userId));

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((pid) => pid !== String(userId));
    }

    const {
      rows: [newPost],
    } = await dbclient.query(
      'INSERT INTO "post" (likes) VALUES "" RETURNING *'
    );

    return { success: true, message: 'Successfully', data: newPost };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};

export const likePostCommentQuery = async (userId, { id, rid }) => {
  try {
    handleDBConnection();
    if (rid === undefined || rid === null || rid === `false`) {
      const {
        rows: [comment],
      } = await dbclient.query('SELECT * FROM "comment" WHERE rowid = $1  ', [
        id,
      ]);

      const index = comment.likes.findIndex((el) => el === String(userId));

      if (index === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter((i) => i !== String(userId));
      }

      const {
        rows: [newComment],
      } = await dbclient.query(
        'INSERT INTO "comment" (likes) VALUES "" RETURNING * '
      );
    } else {
      const {
        rows: [replyComments],
      } = await dbclient.query('SELECT * FROM "reply" WHERE rowid = $1  ', [
        rid,
      ]);

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
    }

    const {
      rows: [updatedComment],
    } = await dbclient.query(
      'UPDATE "replies" SET likes = $3  WHERE rowid = $1 AND "commentId" = $2 ',
      [rid, id, replyComments.replies[0].likes]
    );

    return { success: true, message: 'Successfully', data: updatedComment };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};

export const commentPost = async ({ comment, from }, userId, postId) => {
  try {
    await handleDBConnection();
    const {
      rows: [newComment],
    } = await dbclient.query(
      'INSERT INTO "comment" (comment, from, "userId", "postId") VALUES ($1, $2, $3, $4) RETURNING *',
      [comment, from, userId, postId]
    );

    const {
      rows: [updatedPost],
    } = await dbclient.query(
      'UPDATE "post" SET "commmentId" = array_append(commentId, $2) WHERE rowid = $1 RETURNING *',
      [postId, newComment.rowid]
    );

    return { success: true, message: 'Successfully', data: updatedPost };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
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
      rows: [comment],
    } = await dbclient.query(
      'INSERT INTO "comment" ("comment", "replyAt", "from", "userId", "createdAt") VALUES ($2, $3, $4, $5, $6) WHERE rowid = $1 RETURNING *',
      [commentId, comment, replyAt, from, userId, Date.now()]
    );
    return { success: true, message: 'Successfully', data: comment };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};

export const deletePostQuery = async (postId) => {
  try {
    handleDBConnection();
    await dbclient.query('DELETE FROM "post" WHERE rowid = $1', [postId]);

    return { success: true, message: 'Deleted uccessfully' };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};
