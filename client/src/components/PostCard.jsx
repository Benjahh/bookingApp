import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { NoProfile } from '../assets';
import { BiComment, BiLike, BiSolidLike } from 'react-icons/bi';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { TextInput } from './TextInput';
import { Loading } from './Loading';
import { CustomButton } from './CustomButton';

import { apiRequest } from '../utils';

const getPostComments = async (id) => {
  try {
    const res = await apiRequest({
      url: '/posts/comments/' + id,
      method: 'GET',
    });
    console.log(res);
    return res?.data;
  } catch (error) {
    console.log(error);
  }
};

const ReplyCard = ({ reply, user, handleLike }) => {
  return (
    <div className="w-full py-3">
      <div className="flex gap-3 items-center mb-1">
        <Link to={'/profile/' + reply?.userId?._id}>
          <img
            src={reply?.userId?.profileUrl ?? NoProfile}
            alt={reply?.userId?.firstName}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>

        <div>
          <Link to={'/profile/' + reply?.userId?._id}>
            <p className="font-medium text-base text-accent-1">
              {reply?.userId?.firstName} {reply?.userId?.lastName}
            </p>
          </Link>
          <span className="text-accent-2 text-sm">
            {moment(reply?.created_at).fromNow()}
          </span>
        </div>
      </div>

      <div className="ml-12">
        <p className="text-accent-2 ">{reply?.comment}</p>
        <div className="mt-2 flex gap-6">
          <p
            className="flex gap-2 items-center text-base text-accent-2 cursor-pointer"
            onClick={handleLike}
          >
            {reply?.likes?.includes(user?._id) ? (
              <BiSolidLike size={20} color="blue" />
            ) : (
              <BiLike size={20} />
            )}
            {reply?.likes?.length} Likes
          </p>
        </div>
      </div>
    </div>
  );
};

