import axios from 'axios';
import { SetPosts } from '../redux/postSlice';

const API_URL = 'http://localhost:3000';

export const API = axios.create({
  baseURL: API_URL,
  responseType: 'json',
});

export const apiRequest = async ({ url, token, data, method }) => {
  try {
    console.log(data);
    console.log(Boolean(token));
    const result = await API(url, {
      method: method || 'GET',
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return result?.data;
  } catch (error) {
    const err = error.response.data;
    console.log(err);
    return { status: err.success, message: err.message };
  }
};

export const fetchPosts = async (token, dispatch, uri, data) => {
  try {
    const res = await apiRequest({
      url: uri || '/posts',
      token: token,
      method: 'GET',
      data: data ?? {},
    });

    dispatch(SetPosts(res?.data));

    return res;
  } catch (error) {
    console.log(error);
  }
};

export const likesPost = async ({ uri, token }) => {
  try {
    const res = await apiRequest({
      url: uri,
      token: token,
      method: 'POST',
    });

    return res;
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (id, token) => {
  console.log(id);
  console.log(token);
  try {
    const res = await apiRequest({
      url: '/posts/' + id,
      token,
      method: 'DELETE',
    });

    console.log(res);
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const getUserInfo = async (token, id) => {
  try {
    const uri = id === undefined ? '/users/get-user' : '/users/get-user/' + id;

    const res = await apiRequest({
      url: uri,
      token: token,
      method: 'POST',
    });

    console.log(res);

    if (res?.message === 'Authentication failed') {
      localStorage.removeItem('user');
      window.alert('User session expired. Please login again');
      window.location.replace('/login');
    }
    console.log(res);
    return res?.data.user;
  } catch (error) {
    console.log(error);
  }
};

export const sendFriendRequest = async (id, token) => {
  try {
    const res = await apiRequest({
      url: '/users/friend-request',
      token: token,
      method: 'POST',
      data: { requestTo: id },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};
