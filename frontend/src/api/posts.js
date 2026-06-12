import api from './axios';

export const getPosts = (cursor = null) =>
  api.get('/posts', { params: cursor ? { cursor } : {} });

export const createPost = (formData) =>
  api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getPost = (postId) => api.get(`/posts/${postId}`);

export const deletePost = (postId) => api.delete(`/posts/${postId}`);
