import { useEffect, useRef, useState, useMemo } from 'react';
import { classChatApi } from '../../api/classChatApi';
import '../../CSS/ClassChat.css';

const roleLabel = role => {
  if (!role) return '';
  return role === 'admin' ? 'Admin' : role[0].toUpperCase() + role.slice(1);
};

const formatDateDivider = dateStr => {
  if (!dateStr) return '';
  try {
    const raw = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + '+05:30';
    const d = new Date(raw);
    const nowKolkata = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const dKolkata = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    const todayStr = nowKolkata.toDateString();
    const yesterday = new Date(nowKolkata);
    yesterday.setDate(nowKolkata.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (dKolkata.toDateString() === todayStr) return 'Today';
    if (dKolkata.toDateString() === yesterdayStr) return 'Yesterday';
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

const formatTime = dateStr => {
  if (!dateStr) return '';
  try {
    const raw = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + '+05:30';
    const d = new Date(raw);
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
};

const formatPreviewTime = dateStr => {
  if (!dateStr) return '';
  try {
    const raw = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + '+05:30';
    const d = new Date(raw);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return '';
  }
};

// ── One-time cache version flush (module-level, runs once per page load) ────
// Bump CHAT_CACHE_VERSION whenever message isolation logic changes.
// This clears all old contaminated fh_chat_* localStorage entries automatically.
;(() => {
      const CHAT_CACHE_VERSION = 'v4-local-direct-isolated';
  try {
    if (localStorage.getItem('fh_chat_version') !== CHAT_CACHE_VERSION) {
      const keysToDelete = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('fh_chat_')) keysToDelete.push(k);
      }
      keysToDelete.forEach(k => localStorage.removeItem(k));
      localStorage.setItem('fh_chat_version', CHAT_CACHE_VERSION);
    }
  } catch {}
})()

export default function ClassChat({ role = 'teacher', title = 'Class discussion', teacher = null, initialStudents = null, studentId = null }) {
  // Normalize any passed initialStudents
  const normalizeStudents = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map(s => ({
      id: Number(s.id),
      student_name: s.student_name || s.name || 'Student',
      email: s.email || '',
      course: s.course || s.course_name || '',
      status: s.status || 'Active',
      unread_count: Number(s.unread_count || 0),
      latest_direct: s.latest_direct || null
    }));
  };

  const sortStudentsWhatsApp = (list = []) => {
    return [...list].sort((a, b) => {
      const timeA = a.latest_direct?.created_at ? new Date(a.latest_direct.created_at).getTime() : 0;
      const timeB = b.latest_direct?.created_at ? new Date(b.latest_direct.created_at).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      if ((b.unread_count || 0) !== (a.unread_count || 0)) return (b.unread_count || 0) - (a.unread_count || 0);
      return (a.student_name || '').localeCompare(b.student_name || '');
    });
  };

  // Scope localStorage cache keys per user to prevent cross-user data leakage
  const cacheScope = role === 'student' ? `student_${studentId || 'anon'}` : role === 'teacher' ? `teacher_${teacher?.id || 'x'}` : 'admin';

  // 0ms instant load from localStorage cache
  const [groups, setGroups] = useState(() => {
    try {
      const cached = localStorage.getItem(`fh_chat_groups_${cacheScope}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Exclude broadcast if commented out
        return parsed.filter(g => g.teacher_id !== 0);
      }
    } catch {}
    /*
    // Default initial broadcast item for admin
    if (role === 'admin') {
      return [{ teacher_id: 0, teacher_name: 'All Classes (Broadcast Announcement)', is_broadcast: true }];
    }
    */
    if (role === 'teacher' && teacher?.id) {
      return [{ teacher_id: Number(teacher.id), teacher_name: teacher.name || 'Teacher' }];
    }
    return [];
  });

  const [active, setActive] = useState(() => {
    try {
      const cachedActive = localStorage.getItem(`fh_chat_active_${cacheScope}`);
      if (cachedActive) {
        const parsedActive = JSON.parse(cachedActive);
        if (parsedActive.teacher_id !== 0) return parsedActive;
      }
      const cachedGroups = localStorage.getItem(`fh_chat_groups_${cacheScope}`);
      if (cachedGroups) {
        const parsed = JSON.parse(cachedGroups).filter(g => g.teacher_id !== 0);
        if (parsed.length > 0) return parsed[0];
      }
    } catch {}
    if (role === 'teacher' && teacher?.id) {
      return { teacher_id: Number(teacher.id), teacher_name: teacher.name || 'Teacher' };
    }
    return null;
  });

  const [messages, setMessages] = useState([]);

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [text, setText] = useState('');
  const [notice, setNotice] = useState('');
  const [toast, setToast] = useState('');
  const [channelSearch, setChannelSearch] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WhatsApp-style 2-channel state: 'group' (Announcement / Class Discussion) or 'direct' (Teacher 1-on-1)
  const [subChannel, setSubChannel] = useState('group'); // 'group' | 'direct'
  const [teacherStudents, setTeacherStudents] = useState(() => {
    if (Array.isArray(initialStudents) && initialStudents.length > 0) {
      return sortStudentsWhatsApp(normalizeStudents(initialStudents));
    }
    if (Array.isArray(teacher?.students) && teacher.students.length > 0) {
      return sortStudentsWhatsApp(normalizeStudents(teacher.students));
    }
    try {
      const cached = localStorage.getItem(`fh_chat_students_${cacheScope}`);
      if (cached) return sortStudentsWhatsApp(normalizeStudents(JSON.parse(cached)));
    } catch {}
    return [];
  });
  const [selectedStudent, setSelectedStudent] = useState(() => {
    if (Array.isArray(initialStudents) && initialStudents.length > 0) {
      return sortStudentsWhatsApp(normalizeStudents(initialStudents))[0] || null;
    }
    if (Array.isArray(teacher?.students) && teacher.students.length > 0) {
      return sortStudentsWhatsApp(normalizeStudents(teacher.students))[0] || null;
    }
    return null;
  }); // For teacher/admin selecting an individual student

  const messageCache = useRef({}); // { [key]: messages[] }
  const messageIds = useRef(new Set());
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const prevMessagesLength = useRef(0);

  const activeGroupUnread = () => {
    const group = groups.find(g => Number(g.teacher_id) === Number(active?.teacher_id));
    return Number(group?.group_unread_count ?? group?.unread_count ?? 0);
  };

  const activeDirectUnread = () => {
    if (role === 'student') {
      const group = groups.find(g => Number(g.teacher_id) === Number(active?.teacher_id));
      return Number(group?.direct_unread_count || 0);
    }
    return Number(selectedStudent?.unread_count || 0);
  };

  const clearCurrentThreadUnread = () => {
    const tid = active?.teacher_id ?? teacher?.id;
    if (!tid) return;
    if (subChannel === 'direct') {
      if (role === 'student') {
        setGroups(prev => prev.map(g => Number(g.teacher_id) === Number(tid)
          ? { ...g, direct_unread_count: 0, unread_count: Math.max(0, Number(g.unread_count || 0) - Number(g.direct_unread_count || 0)) }
          : g
        ));
      } else if (selectedStudent?.id) {
        const current = Number(selectedStudent.unread_count || 0);
        setTeacherStudents(prev => prev.map(s => Number(s.id) === Number(selectedStudent.id) ? { ...s, unread_count: 0 } : s));
        setSelectedStudent(prev => prev ? { ...prev, unread_count: 0 } : prev);
        setGroups(prev => prev.map(g => Number(g.teacher_id) === Number(tid)
          ? { ...g, unread_count: Math.max(0, Number(g.unread_count || 0) - current) }
          : g
        ));
      }
      return;
    }

    setGroups(prev => prev.map(g => Number(g.teacher_id) === Number(tid)
      ? { ...g, group_unread_count: 0, unread_count: Math.max(0, Number(g.unread_count || 0) - Number(g.group_unread_count ?? g.unread_count ?? 0)) }
      : g
    ));
  };

  // WhatsApp-style sorter:
  // #1 Pinned: All Classes Broadcast (teacher_id === 0)
  // #2 onwards: Sorted by latest message timestamp (newest first)
  const sortGroupsWhatsApp = (list = []) => {
    return [...list].sort((a, b) => {
      const isA = (a.teacher_id === 0);
      const isB = (b.teacher_id === 0);
      if (isA) return -1;
      if (isB) return 1;

      const timeA = a.latest?.created_at ? new Date(a.latest.created_at).getTime() : 0;
      const timeB = b.latest?.created_at ? new Date(b.latest.created_at).getTime() : 0;

      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return (a.teacher_name || '').localeCompare(b.teacher_name || '');
    });
  };

  const loadGroups = async () => {
    try {
      const data = await classChatApi.groups(role);
      const list = sortGroupsWhatsApp(data.groups || []);
      setGroups(list);
      try {
        localStorage.setItem(`fh_chat_groups_${cacheScope}`, JSON.stringify(list));
      } catch {}

      setActive(value => {
        if (!value) {
          const selected = list[0] || null;
          if (selected) {
            try { localStorage.setItem(`fh_chat_active_${cacheScope}`, JSON.stringify(selected)); } catch {}
          }
          return selected;
        }
        const exists = list.find(g => g.teacher_id === value.teacher_id);
        const selected = exists || list[0] || null;
        if (selected && value && selected.teacher_id === value.teacher_id) {
          return value;
        }
        if (selected) {
          try { localStorage.setItem(`fh_chat_active_${cacheScope}`, JSON.stringify(selected)); } catch {}
        }
        return selected;
      });
    } catch (error) {
      setNotice(error.message);
    }
  };

  // Load students under the teacher (for teacher & admin view)
  const loadTeacherStudents = async (teacherId) => {
    const tid = teacherId || teacher?.id || active?.teacher_id;
    if (!tid || (role !== 'teacher' && role !== 'admin')) return;
    try {
      const data = await classChatApi.teacherStudents(role, tid);
      if (data && Array.isArray(data.students)) {
        const normalized = sortStudentsWhatsApp(normalizeStudents(data.students));
        setTeacherStudents(normalized);
        try {
          localStorage.setItem(`fh_chat_students_${cacheScope}`, JSON.stringify(normalized));
        } catch {}
        // Default selected student if direct subchannel
        setSelectedStudent(prev => {
          if (prev) {
            const updated = normalized.find(s => Number(s.id) === Number(prev.id));
            if (updated) {
              const unchanged =
                updated.student_name === prev.student_name &&
                updated.email === prev.email &&
                updated.course === prev.course &&
                updated.status === prev.status &&
                Number(updated.unread_count || 0) === Number(prev.unread_count || 0) &&
                updated.latest_direct?.id === prev.latest_direct?.id;
              return unchanged ? prev : updated;
            }
          }
          return normalized[0] || null;
        });
      }
    } catch (e) {
      console.error('Error loading teacher students:', e);
    }
  };

  const getThreadCacheKey = () => {
    const tid = active?.teacher_id ?? teacher?.id ?? 0;
    if (role === 'admin') return `${tid}_all`;
    if (subChannel === 'direct') {
      // For student: use their own ID (from prop or currentUserId) to avoid cross-student cache collision
      const sid = (role === 'student') ? (studentId || currentUserId || 'anon') : (selectedStudent?.id || 0);
      return `${tid}_direct_${sid}`;
    }
    return `${tid}_group`;
  };

  const loadMessages = async (showNotification = false) => {
    if (active === null || active === undefined) return;
    const teacherId = active.teacher_id ?? 0;
    // Always pass chat_type so the backend applies the correct filter.
    // Admin uses 'group' since they view the group channel only (no direct subChannel).
    // Teacher uses 'direct' + student_id when in the direct thread.
    const chatType = subChannel; // 'group' or 'direct' — never empty
    const targetStudentId = role === 'teacher' && subChannel === 'direct'
      ? selectedStudent?.id
      : null;

    try {
      const data = await classChatApi.messages(role, teacherId, chatType, targetStudentId);
      if (data.current_user_id) {
        setCurrentUserId(data.current_user_id);
      }
      const list = data.messages || [];
      const cacheKey = getThreadCacheKey();
      messageCache.current[cacheKey] = list; // Update memory cache
      try {
        localStorage.setItem(`fh_chat_msgs_${cacheScope}_${cacheKey}`, JSON.stringify(list.slice(-50)));
      } catch {}

      const incoming = list.find(
        message => !messageIds.current.has(message.id) && message.sender_role !== role
      );
      list.forEach(message => messageIds.current.add(message.id));
      setMessages(list);
      setLoadingMessages(false);

      if (showNotification && incoming) {
        const sender =
          incoming.sender_role === 'admin'
            ? 'Admin'
            : (incoming.sender_name || roleLabel(incoming.sender_role));
        setToast(`${sender}: ${incoming.content}`);
        window.setTimeout(() => setToast(''), 4500);
      }
    } catch (error) {
      setNotice(error.message);
      setLoadingMessages(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const tid = active?.teacher_id || teacher?.id;
    await Promise.all([
      loadGroups(),
      loadMessages(),
      tid ? loadTeacherStudents(tid) : Promise.resolve()
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const refreshUnreadBadges = async () => {
    const tid = active?.teacher_id || teacher?.id;
    try {
      if (role === 'teacher' && tid) {
        await loadTeacherStudents(tid);
      } else if (role === 'student') {
        const data = await classChatApi.unread(role);
        const teacherId = Number(active?.teacher_id || teacher?.id || 0);
        const directUnread = Number(data.per_direct?.[teacherId]?.[studentId || currentUserId] || 0);
        const groupUnread = Number(data.per_group?.[teacherId] || 0);
        setGroups(prev => prev.map(g => Number(g.teacher_id) === teacherId
          ? {
              ...g,
              direct_unread_count: directUnread,
              group_unread_count: groupUnread,
              unread_count: directUnread + groupUnread
            }
          : g
        ));
      } else if (role === 'admin') {
        await loadGroups();
      }
    } catch {
      // Badge refresh is best-effort; message polling will surface hard failures.
    }
  };

  // Sync initial students if passed from parent
  useEffect(() => {
    const incoming = initialStudents || teacher?.students;
    if (Array.isArray(incoming) && incoming.length > 0) {
      const normalized = sortStudentsWhatsApp(normalizeStudents(incoming));
      setTeacherStudents(normalized);
      try {
        localStorage.setItem(`fh_chat_students_${role}`, JSON.stringify(normalized));
      } catch {}
      setSelectedStudent(prev => {
        if (prev && normalized.some(s => s.id === prev.id)) return prev;
        return normalized[0] || null;
      });
    }
  }, [initialStudents, teacher?.students, role]);

  useEffect(() => {
    loadGroups();
  }, [role]);

  useEffect(() => {
    const tid = active?.teacher_id || teacher?.id;
    if (tid && (role === 'teacher' || role === 'admin')) {
      loadTeacherStudents(tid);
    }
  }, [active?.teacher_id, teacher?.id, role]);

  // When active channel, subChannel, or selectedStudent changes: instant render from cache if available, else show loader
  useEffect(() => {
    prevMessagesLength.current = 0;
    messageIds.current = new Set();

    if (active) {
      const activeTid = active.teacher_id ?? 0;
      const cacheKey = getThreadCacheKey();
      let cached = messageCache.current[cacheKey];
      if (!cached || cached.length === 0) {
        try {
          const stored = localStorage.getItem(`fh_chat_msgs_${cacheScope}_${cacheKey}`);
          if (stored) cached = JSON.parse(stored);
        } catch {}
      }

      if (cached && cached.length > 0) {
        // Instant load from memory/storage (0ms delay - WhatsApp style)
        setMessages(cached);
        cached.forEach(m => messageIds.current.add(m.id));
        setLoadingMessages(false);
        setTimeout(() => scrollToBottom(false), 50);
      } else {
        setLoadingMessages(true);
      }

      loadMessages();
      setTimeout(() => scrollToBottom(false), 150);

      const readChatType = subChannel === 'direct' ? 'direct' : 'group';
      const readStudentId = readChatType === 'direct'
        ? (role === 'student' ? (studentId || currentUserId || 0) : (selectedStudent?.id || 0))
        : 0;
      classChatApi.markRead(role, activeTid, 0, readChatType, readStudentId).catch(() => {});
      clearCurrentThreadUnread();
    }
  }, [active?.teacher_id, subChannel, selectedStudent?.id, currentUserId]);



  // Live WebSocket connection for instant < 10ms real-time messaging
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let isMounted = true;

    const connectWS = () => {
      try {
        const wsHost = window.location.hostname || '127.0.0.1';
        ws = new WebSocket(`ws://${wsHost}:8085`);

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (!isMounted || !data) return;

            // Handle incoming message broadcast
            if (data.event === 'new_message' && data.message) {
              const msg = data.message;
              const activeTid = active?.teacher_id ?? 0;
              
              // Check if relevant to active teacher class
              const isRelevantClass = msg.is_broadcast ||
                msg.teacher_id === activeTid ||
                (activeTid === 0 && role === 'admin');

              // Check if relevant to current subChannel filter:
              let isRelevantThread = false;
              if (isRelevantClass) {
                if (role === 'admin') {
                  // Admin sees ONLY group/broadcast messages — NOT individual direct messages
                  isRelevantThread = !msg.recipient_student_id;
                } else if (subChannel === 'group') {
                  // Only group messages (recipient_student_id is null) or broadcasts
                  isRelevantThread = !msg.recipient_student_id;
                } else if (subChannel === 'direct') {
                  if (role === 'student') {
                    // Use studentId prop as fallback when currentUserId hasn't loaded yet from API
                    const myId = currentUserId || studentId;
                    // For student: direct message between teacher & this student ONLY
                    isRelevantThread = Boolean(myId && msg.recipient_student_id && (
                      Number(msg.recipient_student_id) === Number(myId) ||
                      (msg.sender_role === 'student' && Number(msg.sender_id) === Number(myId))
                    ));
                  } else {
                    // For teacher: direct message matching selectedStudent
                    isRelevantThread = Boolean(msg.recipient_student_id && selectedStudent && (
                      Number(msg.recipient_student_id) === Number(selectedStudent.id) ||
                      (msg.sender_role === 'student' && Number(msg.sender_id) === Number(selectedStudent.id))
                    ));
                  }
                }
              }

              if (isRelevantThread) {
                if (!messageIds.current.has(msg.id)) {
                  messageIds.current.add(msg.id);
                  setMessages((prev) => [...prev, msg]);

                  if (msg.sender_role !== role) {
                    const sender = msg.sender_role === 'admin'
                      ? 'Admin'
                      : (msg.sender_name || roleLabel(msg.sender_role));
                    setToast(`${sender}: ${msg.content}`);
                    window.setTimeout(() => setToast(''), 4500);
                  }
                }
              }
              // Instant WhatsApp-style re-ordering of channels
              // For students: don't update sidebar preview with direct messages meant for other students
              const msgTeacherId = msg.is_broadcast ? 0 : (msg.teacher_id ?? 0);
              const myId = role === 'student' ? (currentUserId || studentId) : null;
              const isDirectToOtherStudent = role === 'student' && msg.recipient_student_id &&
                myId && Number(msg.recipient_student_id) !== Number(myId) &&
                !(msg.sender_role === 'student' && Number(msg.sender_id) === Number(myId));

              if (!isDirectToOtherStudent) {
                setGroups(prevGroups => {
                  const updated = prevGroups.map(g => {
                    if (g.teacher_id === msgTeacherId) {
                      const isUnread = activeTid !== msgTeacherId && msg.sender_role !== role;
                      const isGroupMessage = !msg.recipient_student_id;
                      return {
                        ...g,
                        latest: {
                          id: msg.id,
                          content: msg.content,
                          created_at: msg.created_at || new Date().toISOString(),
                          sender_role: msg.sender_role,
                          sender_name: msg.sender_name
                        },
                        unread_count: isUnread
                          ? (g.unread_count || 0) + 1
                          : g.unread_count,
                        group_unread_count: isUnread && isGroupMessage
                          ? (g.group_unread_count || 0) + 1
                          : g.group_unread_count
                      };
                    }
                    return g;
                  });
                  return sortGroupsWhatsApp(updated);
                });
              }
            }

            // Handle live message deletion
            if (data.event === 'delete_message' && data.id) {
              setMessages((prev) => prev.filter((m) => m.id !== data.id && (!data.broadcast_id || m.broadcast_id !== data.broadcast_id)));
            }
          } catch {
            // Ignore non-JSON or heartbeat packets
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            reconnectTimeout = setTimeout(connectWS, 4000);
          }
        };

        ws.onerror = () => {
          // Socket will close and trigger fallback reconnection
        };
      } catch {
        // Fallback to HTTP polling if WebSocket is unavailable
      }
    };

    connectWS();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        try {
          ws.close();
        } catch {
          // ignore
        }
      }
    };
  }, [active?.teacher_id, subChannel, selectedStudent?.id, currentUserId, role]);

  // Polling fallback for new messages (respects document visibility & prevents DB connection exhaustion)
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) return; // Pause polling when tab is in the background
      loadMessages(false);
      refreshUnreadBadges();
    }, 15000);
    return () => {
      window.clearInterval(timer);
    };
  }, [active?.teacher_id, subChannel, selectedStudent?.id]);

  // Instantly fetch fresh messages when user switches back to this tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && active) {
        loadMessages(false);
        refreshUnreadBadges();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [active?.teacher_id, subChannel, selectedStudent?.id]);

  // Handle auto-scrolling cleanly inside container without moving parent window
  const scrollToBottom = (smooth = true) => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
      setIsAtBottom(true);
      setHasNewMessagesBelow(false);
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 90;
    setIsAtBottom(nearBottom);
    if (nearBottom) {
      setHasNewMessagesBelow(false);
    }
  };

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (isAtBottom || prevMessagesLength.current === 0) {
        scrollToBottom(prevMessagesLength.current !== 0);
      } else {
        setHasNewMessagesBelow(true);
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  const send = async event => {
    if (event) event.preventDefault();
    if (!active || !text.trim()) return;
    const contentToSend = text.trim();
    try {
      const teacherId = active.teacher_id ?? 0;
      const isBroadcast = teacherId === 0 && role === 'admin';
      const isDirect = subChannel === 'direct';
      const recipientStudentId = (role === 'teacher' || role === 'admin') && isDirect
        ? selectedStudent?.id
        : null;

      const data = await classChatApi.send(role, teacherId, contentToSend, {
        recipient_student_id: recipientStudentId,
        is_direct: isDirect
      });

      if (data?.message) {
        messageIds.current.add(data.message.id);
        setMessages(items => [...items, data.message]);
      }
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setToast(
        isBroadcast
          ? 'Broadcast announcement sent to all classes.'
          : isDirect
            ? 'Direct message sent.'
            : 'Message sent to the class.'
      );
      window.setTimeout(() => setToast(''), 3500);

      // Instant WhatsApp-style re-ordering on outgoing message
      if (data?.message) {
        setGroups(prevGroups => {
          const updated = prevGroups.map(g => {
            if (g.teacher_id === teacherId) {
              return {
                ...g,
                latest: {
                  id: data.message.id,
                  content: data.message.content,
                  created_at: data.message.created_at || new Date().toISOString(),
                  sender_role: role,
                  sender_name: role === 'admin' ? 'Admin' : 'You'
                }
              };
            }
            return g;
          });
          return sortGroupsWhatsApp(updated);
        });
      }

      setTimeout(() => scrollToBottom(true), 100);
    } catch (error) {
      setNotice(error.message);
    }
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const handleTextareaChange = e => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const remove = async id => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await classChatApi.remove(role, id);
      setMessages(items => items.filter(message => message.id !== id));
      setToast('Message deleted.');
      window.setTimeout(() => setToast(''), 2500);
    } catch (error) {
      setNotice(error.message);
    }
  };

  const canDelete = () => {
    // Only Admin can delete messages; Teachers and Students cannot delete any message
    return role === 'admin';
  };

  const isCurrentClassBroadcast = active?.teacher_id === 0 && role === 'admin';
  const hasMultipleGroups = groups.length > 1;

  const filteredGroups = useMemo(() => {
    if (!channelSearch.trim()) return groups;
    const q = channelSearch.toLowerCase();
    return groups.filter(g => (g.teacher_name || '').toLowerCase().includes(q));
  }, [groups, channelSearch]);

  return (
    <main className="class-chat">
      {/* Compact Portal Subheader */}
      <header className="class-chat-header">
        <div className="class-chat-header-main">
          <div className="class-chat-badge-row">
            <span className="class-portal-tag">{roleLabel(role)} portal</span>
            <span className="class-live-indicator">
              <span className="pulse-dot"></span>
              Live sync
            </span>
          </div>
          <h1 className="class-chat-title">{title}</h1>
          <p className="class-chat-subtitle">
            {role === 'admin'
              ? 'View student-teacher class discussions and send announcements to all classes.'
              : 'Class-related messages are visible to the teacher, assigned students, and admin.'}
          </p>
        </div>
        <div className="class-chat-header-actions">
          <button
            type="button"
            className={`class-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title="Refresh messages"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {toast && (
        <div className="class-chat-toast" role="status">
          <span className="toast-icon">🔔</span>
          <span>{toast}</span>
        </div>
      )}
      {notice && (
        <div className="class-chat-error">
          <span className="error-icon">⚠️</span>
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="close-notice-btn">✕</button>
        </div>
      )}

      <section className="class-chat-shell">
        {/* Left Sidebar: Role-specific rendering */}
        <aside className="class-groups">
          {role === 'admin' ? (
            /* ── ADMIN SIDEBAR: Original flat-list of teacher channels ── */
            <>
              <div className="class-groups-header">
                <h2>Channels &amp; Classes</h2>
                <span className="class-groups-count">{groups.length}</span>
              </div>

              {/* Search bar */}
              <div className="class-groups-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search teacher..."
                  value={channelSearch}
                  onChange={e => setChannelSearch(e.target.value)}
                  aria-label="Search teacher channels"
                />
                {channelSearch && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setChannelSearch('')}
                    aria-label="Clear search"
                  >✕</button>
                )}
              </div>

              {/* Flat teacher channel list */}
              <div className="class-groups-list">
                {filteredGroups.length === 0 ? (
                  <div className="class-no-students-hint">No classes found</div>
                ) : (
                  filteredGroups.map(group => {
                    const isActive = active?.teacher_id === group.teacher_id;
                    const unread = group.unread_count || 0;
                    return (
                      <button
                        key={group.teacher_id}
                        type="button"
                        onClick={() => {
                          setActive(group);
                          try { localStorage.setItem(`fh_chat_active_${cacheScope}`, JSON.stringify(group)); } catch {}
                        }}
                        className={`class-group-item ${isActive ? 'active' : ''}`}
                      >
                        <div className="group-item-avatar">
                          {group.teacher_name?.[0]?.toUpperCase() || 'T'}
                        </div>
                        <div className="group-item-info">
                          <div className="group-item-row-top">
                            <strong className="group-item-name">{group.teacher_name}</strong>
                            {group.latest?.created_at && (
                              <span className="group-item-time">{formatPreviewTime(group.latest.created_at)}</span>
                            )}
                          </div>
                          <div className="group-item-row-bottom">
                            <small className="group-item-preview">
                              {group.latest?.content
                                ? (group.latest.content.length > 35
                                    ? group.latest.content.slice(0, 32) + '…'
                                    : group.latest.content)
                                : 'Direct conversation'}
                            </small>
                            {unread > 0 && (
                              <span className="group-unread-badge">{unread}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* ── TEACHER / STUDENT SIDEBAR: WhatsApp-style 2-row layout ── */
            <>
              <div className="class-groups-header">
                <h2>Chats</h2>
              </div>

              {/* WhatsApp-style Chat Rows */}
              <div className="class-groups-list">
                {/* ROW 1: Announcement / Class Discussion */}
                <button
                  type="button"
                  onClick={() => setSubChannel('group')}
                  className={`class-group-item ${subChannel === 'group' ? 'active' : ''}`}
                >
                  <div className="group-item-avatar announcement-avatar">
                    📢
                  </div>
                  <div className="group-item-info">
                    <div className="group-item-row-top">
                      <strong className="group-item-name">Class Discussion</strong>
                      {activeGroupUnread() > 0 && (
                        <span className="group-unread-badge">{activeGroupUnread()}</span>
                      )}
                    </div>
                    <div className="group-item-row-bottom">
                      <small className="group-item-preview">
                        Announcement &amp; Class thread
                      </small>
                    </div>
                  </div>
                </button>

                {/* ROW 2 FOR STUDENT: Direct interaction with Teacher */}
                {role === 'student' && (
                  <button
                    type="button"
                    onClick={() => setSubChannel('direct')}
                    className={`class-group-item ${subChannel === 'direct' ? 'active' : ''}`}
                  >
                    <div className="group-item-avatar teacher-avatar">
                      👨‍🏫
                    </div>
                    <div className="group-item-info">
                      <div className="group-item-row-top">
                        <strong className="group-item-name">Teacher</strong>
                        {activeDirectUnread() > 0 && (
                          <span className="group-unread-badge">{activeDirectUnread()}</span>
                        )}
                      </div>
                      <div className="group-item-row-bottom">
                        <small className="group-item-preview">
                          Direct with {active?.teacher_name || 'Teacher'}
                        </small>
                      </div>
                    </div>
                  </button>
                )}

                {/* ROWS FOR TEACHER: Direct student conversations */}
                {role === 'teacher' && (
                  <div className="class-students-section">
                    <div className="class-subchannel-heading">
                      <span>Student Direct Messages</span>
                      <span className="class-students-count">{teacherStudents.length}</span>
                    </div>

                    {teacherStudents.length === 0 ? (
                      <div className="class-no-students-hint">
                        No assigned students found
                      </div>
                    ) : (
                      teacherStudents.map(student => {
                        const isSelected = subChannel === 'direct' && selectedStudent?.id === student.id;
                        const unread = Number(student.unread_count || 0);
                        const latestPreview = student.latest_direct?.content
                          ? (student.latest_direct.content.length > 32
                              ? student.latest_direct.content.slice(0, 29) + '...'
                              : student.latest_direct.content)
                          : (student.course ? `${student.course}` : 'Direct message');
                        return (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => {
                              setSelectedStudent(student);
                              setSubChannel('direct');
                            }}
                            className={`class-group-item student-row ${isSelected ? 'active' : ''}`}
                          >
                            <div className="group-item-avatar student-avatar">
                              {student.student_name?.[0]?.toUpperCase() || 'S'}
                            </div>
                            <div className="group-item-info">
                              <div className="group-item-row-top">
                                <strong className="group-item-name">
                                  {student.student_name}
                                </strong>
                                {unread > 0 && (
                                  <span className="group-unread-badge">{unread}</span>
                                )}
                              </div>
                              <div className="group-item-row-bottom">
                                <small className="group-item-preview">
                                  {latestPreview}
                                </small>
                                {student.latest_direct?.created_at && (
                                  <span className="group-item-time">{formatPreviewTime(student.latest_direct.created_at)}</span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        {/* Chat Thread */}
        <section className="class-thread">
          {!active ? (
            <div className="class-empty">
              <div className="empty-icon-circle">💬</div>
              <h3>No Conversation Selected</h3>
              <p>Select a chat channel on the left to start messaging.</p>
            </div>
          ) : (
            <>
              {/* Thread Header: Sticky Top */}
              <header className="class-thread-header">
                <div className="thread-header-avatar-wrap">
                  <div className={`class-avatar ${role === 'admin' ? 'admin-teacher' : subChannel === 'group' ? 'announcement' : 'direct'}`}>
                    {role === 'admin'
                      ? (active.teacher_name?.[0]?.toUpperCase() || 'T')
                      : (subChannel === 'group' ? '📢' : (role === 'student' ? '👨‍🏫' : (selectedStudent?.student_name?.[0]?.toUpperCase() || '👤')))}
                  </div>
                  <span className="online-indicator-dot" title="Active channel"></span>
                </div>

                <div className="thread-header-meta">
                  <div className="thread-title-row">
                    <strong>
                      {role === 'admin'
                        ? `Teacher: ${active.teacher_name}`
                        : (subChannel === 'group'
                            ? 'Class Discussion & Announcements'
                            : (role === 'student'
                                ? `Teacher: ${active.teacher_name}`
                                : `Student: ${selectedStudent?.student_name || 'Direct Conversation'}`))}
                    </strong>
                    <span className="thread-role-badge">
                      {role === 'admin' ? 'CLASSROOM' : (subChannel === 'group' ? 'CLASSROOM' : 'DIRECT')}
                    </span>
                  </div>
                  <small className="thread-subtitle">
                    {role === 'admin'
                      ? `Class discussion with ${active.teacher_name} & assigned students`
                      : (subChannel === 'group'
                          ? `Class discussion with ${active.teacher_name} & all enrolled students`
                          : (role === 'student'
                              ? `1-on-1 direct conversation with Teacher ${active.teacher_name}`
                              : `1-on-1 direct message with student ${selectedStudent?.student_name || ''}`))}
                  </small>
                </div>
              </header>

              {/* Scrollable Messages Area */}
              <div
                className="class-messages"
                ref={messagesContainerRef}
                onScroll={handleScroll}
              >
                {loadingMessages && messages.length === 0 ? (
                  <div className="class-messages-loading">
                    <div className="chat-loading-spinner"></div>
                    <span className="chat-loading-text">Loading conversation...</span>
                  </div>
                ) : messages.length ? (
                  (() => {
                    let lastDate = null;
                    return messages.map((message, index) => {
                      const isMine =
                        (role === 'admin' && message.sender_role === 'admin') ||
                        (message.sender_role === role && (!currentUserId || message.sender_id === currentUserId));
                      const isAdminMsg = message.sender_role === 'admin';
                      const isBroadcast = Boolean(message.is_broadcast);
                      const isDirectMsg = Boolean(message.recipient_student_id);
                      const currentDate = formatDateDivider(message.created_at);
                      const showDateDivider = currentDate && currentDate !== lastDate;
                      lastDate = currentDate;

                      return (
                        <div key={message.id || index} className="message-wrapper">
                          {showDateDivider && (
                            <div className="chat-date-divider">
                              <span>{currentDate}</span>
                            </div>
                          )}

                          <div className={`message-row ${isMine ? 'mine' : 'other'}`}>
                            {/* Sender Avatar for incoming messages */}
                            {!isMine && (
                              <div
                                className={`class-msg-sender-avatar role-${message.sender_role || 'student'}`}
                                title={`${message.sender_name || roleLabel(message.sender_role)} (${roleLabel(message.sender_role)})`}
                              >
                                {isAdminMsg
                                  ? '🛡️'
                                  : (message.sender_name?.[0]?.toUpperCase() || (message.sender_role === 'teacher' ? 'T' : 'S'))}
                              </div>
                            )}

                            <article
                              className={`class-message ${isMine ? 'mine' : ''} ${isAdminMsg ? 'is-admin-msg' : ''} ${isBroadcast ? 'is-broadcast-msg' : ''} ${isDirectMsg ? 'is-direct-msg' : ''}`}
                            >
                              <div className="class-message-header">
                                <div className="class-sender-info">
                                  <strong className="class-sender-name">
                                    {isMine ? 'You' : (isAdminMsg ? 'Admin' : (message.sender_name || roleLabel(message.sender_role)))}
                                  </strong>
                                  <span className={`class-role-badge badge-${message.sender_role || 'student'}`}>
                                    {isAdminMsg ? 'ADMIN' : roleLabel(message.sender_role)}
                                  </span>
                                  {isDirectMsg && (
                                    <span className="class-direct-pill">
                                      👤 Direct
                                    </span>
                                  )}
                                  {isBroadcast && (
                                    <span className="class-broadcast-pill">
                                      📢 Broadcast
                                    </span>
                                  )}
                                </div>
                                <time className="class-message-time">
                                  {formatTime(message.created_at)}
                                </time>
                              </div>

                              <div className="class-message-body">
                                <p>{message.content}</p>
                              </div>

                              {canDelete(message) && (
                                <div className="class-message-actions">
                                  <button
                                    type="button"
                                    className="class-delete-btn"
                                    onClick={() => remove(message.id)}
                                    title="Delete message"
                                    aria-label="Delete message"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </article>
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="class-messages-empty">
                    <div className="empty-bubble-icon">💬</div>
                    <h3>
                      {subChannel === 'group'
                        ? 'Class Discussion'
                        : (role === 'student' ? 'Teacher Direct Chat' : 'Direct Conversation')}
                    </h3>
                    <p>
                      {subChannel === 'group'
                        ? `No messages yet. Send a message below to start communicating with teacher ${active.teacher_name} and students.`
                        : (role === 'student'
                            ? `This is your direct line with teacher ${active.teacher_name}. Send a message below.`
                            : `Send an individual direct message to ${selectedStudent?.student_name || 'this student'}.`)}
                    </p>
                    <div className="empty-quick-starters">
                      <button type="button" onClick={() => setText('Hello! Welcome to our class.')}>
                        👋 "Hello! Welcome to our class."
                      </button>
                      <button type="button" onClick={() => setText('Please check the latest class schedule.')}>
                        📅 "Please check the latest class schedule."
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating "Scroll to Bottom" Button */}
              {!isAtBottom && (
                <button
                  type="button"
                  className={`class-scroll-bottom-btn ${hasNewMessagesBelow ? 'has-new' : ''}`}
                  onClick={() => scrollToBottom(true)}
                  title="Scroll to bottom"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span>{hasNewMessagesBelow ? 'New messages below' : 'Jump to latest'}</span>
                </button>
              )}

              {/* Chat Input Bar: Sticky Bottom */}
              <footer className="class-thread-footer">
                <form onSubmit={send} className="class-input-form">
                  <div className="class-textarea-container">
                    <textarea
                      ref={textareaRef}
                      value={text}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      maxLength="2000"
                      rows="1"
                      placeholder={
                        role === 'admin'
                          ? `Write a message to teacher ${active.teacher_name}… (Enter to send)`
                          : (subChannel === 'group'
                              ? 'Write a class-related message… (Enter to send)'
                              : (role === 'student'
                                  ? `Write a direct message to teacher ${active.teacher_name}… (Enter to send)`
                                  : `Write a direct message to ${selectedStudent?.student_name || 'student'}… (Enter to send)`))
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="class-send-btn"
                    disabled={!text.trim()}
                    title="Send message (Enter)"
                  >
                    <span>Send</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
                <div className="class-input-hints">
                  <span>💡 Press <b>Enter</b> to send, <b>Shift + Enter</b> for new line</span>
                  {text.length > 100 && (
                    <span className="class-char-counter">{text.length}/2000</span>
                  )}
                </div>
              </footer>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
