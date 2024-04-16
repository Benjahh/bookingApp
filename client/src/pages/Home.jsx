import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CustomButton,
  EditProfile,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TextInput,
  TopBar,
} from '../components';

import { Link } from 'react-router-dom';
import { NoProfile } from '../assets';
import { BsFiletypeGif, BsPersonFillAdd } from 'react-icons/bs';
import { BiImages, BiSolidVideo } from 'react-icons/bi';
import { set, useForm } from 'react-hook-form';
import {
  apiRequest,
  deletePost,
  fetchPosts,
  getUserInfo,
  sendFriendRequest,
} from '../utils';
import { UserLogin } from '../redux/userSlice';

export const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [errMsg, setErrMsg] = useState('');
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  console.log(suggestedFriends);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handlePostSubmit = async (data) => {
    setPosting(true);

    console.log(file);

    setErrMsg('');
    try {
      const res = await apiRequest({
        url: '/posts/create-post',
        token: user?.token,
        method: 'POST',
        data: { data, file },
      });
      if (res?.status === 'failed') {
        setErrMsg(res);
      } else {
        reset({
          description: '',
        });

        setErrMsg('');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPosting(false);
      await fetchPosts(user?.token, dispatch);
    }
  };

  const handlefetchPost = async (data) => {
    await fetchPosts(user?.token, dispatch);
    setLoading(false);
  };
  const handleLikePost = async (data) => {
    await likePost({ uri: uri, token: user?.token });
    await fetchPosts(user?.token, dispatch);
  };

  const handleDelete = async (id) => {
    console.log(user.token);

    await deletePost(id, user.token);
    await fetchPosts(user?.token, dispatch);
  };
  const handleFetchFriendRequest = async () => {
    try {
      const res = await apiRequest({
        url: '/users/get-friend-request',
        token: user?.token,
        method: 'POST',
      });
      console.log(res);
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSuggestedFriends = async () => {
    try {
      const res = await apiRequest({
        url: '/users/suggested-friends',
        token: user?.token,
        method: 'POST',
      });

      setSuggestedFriends(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendFriendRequest = async (id) => {
    try {
      const res = await sendFriendRequest(id, user.token);
      console.log(res);

      handleFetchFriendRequest();
    } catch (error) {
      console.log(error);
    }
  };
  const handleAcceptFriendRequest = async (id, status) => {
    try {
      const res = await apiRequest({
        url: '/users/accept-request',
        token: user?.token,
        method: 'POST',
        data: { rid: id, status },
      });
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleGetUser = async (data) => {
    const res = await getUserInfo(user?.token);
    console.log(res);
    console.log(user.token);
    const newData = { token: user?.token, ...res };
    console.log(newData);
    dispatch(UserLogin(newData));
  };

  useEffect(() => {
    setLoading(true);
    handleGetUser();
    handlefetchPost();
    handleSuggestedFriends();
    handleFetchFriendRequest();
  }, []);

  console.log(friendRequest);

  return (
    <>
      <div className="w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden">
        <TopBar />

        <div className="w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full">
          {/* LEFT */}
          <div className="hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto">
            <ProfileCard user={user} />

            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className="flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg">
            <form
              onSubmit={handleSubmit(handlePostSubmit)}
              className="bg-primary px-4 rounded-lg"
            >
              <div className="w-full flex items-center gap-2 py-4 border-b border-[#66666645]">
                <img
                  src={user?.profileUrl ?? NoProfile}
                  alt="User Image"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <TextInput
                  styles="w-full rounded-full py-5"
                  placeholder="What's on your mind...."
                  name="description"
                  register={register('description', {
                    required: 'Write something about post',
                  })}
                  error={errors.description ? errors.description.message : ''}
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

              <div className="flex items-center justify-between py-4">
                <label
                  htmlFor="imgUpload"
                  className="flex items-center gap-1 text-base text-accent-2 hover:text-accent-1 cursor-pointer"
                >
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="imgUpload"
                    data-max-size="5120"
                    accept=".jpg, .png, .jpeg"
                  />
                  <BiImages />
                  <span>Image</span>
                </label>

                <div>
                  {posting ? (
                    <Loading />
                  ) : (
                    <CustomButton
                      type="submit"
                      title="Post"
                      containerStyles="bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm"
                    />
                  )}
                </div>
              </div>
            </form>

            {loading ? (
              <Loading />
            ) : posts.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  key={post?.id}
                  post={post}
                  user={user}
                  deletePost={handleDelete}
                  likePost={handleLikePost}
                />
              ))
            ) : (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-lg text-accent-2">No Post Available</p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto  ">
            {/* FRIEND REQUEST */}
            <div className="w-full bg-primary shadow-sm rounded-lg px-6 py-5">
              <div className="flex items-center justify-between text-xl text-accent-1 pb-2 border-b border-[#66666645]">
                <span> Friend Requests</span>
                <span>{friendRequest?.length ?? 0}</span>
              </div>

              <div className="w-full flex flex-col gap-4 pt-4">
                {friendRequest?.map(
                  ({
                    requestId,
                    userId,
                    userFirstName,
                    userLastName,
                    userProfession,
                    userProfileUrl,
                  }) => (
                    <div
                      key={userId}
                      className="flex items-center justify-between"
                    >
                      <Link
                        to={'/profile/' + userId}
                        className="w-full flex gap-4 items-center cursor-pointer"
                      >
                        <img
                          src={userProfileUrl ?? NoProfile}
                          alt={userFirstName}
                          className="w-10 h-10 object-cover rounded-full"
                        />
                        <div className="flex-1">
                          <p className="text-base font-medium text-accent-1">
                            {userFirstName} {userLastName}
                          </p>
                          <span className="text-sm text-accent-2">
                            {userProfession ?? 'No Profession'}
                          </span>
                        </div>
                      </Link>

                      <div className="flex gap-1">
                        <CustomButton
                          title="Accept"
                          onClick={() => {
                            handleAcceptFriendRequest(requestId, 'Denied');
                            handleSuggestedFriends();
                          }}
                          containerStyles="bg-[#0444a4] text-xs text-white px-1.5 py-1 rounded-full"
                        />
                        <CustomButton
                          title="Deny"
                          onClick={() => {
                            handleAcceptFriendRequest(requestId, 'Denied');
                            handleSuggestedFriends();
                          }}
                          containerStyles="border border-[#666] text-xs text-accent-1 px-1.5 py-1 rounded-full"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* SUGGESTED FRIENDS */}
            <div className="w-full bg-primary shadow-sm rounded-lg px-5 py-5">
              <div className="flex items-center justify-between text-lg text-accent-1 border-b border-[#66666645]">
                <span>Friend Suggestion</span>
              </div>
              <div className="w-full flex flex-col gap-4 pt-4">
                {suggestedFriends?.map((friend) => (
                  <div
                    className="flex items-center justify-between"
                    key={friend?.userId}
                  >
                    <Link
                      to={'/profile/' + friend?.userId}
                      key={friend?.userId}
                      className="w-full flex gap-4 items-center cursor-pointer"
                    >
                      <img
                        src={friend?.userProfileUrl ?? NoProfile}
                        alt={friend?.userFirstName}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                      <div className="flex-1 ">
                        <p className="text-base font-medium text-accent-1">
                          {friend?.userFirstName} {friend?.userLastName}
                        </p>
                        <span className="text-sm text-accent-2">
                          {friend?.userProfession ?? 'No Profession'}
                        </span>
                      </div>
                    </Link>

                    <div className="flex gap-1">
                      <button
                        className="bg-[#0444a430] text-sm text-white p-1 rounded"
                        onClick={() => handleSendFriendRequest(friend?.userId)}
                      >
                        <BsPersonFillAdd size={20} className="text-[#0f52b6]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {edit && <EditProfile />}
      </div>
    </>
  );
};
