import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { blogApi, getStudentToken, setStudentToken } from '../../api/blogApi';
import { classChatApi } from '../../api/classChatApi';
import ClassChat from '../Shared/ClassChat';
import ZoomMeetingSection from '../Shared/ZoomMeetingSection';
import '../../CSS/StudentPanel/StudentPanel.css';


const formatPhotoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
};

export default function StudentPanel({ defaultTab = 'dashboard' }) {
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [teacherPhotoError, setTeacherPhotoError] = useState(false);
  const [studentPhotoError, setStudentPhotoError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [liveToast, setLiveToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUnread = async () => {
    try {
      const res = await classChatApi.unread('student');
      setUnreadCount(res.total_unread || 0);
    } catch {}
  };

  useEffect(() => {
    if (!student) return;
    fetchUnread();
    const interval = setInterval(() => {
      if (!document.hidden) fetchUnread();
    }, 12000);
    return () => clearInterval(interval);
  }, [student]);

  useEffect(() => {
    if (!student) return;
    let ws = null;
    let isMounted = true;
    try {
      const wsHost = window.location.hostname || '127.0.0.1';
      ws = new WebSocket(`ws://${wsHost}:8085`);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (!isMounted || !data) return;
          if (data.event === 'new_message' && data.message) {
            const msg = data.message;
            const assignedTeacherId = Number(student?.teacher_id || student?.teacher?.id || 0);
            const myStudentId = Number(student?.id || 0);

            // Only relevant to THIS student if:
            // 1. Broadcast announcement (reaches all)
            // 2. Group message (no specific recipient) from assigned teacher
            // 3. Direct message explicitly addressed TO this student
            const isGroupOrBroadcast = msg.is_broadcast || !msg.recipient_student_id;
            const isAddressedToMe = msg.recipient_student_id && Number(msg.recipient_student_id) === myStudentId;
            const isFromMe = msg.sender_role === 'student' && Number(msg.sender_id) === myStudentId;

            const isForThisStudent =
              assignedTeacherId > 0 &&
              Number(msg.teacher_id) === assignedTeacherId &&
              (isGroupOrBroadcast || isAddressedToMe || isFromMe);

            if (isForThisStudent && msg.sender_role !== 'student') {
              // Only increment unread for group/broadcast messages; direct messages have their own tab
              if (isGroupOrBroadcast) {
                setUnreadCount(prev => prev + 1);
              } else if (isAddressedToMe) {
                setUnreadCount(prev => prev + 1);
              }
              if (activeTab !== 'chat' && (isGroupOrBroadcast || isAddressedToMe)) {
                const sender = msg.sender_name || (msg.sender_role === 'admin' ? 'Admin' : 'Teacher');
                setLiveToast({
                  title: `Message from ${sender}`,
                  text: msg.content.length > 80 ? msg.content.slice(0, 77) + '...' : msg.content
                });
              }
            }
          }
        } catch {}
      };
    } catch {}
    return () => {
      isMounted = false;
      if (ws) { try { ws.close(); } catch {} }
    };
  }, [student, activeTab]);

  useEffect(() => {
    if (location.pathname.includes('/chat')) {
      setActiveTab('chat');
    }
  }, [location.pathname]);


  useEffect(() => {
    const fetchProfile = async () => {
      const token = getStudentToken();
      if (!token) {
        navigate('/login', { replace: true });
        setLoading(false);
        return;
      }

      try {
        const res = await blogApi.studentMe();
        if (res.success && res.student) {
          setStudent(res.student);
        } else {
          throw new Error(res.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Student auth failed:', err);
        setStudentToken('');
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${blogApi.apiBaseUrl}/auth/student_logout.php`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getStudentToken()}`,
        },
      });
    } catch {
      // ignore
    }
    setStudentToken('');
    navigate('/login', { replace: true });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <main className="student-dashboard-loading">
        <div>Loading Student Dashboard...</div>
      </main>
    );
  }

  if (!student) {
    return null;
  }

  const packageClasses = Number(student.packageClasses) || 0;
  const completedClasses = Number(student.completedClasses) || 0;
  const remainingClasses = Number(student.remainingClasses) || Math.max(packageClasses - completedClasses, 0);
  const progressPercent = packageClasses > 0 ? Math.min(Math.round((completedClasses / packageClasses) * 100), 100) : 0;

  const teacherPhoto = formatPhotoUrl(student.teacher?.photo);
  const studentPhoto = formatPhotoUrl(student.photo);

  const handleOpenChat = () => {
    handleTabChange('chat');
    setLiveToast(null);
    setUnreadCount(0);
  };

  return (
    <main className="student-dashboard-page">
      {liveToast && (
        <div className="admin-live-toast-banner" role="alert">
          <div className="admin-live-toast-icon">💬</div>
          <div className="admin-live-toast-content">
            <strong>{liveToast.title}</strong>
            <p>{liveToast.text}</p>
          </div>
          <button type="button" className="admin-live-toast-btn" onClick={handleOpenChat}>
            Open Chat
          </button>
          <button type="button" className="admin-live-toast-close" onClick={() => setLiveToast(null)}>
            ✕
          </button>
        </div>
      )}
      <section className="student-dashboard-shell">
        {/* Top Header */}
        <header className="student-dashboard-header">
          <div className="student-header-info">
            <div className="student-header-avatar">
              {studentPhoto && !studentPhotoError ? (
                <img
                  src={studentPhoto}
                  alt={student.name}
                  onError={() => setStudentPhotoError(true)}
                />
              ) : (
                <div className="student-avatar-fallback">
                  {student.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
              )}
            </div>
            <div>
              <span className="student-portal-tag">FluencyHub Student Portal</span>
              <h1 className="student-header-title">Welcome, {student.name}</h1>
              <div className="student-header-sub">
                <span className="student-badge-pill">{student.course || 'English Communication'}</span>
                {student.teacher?.name && (
                  <span>
                    Teacher: <strong>{student.teacher.name}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="student-logout-btn"
            onClick={handleLogout}
            title="Log out of your student dashboard"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </header>

        {/* Tab Navigation (Teacher Profile tab removed) */}
        <nav className="student-dashboard-tabs" aria-label="Student sections">
          <button
            type="button"
            className={`student-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard
          </button>

          <button
            type="button"
            className={`student-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={handleOpenChat}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Class Chat
            {unreadCount > 0 && (
              <span className="group-unread-badge" style={{ marginLeft: '6px' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`student-tab-btn ${activeTab === 'zoom' ? 'active' : ''}`}
            onClick={() => handleTabChange('zoom')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            Live Classes
          </button>

          <button
            type="button"
            className={`student-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            My Profile
          </button>
        </nav>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <section>
            {/* Stat Cards */}
            <div className="student-stat-grid">
              <div className="student-stat-card">
                <div className="student-stat-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <p className="student-stat-label">Course Name</p>
                <h3 className="student-stat-value" style={{ fontSize: '1.25rem', lineHeight: '1.3' }}>
                  {student.course || 'Not Assigned'}
                </h3>
              </div>

              <div className="student-stat-card">
                <div className="student-stat-icon purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <p className="student-stat-label">Total Classes</p>
                <h3 className="student-stat-value">{packageClasses}</h3>
              </div>

              <div className="student-stat-card">
                <div className="student-stat-icon green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="student-stat-label">Completed Classes</p>
                <h3 className="student-stat-value">{completedClasses}</h3>
              </div>

              <div className="student-stat-card">
                <div className="student-stat-icon amber">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <p className="student-stat-label">Remaining Classes</p>
                <h3 className="student-stat-value">{remainingClasses}</h3>
              </div>
            </div>

            {/* Course Progress Card */}
            <div className="student-progress-card">
              <div className="student-progress-header">
                <h3>Course Progress</h3>
                <span>{progressPercent}% Completed</span>
              </div>
              <div className="student-progress-bar-bg">
                <div
                  className="student-progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="student-progress-footer">
                <span>Completed: {completedClasses} classes</span>
                <span>Total Package: {packageClasses} classes</span>
              </div>
            </div>

            {/* Course & Class Details */}
            <div className="student-content-grid single-column">
              {/* Class & Schedule Details */}
              <div className="student-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <h3 className="student-card-title" style={{ margin: 0, padding: 0, border: 'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Class Information
                  </h3>
                  <button
                    type="button"
                    className="student-chat-cta-btn primary"
                    style={{ flex: 'none' }}
                    onClick={() => handleTabChange('chat')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Open Class Chat
                  </button>
                </div>

                <div className="student-info-list">
                  <div className="student-info-item">
                    <span>Class Type</span>
                    <strong>{student.classType || 'One-to-One'}</strong>
                  </div>

                  <div className="student-info-item">
                    <span>Duration</span>
                    <strong>{student.duration || 30} mins</strong>
                  </div>

                  <div className="student-info-item">
                    <span>This Week Classes</span>
                    <strong>{student.thisWeekClasses || 0}</strong>
                  </div>

                  <div className="student-info-item">
                    <span>Total Package</span>
                    <strong>{packageClasses} Classes</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: CLASS CHAT */}
        {activeTab === 'chat' && (
          <section className="student-chat-wrapper">
            <ClassChat role="student" title="My Class Chat" studentId={student?.id} />
          </section>
        )}

        {/* TAB 3: LIVE CLASSES */}
        {activeTab === 'zoom' && (
          <section className="student-chat-wrapper">
            <ZoomMeetingSection role="student" title="My Live Classes" />
          </section>
        )}

        {/* TAB 4: MY PROFILE */}
        {activeTab === 'profile' && (
          <section className="student-profile-wrap">
            <div className="student-profile-header">
              <div className="student-profile-avatar-lg">
                {studentPhoto && !studentPhotoError ? (
                  <img
                    src={studentPhoto}
                    alt={student.name}
                    onError={() => setStudentPhotoError(true)}
                  />
                ) : (
                  <span>{(student.name || 'S').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="student-profile-header-text">
                <h2>{student.name}</h2>
                <p>{student.email || 'No email registered'}</p>
              </div>
            </div>

            <div className="student-profile-grid">
              <div className="student-profile-field">
                <b>Student Full Name</b>
                <span>{student.name}</span>
              </div>

              <div className="student-profile-field">
                <b>Student Login Email</b>
                <span>{student.email || '-'}</span>
              </div>

              <div className="student-profile-field student-password-field">
                <b>Student Password</b>
                <div className="student-password-val-wrap">
                  <span className="student-password-text">
                    {showPassword ? (student.password || '••••••••') : '••••••••'}
                  </span>
                  <button
                    type="button"
                    className="student-toggle-pwd-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="student-profile-field">
                <b>Enrolled Course</b>
                <span>{student.course}</span>
              </div>

              <div className="student-profile-field">
                <b>Class Duration</b>
                <span>{student.duration} minutes</span>
              </div>

              <div className="student-profile-field">
                <b>Class Type</b>
                <span>{student.classType}</span>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
