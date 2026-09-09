import { getAdminToken, getStudentToken, getTeacherToken } from './blogApi';

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const base = rawBase.replace(/\/+$/, '');

const tokenFor = role => {
  if (role === 'admin') return getAdminToken();
  if (role === 'teacher') return getTeacherToken();
  return getStudentToken();
};

async function request(path, role = 'admin', options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let response;
  try {
    response = await fetch(`${base}${cleanPath}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenFor(role) || ''}`,
        ...(options.headers || {})
      }
    });
  } catch (err) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error(`Unable to connect to the backend server (${base}). Please ensure the PHP backend server is running.`);
    }
    throw err;
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.message || 'Error occurred while contacting Zoom meeting service.');
  }
  return body;
}

export const zoomMeetingApi = {
  list: role => request('zoom/list.php', role),
  teacherStudents: (teacherId, role = 'admin') => request(`zoom/teacher_students.php?teacher_id=${teacherId}`, role),
  save: (data, role = 'admin') => request('zoom/save.php', role, { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status, cancelReason = '', role = 'admin') =>
    request('zoom/update_status.php', role, {
      method: 'POST',
      body: JSON.stringify({ id, status, cancel_reason: cancelReason })
    }),
  delete: (id, role = 'admin') => request('zoom/delete.php', role, { method: 'POST', body: JSON.stringify({ id }) })
};
