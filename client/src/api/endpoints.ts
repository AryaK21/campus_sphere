import api from './client';
import { ApiResponse, User, Subject, Resource, Notice, ForumPost, ForumComment, Placement, Simulation } from '../types';

// Auth Endpoints
export const authApi = {
  login: (data: any) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),
  register: (data: any) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),
  getMe: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
  updateProfile: (data: any) => api.put<ApiResponse<{ user: User }>>('/auth/profile', data),
  toggleSaveResource: (resourceId: string) => api.post<ApiResponse<{ isSaved: boolean; savedResources: string[] }>>(`/auth/save-resource/${resourceId}`),
  getPublicProfile: (userId: string) => api.get<ApiResponse<{ user: User }>>(`/auth/user/${userId}`),
};

// Subjects Endpoints
export const subjectsApi = {
  getAll: (params?: { department?: string; semester?: number | string; search?: string }) =>
    api.get<ApiResponse<{ subjects: Subject[] }>>('/subjects', { params }),
  getById: (id: string) => api.get<ApiResponse<{ subject: Subject }>>(`/subjects/${id}`),
  create: (data: any) => api.post<ApiResponse<{ subject: Subject }>>('/subjects', data),
  update: (id: string, data: any) => api.put<ApiResponse<{ subject: Subject }>>(`/subjects/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/subjects/${id}`),
};

// Resources Endpoints
export const resourcesApi = {
  getAll: (params?: {
    department?: string;
    semester?: number | string;
    subjectId?: string;
    resourceType?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<{ resources: Resource[] }>>('/resources', { params }),
  getById: (id: string) => api.get<ApiResponse<{ resource: Resource }>>(`/resources/${id}`),
  upload: (formData: FormData) =>
    api.post<ApiResponse<{ resource: Resource }>>('/resources/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  rate: (id: string, data: { rating: number; comment?: string }) =>
    api.post<ApiResponse<{ resource: Resource; averageRating: number }>>(`/resources/${id}/rate`, data),
  recordDownload: (id: string) => api.post<ApiResponse<{ downloadCount: number }>>(`/resources/${id}/download`),
  delete: (id: string) => api.delete<ApiResponse>(`/resources/${id}`),
};

// Forum Endpoints
export const forumApi = {
  getPosts: (params?: {
    category?: string;
    tag?: string;
    search?: string;
    status?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<{ posts: ForumPost[] }>>('/forum', { params }),
  getPostById: (id: string) =>
    api.get<ApiResponse<{ post: ForumPost; comments: ForumComment[] }>>(`/forum/${id}`),
  createPost: (data: { title: string; body: string; category: string; tags: string[] }) =>
    api.post<ApiResponse<{ post: ForumPost }>>('/forum', data),
  toggleUpvotePost: (id: string) =>
    api.post<ApiResponse<{ upvotesCount: number; hasUpvoted: boolean }>>(`/forum/${id}/upvote`),
  addComment: (postId: string, data: { content: string; parentCommentId?: string | null }) =>
    api.post<ApiResponse<{ comment: ForumComment }>>(`/forum/${postId}/comments`, data),
  toggleUpvoteComment: (commentId: string) =>
    api.post<ApiResponse<{ upvotesCount: number; hasUpvoted: boolean }>>(`/forum/comments/${commentId}/upvote`),
  markBestAnswer: (postId: string, commentId: string) =>
    api.post<ApiResponse<{ post: ForumPost; bestComment: ForumComment }>>(`/forum/${postId}/comments/${commentId}/best-answer`),
  deletePost: (id: string) => api.delete<ApiResponse>(`/forum/${id}`),
};

// Notice Endpoints
export const noticesApi = {
  getAll: (params?: { category?: string; audience?: string; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ notices: Notice[] }>>('/notices', { params }),
  getById: (id: string) => api.get<ApiResponse<{ notice: Notice }>>(`/notices/${id}`),
  create: (formData: FormData) =>
    api.post<ApiResponse<{ notice: Notice }>>('/notices', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  togglePin: (id: string) => api.patch<ApiResponse<{ pinned: boolean }>>(`/notices/${id}/pin`),
  delete: (id: string) => api.delete<ApiResponse>(`/notices/${id}`),
};

// Placement Endpoints
export const placementsApi = {
  getAll: (params?: { status?: string; department?: string; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ placements: Placement[] }>>('/placements', { params }),
  getById: (id: string) => api.get<ApiResponse<{ placement: Placement }>>(`/placements/${id}`),
  create: (data: any) => api.post<ApiResponse<{ placement: Placement }>>('/placements', data),
  update: (id: string, data: any) => api.put<ApiResponse<{ placement: Placement }>>(`/placements/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/placements/${id}`),
  addExperience: (id: string, data: { roundDetails: string; tips?: string; outcome?: string }) =>
    api.post<ApiResponse<{ placement: Placement }>>(`/placements/${id}/experiences`, data),
};

// Simulations Endpoints
export const simulationsApi = {
  getAll: (params?: { module?: string }) =>
    api.get<ApiResponse<{ simulations: Simulation[] }>>('/simulations', { params }),
  getBySlug: (slug: string) => api.get<ApiResponse<{ simulation: Simulation }>>(`/simulations/${slug}`),
  recordRun: (slug: string) => api.post<ApiResponse<{ runs: number }>>(`/simulations/${slug}/run`),
};

// Admin Endpoints
export const adminApi = {
  getAnalytics: () => api.get<ApiResponse<any>>('/admin/analytics'),
  getUsers: (params?: { role?: string; department?: string; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ users: User[] }>>('/admin/users', { params }),
  updateUserRole: (userId: string, role: string) =>
    api.patch<ApiResponse<{ user: User }>>(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete<ApiResponse>(`/admin/users/${userId}`),
};