const CommentForm = ({ user, id, replyAt, getComments }) => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setLoading(true), setErrMsg('');
    try {
      const url = !replyAt
        ? '/posts/comment/' + id
        : '/posts/reply-comment/' + id;

      const newData = {
        comment: data?.comment,
        from: user?.firstname + ' ' + user?.lastname,
        replyAt,
      };

      const res = await apiRequest({
        url,
        data: newData,
        token: user?.token,
        method: 'POST',
      });
      if (res.status === 'failed') {
        setErrMsg(res);
      } else {
        reset({
          comment: '',
        });
        setErrMsg('');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      getComments();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full border-b border-[#66666645]"
    >
      <div className="w-full flex items-center gap-2 py-4">
        <img
          src={user?.profileurl ?? NoProfile}
          alt="User Image"
          className="w-10 h-10 rounded-full object-cover"
        />

        <TextInput
          name="comment"
          styles="w-full rounded-full py-3"
          placeholder={replyAt ? `Reply @${replyAt}` : 'Comment this post'}
          register={register('comment', {
            required: 'Comment can not be empty',
          })}
          error={errors.comment ? errors.comment.message : ''}
        />
      </div>

      {errMsg?.message && (
        <span
          role="alert"
          className={`text-sm ${
            errMsg?.status === 'failed'
              ? 'text-[#f64949fe]'
              : 'text-[#2ba150fe]'
          } mt-0.5`}
        >
          {errMsg?.message}
        </span>
      )}

      <div className="flex items-end justify-end pb-2">
        {loading ? (
          <Loading />
        ) : (
          <CustomButton
            title="Submit"
            type="submit"
            containerStyles="bg-[#0444a4] text-white py-1 px-3 rounded-full font-semibold text-sm"
          />
        )}
      </div>
    </form>
  );
};

export const PostCard = ({ post, user, deletePost, likePost }) => {
  const [showAll, setShowAll] = useState(0);
  const [showReply, setShowReply] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyComments, setReplyComments] = useState(0);
  const [showComments, setShowComments] = useState(0);

  const getComments = async (id) => {
    setReplyComments(0);

    const res = await getPostComments(id);
    console.log(res);
    setComments(res);
    setLoading(false);
  };

  const handleLike = async () => {
    await likePost(uri);
    await getComments(post?.id);
  };

  return (
    <div className="mb-2 bg-primary p-4 rounded-xl">
      <div className="flex gap-3 items-center mb-2">
        <Link to={'/profile/' + post?.userId}>
          <img
            src={post?.userProfileUrl ?? NoProfile}
            alt={post?.userFirstname}
            className="w-14 h-14 object-cover rounded-full"
          />
        </Link>

        <div className="w-full flex justify-between">
          <div>
            <Link to={'/profile/' + post?.userId}>
              <p className="font-medium text-lg text-accent-1">
                {post?.userFirstName} {post?.userLastName}
              </p>
            </Link>
            <span className="text-accent-2">{post?.userLocation}</span>
          </div>

          <span className=" hidden md:flex md:text-accent-2">
            {moment(post?.created_at).fromNow()}
          </span>
        </div>
      </div>

      <div>
        <p className="text-accent-2">
          {showAll === post?.id
            ? post?.description
            : post?.description.slice(0, 300)}

          {post?.description?.length > 301 &&
            (showAll === post?.id ? (
              <span
                className="text-blue ml-2 font-mediu cursor-pointer"
                onClick={() => setShowAll(0)}
              >
                Show Less
              </span>
            ) : (
              <span
                className="text-blue ml-2 font-medium cursor-pointer"
                onClick={() => setShowAll(post?.id)}
              >
                Show More
              </span>
            ))}
        </p>

        {post?.image && (
          <img
            src={post?.image}
            alt="post image"
            className="w-full mt-2 rounded-lg"
          />
        )}
      </div>

      <div
        className="mt-4 flex justify-between items-center px-3 py-2 text-accent-2
      text-base border-t border-[#66666645]"
      >
        <p
          className="flex gap-2 items-center text-base cursor-pointer"
          onClick={() => handleLike('/posts/like' + post?.id)}
        >
          {post?.likes?.includes(user?.id) ? (
            <BiSolidLike size={20} color="blue" />
          ) : (
            <BiLike size={20} />
          )}
          {post?.likes?.length} Likes
        </p>

        <p
          className="flex gap-2 items-center text-base cursor-pointer"
          onClick={() => {
            setShowComments(showComments === post.id ? null : post.id);
            getComments(post?.id);
          }}
        >
          <BiComment size={20} />
          {post?.comments?.length} Comments
        </p>

        {user?.id === post?.userId && (
          <div
            className="flex gap-1 items-center text-base text-accent-1 cursor-pointer"
            onClick={() => deletePost(post?.id)}
          >
            <MdOutlineDeleteOutline size={20} />
            <span>Delete</span>
          </div>
        )}
      </div>

      {/* COMMENTS */}
      {showComments === post?.id && (
        <div className="w-full mt-4 border-t border-[#66666645] pt-4 ">
          <CommentForm
            user={user}
            id={post?.id}
            getComments={() => getComments(post?.id)}
          />

          {loading ? (
            <Loading />
          ) : comments?.length > 0 ? (
            comments?.map((comment) => (
              <div className="w-full py-2" key={comment?.id}>
                <div className="flex gap-3 items-center mb-1">
                  <Link to={'/profile/' + comment?.userId}>
                    <img
                      src={comment?.userProfileUrl ?? NoProfile}
                      alt={comment?.userLastName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>
                  <div>
                    <Link to={'/profile/' + comment?.userId}>
                      <p className="font-medium text-base text-accent-1">
                        {comment?.userFirstName} {comment?.userLastName}
                      </p>
                    </Link>
                    <span className="text-accent-2 text-sm">
                      {moment(comment?.created_at).fromNow()}
                    </span>
                  </div>
                </div>

                <div className="ml-12">
                  <p className="text-accent-2">{comment?.comment}</p>

                  <div className="mt-2 flex gap-6">
                    <p
                      onClick={() => {
                        handleLike('/posts/like-comment/' + comment?.id);
                      }}
                      className="flex gap-2 items-center text-base text-accent-2 cursor-pointer"
                    >
                      {comment?.likes?.includes(user?.id) ? (
                        <BiSolidLike size={20} color="blue" />
                      ) : (
                        <BiLike size={20} />
                      )}
                      {comment?.likes?.length} Likes
                    </p>
                    <span
                      className="text-blue cursor-pointer"
                      onClick={() => setReplyComments(comment?.id)}
                    >
                      Reply
                    </span>
                  </div>

                  {replyComments === comment?.id && (
                    <CommentForm
                      user={user}
                      id={comment?.id}
                      replyAt={comment?.from}
                      getComments={() => getComments(post?.id)}
                    />
                  )}
                </div>

                {/* REPLIES */}

                <div className="py-2 px-8 mt-6">
                  {comment?.replies?.length > 0 && (
                    <p
                      className="text-base text-accent-1 cursor-pointer"
                      onClick={() =>
                        setShowReply(
                          showReply === comment?.replies?._id
                            ? 0
                            : comment?.replies?._id
                        )
                      }
                    >
                      Show Replies ({comment?.replies?.length})
                    </p>
                  )}

                  {showReply === comment?.replies?.id &&
                    comment?.replies?.map((reply) => (
                      <ReplyCard
                        reply={reply}
                        user={user}
                        key={reply?.id}
                        handleLike={() =>
                          handleLike(
                            '/posts/like-comment/' +
                              comment?.id +
                              '/' +
                              reply?.id
                          )
                        }
                      />
                    ))}
                </div>
              </div>
            ))
          ) : (
            <span className="flex text-sm py-4 text-accent-2 text-center">
              No Comments, be first to comment
            </span>
          )}
        </div>
      )}
    </div>
  );
};
