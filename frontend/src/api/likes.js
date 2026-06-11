import api from './axios';

export const togglePostLike = (postId) => api.post(`/posts/${postId}/likes`);
export const getPostLikers = (postId) => api.get(`/posts/${postId}/likes`);

export const toggleCommentLike = (commentId) => api.post(`/comments/${commentId}/likes`);
export const getCommentLikers = (commentId) => api.get(`/comments/${commentId}/likes`);
