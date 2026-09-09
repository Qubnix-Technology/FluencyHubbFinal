const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');
const TOKEN_KEY = 'fluencyhubb_admin_token';
const TEACHER_TOKEN_KEY = 'fluencyhubb_teacher_token';
const STUDENT_TOKEN_KEY = 'fluencyhubb_student_token';

export const blogCategories = [
  'Articles',
  'Learning Tips',
  'Career Guidance',
  'Interview Preparation',
  'Technology Updates',
  'Educational Content',
];

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY);

export const setAdminToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getTeacherToken = () => localStorage.getItem(TEACHER_TOKEN_KEY);

export const setTeacherToken = (token) => {
  if (token) {
    localStorage.setItem(TEACHER_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TEACHER_TOKEN_KEY);
  }
};
export const getStudentToken = () => localStorage.getItem(STUDENT_TOKEN_KEY);
export const setStudentToken = (token) => token ? localStorage.setItem(STUDENT_TOKEN_KEY, token) : localStorage.removeItem(STUDENT_TOKEN_KEY);

const authHeaders = (role = 'admin') => {
  const token = role === 'teacher' ? getTeacherToken() : role === 'student' ? getStudentToken() : getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${cleanPath}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.auth ? authHeaders(options.role || (options.isTeacher ? 'teacher' : 'admin')) : {}),
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error(`Unable to connect to the backend server (${API_BASE_URL}). Please ensure the PHP backend server is running.`);
    }
    throw err;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Something went wrong.');
  }
  return data;
}

export const blogApi = {
  apiBaseUrl: API_BASE_URL,
  login: (credentials) => request('/auth/login.php', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  teacherLogin: (credentials) => request('/auth/teacher_login.php', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  studentLogin: (credentials) => request('/auth/student_login.php', { method: 'POST', body: JSON.stringify(credentials) }),
  studentMe: () => request('/auth/student_me.php', { auth: true, role: 'student' }),
  me: () => request('/auth/me.php', { auth: true }),
  teacherMe: () => request('/auth/teacher_me.php', { auth: true, isTeacher: true }),
  teacherUpdateProfile: (formData) => request('/auth/teacher_update_profile.php', {
    method: 'POST',
    body: formData,
    auth: true,
    isTeacher: true,
  }),
  teacherUpdateStudent: (payload) => request('/auth/teacher_update_student.php', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: true,
    isTeacher: true,
  }),
  logout: () => request('/auth/logout.php', { method: 'POST', auth: true }),
  teacherLogout: () => request('/auth/teacher_logout.php', { method: 'POST', auth: true, isTeacher: true }),
  listBlogs: ({ admin = false, category = '' } = {}) => {
    const params = new URLSearchParams();
    if (admin) params.set('admin', '1');
    if (category && category !== 'All') params.set('category', category);
    return request(`/blogs/list.php${params.toString() ? `?${params}` : ''}`, { auth: admin });
  },
  createBlog: (formData) => request('/blogs/create.php', {
    method: 'POST',
    body: formData,
    auth: true,
  }),
  updateBlog: (formData) => request('/blogs/update.php', {
    method: 'POST',
    body: formData,
    auth: true,
  }),
  deleteBlog: (id) => request('/blogs/delete.php', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
    auth: true,
  }),
  getSettings: () => request('/admin/settings.php'),
  updateSettings: (settings) => request('/admin/settings.php', {
    method: 'POST',
    body: JSON.stringify(settings),
    auth: true,
  }),
  listComments: ({ publicMode = false, blogId = '' } = {}) => {
    const params = new URLSearchParams();
    if (publicMode) params.set('public', '1');
    if (blogId) params.set('blog_id', blogId);
    return request(`/comments/list.php${params.toString() ? `?${params}` : ''}`, { auth: !publicMode });
  },
  createComment: (payload) => request('/comments/create.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateCommentStatus: (id, status) => request('/comments/update_status.php', {
    method: 'POST',
    body: JSON.stringify({ id, status }),
    auth: true,
  }),
  deleteComment: (id) => request('/comments/delete.php', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
    auth: true,
  }),
  createEnquiry: (payload) => request('/enquiries/create.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  listEnquiries: () => request('/enquiries/list.php', { auth: true }),
  updateEnquiryStatus: (id, status) => request('/enquiries/update_status.php', {
    method: 'POST',
    body: JSON.stringify({ id, status }),
    auth: true,
  }),
  deleteEnquiry: (id) => request('/enquiries/delete.php', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
    auth: true,
  }),
  listTeacherManagement: () => request('/teacher-management/list.php', { auth: true }),
  saveTeacherManagement: (payload) => request('/teacher-management/save.php', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: true,
  }),
  uploadTeacherPhoto: (formData) => request('/teacher-management/upload_photo.php', {
    method: 'POST',
    body: formData,
    auth: true,
  }),
  deleteTeacherManagement: (type, id) => request('/teacher-management/delete.php', {
    method: 'DELETE',
    body: JSON.stringify({ type, id }),
    auth: true,
  }),
  conversations: (role) => request('/chat/conversations.php', { auth: true, role }),
  messages: (role, target) => request(`/chat/messages.php?role=${encodeURIComponent(target.role)}&id=${target.id}`, { auth: true, role }),
  sendMessage: (role, payload) => request('/chat/send.php', { method: 'POST', body: JSON.stringify(payload), auth: true, role }),
  deleteMessage: (role, id) => request('/chat/delete.php', { method: 'POST', body: JSON.stringify({ id }), auth: true, role }),
};
