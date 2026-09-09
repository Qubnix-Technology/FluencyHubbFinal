import { getAdminToken, getStudentToken, getTeacherToken } from './blogApi';

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const base = rawBase.replace(/\/+$/, '');
const tokenFor = role => role === 'admin' ? getAdminToken() : role === 'teacher' ? getTeacherToken() : getStudentToken();
async function request(path, role, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let response;
  try {
    response = await fetch(`${base}${cleanPath}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFor(role) || ''}`, ...(options.headers || {}) } });
  } catch (err) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error(`Unable to connect to the backend server (${base}). Please ensure the PHP backend server is running.`);
    }
    throw err;
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) throw new Error(body.message || 'Unable to contact the chat service.');
  return body;
}
export const classChatApi = {
  groups: role => request('chat/class_groups.php', role),
  teacherStudents: (role, teacherId) => request(`chat/teacher_students.php?teacher_id=${teacherId || 0}`, role),
  messages: (role, teacherId, chatType = '', studentId = null) => {
    let url = `chat/class_messages.php?teacher_id=${teacherId}`;
    if (chatType) url += `&chat_type=${chatType}`;
    if (studentId) url += `&student_id=${studentId}`;
    return request(url, role);
  },
  send: (role, teacherId, content, extra = {}) => request('chat/class_send.php', role, {
    method: 'POST',
    body: JSON.stringify({
      teacher_id: teacherId,
      content,
      recipient_student_id: extra.recipient_student_id || null,
      is_direct: extra.is_direct || false
    })
  }),
  remove: (role, id) => request('chat/class_delete.php', role, { method: 'POST', body: JSON.stringify({ id }) }),
  unread: role => request('chat/class_unread.php', role),
  markRead: (role, teacherId, messageId = 0) => request('chat/class_read.php', role, { method: 'POST', body: JSON.stringify({ teacher_id: teacherId, message_id: messageId }) }),
};

