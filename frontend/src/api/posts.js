import api from './axios';

export const getPosts = (page = 1) => api.get(`/posts?page=${page}`);

export const createPost = (formData) =>
  api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deletePost = (postId) => api.delete(`/posts/${postId}`);
