import api from './axios';

export const getComments = (postId) => api.get(`/posts/${postId}/comments`);
export const addComment = (postId, body) => api.post(`/posts/${postId}/comments`, { body });
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);

export const addReply = (commentId, body) => api.post(`/comments/${commentId}/replies`, { body });
export const deleteReply = (replyId) => api.delete(`/replies/${replyId}`);
