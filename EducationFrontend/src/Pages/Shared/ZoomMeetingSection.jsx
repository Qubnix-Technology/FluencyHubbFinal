import React, { useState, useEffect, useMemo } from 'react';
import { zoomMeetingApi } from '../../api/zoomMeetingApi';
import { blogApi } from '../../api/blogApi';
import '../../CSS/ZoomMeetingSection.css';

const formatKolkataTime = (dateStr, timeStr) => {
  if (!dateStr) return '';
  try {
    const raw = `${dateStr}T${timeStr || '00:00:00'}+05:30`;
    const d = new Date(raw);
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  try {
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
};

const formatPhotoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
};

export default function ZoomMeetingSection({ role = 'admin', title = 'Live Zoom Classes' }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'live' | 'scheduled' | 'completed' | 'cancelled'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Modal form states (Admin only)
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Form inputs
  const [formTitle, setFormTitle] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formMeetingId, setFormMeetingId] = useState('');
  const [formPasscode, setFormPasscode] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState('60');
  const [formStatus, setFormStatus] = useState('scheduled');
  const [formNotes, setFormNotes] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Expanded student rosters on cards
  const [expandedRosterIds, setExpandedRosterIds] = useState({});

  const loadMeetings = async () => {
    try {
      setError('');
      const data = await zoomMeetingApi.list(role);
      setMeetings(data.meetings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    if (role !== 'admin') return;
    try {
      const res = await blogApi.listTeacherManagement();
      setTeachers(res.teachers || []);
    } catch (err) {
      console.error('Failed to load teachers for dropdown', err);
    }
  };

  useEffect(() => {
    loadMeetings();
    if (role === 'admin') loadTeachers();

    // Auto-refresh meetings every 15s to guarantee scheduled meetings immediately flip to 'Live Now'
    const timer = setInterval(() => {
      if (!document.hidden) {
        loadMeetings();
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [role]);

  // WebSocket real-time listener for live status updates & meeting notifications
  useEffect(() => {
    let ws = null;
    let isMounted = true;
    try {
      const wsHost = window.location.hostname || '127.0.0.1';
      ws = new WebSocket(`ws://${wsHost}:8085`);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (!isMounted || !data) return;
          if (
            data.event === 'zoom_meeting_created' ||
            data.event === 'zoom_meeting_updated' ||
            data.event === 'zoom_meeting_status_changed' ||
            data.event === 'zoom_meeting_deleted'
          ) {
            loadMeetings();
            if (data.event === 'zoom_meeting_status_changed') {
              setToast(`Meeting "${data.title}" is now ${data.status.toUpperCase()}!`);
              setTimeout(() => setToast(''), 4500);
            }
          }
        } catch {}
      };
    } catch {}
    return () => {
      isMounted = false;
      if (ws) {
        try { ws.close(); } catch {}
      }
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMeetings();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // When teacher is selected in modal form, fetch their enrolled students automatically
  const handleTeacherChange = async (tid) => {
    setFormTeacherId(tid);
    setSelectedStudentIds([]);
    if (!tid) {
      setTeacherStudents([]);
      return;
    }
    setLoadingStudents(true);
    try {
      const res = await zoomMeetingApi.teacherStudents(tid, role);
      const list = res.students || [];
      setTeacherStudents(list);
      // Automatically select all students under this teacher by default
      setSelectedStudentIds(list.map(s => s.id));
    } catch (err) {
      console.error('Failed to load students for teacher', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === teacherStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(teacherStudents.map(s => s.id));
    }
  };

  const handleToggleStudent = (sId) => {
    setSelectedStudentIds(prev =>
      prev.includes(sId) ? prev.filter(id => id !== sId) : [...prev, sId]
    );
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormTitle('');
    setFormLink('');
    setFormMeetingId('');
    setFormPasscode('');
    setFormTeacherId('');
    setTeacherDropdownOpen(false);
    setTeacherSearch('');
    setTeacherStudents([]);
    setSelectedStudentIds([]);
    // Default today date in Kolkata
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    setFormDate(dateStr);
    setFormTime('10:00');
    setFormDuration('60');
    setFormStatus('scheduled');
    setFormNotes('');
    setShowModal(true);
  };

  const openEditModal = async (m) => {
    setModalMode('edit');
    setEditingId(m.id);
    setFormTitle(m.title || '');
    setFormLink(m.meeting_link || '');
    setFormMeetingId(m.meeting_id || '');
    setFormPasscode(m.passcode || '');
    setFormTeacherId(m.teacher_id);
    setTeacherDropdownOpen(false);
    setTeacherSearch('');
    setFormDate(m.scheduled_date || '');
    setFormTime(m.scheduled_time ? m.scheduled_time.slice(0, 5) : '10:00');
    setFormDuration(String(m.duration_minutes || 60));
    setFormStatus(m.status || 'scheduled');
    setFormNotes(m.notes || '');

    setShowModal(true);
    setLoadingStudents(true);
    try {
      const res = await zoomMeetingApi.teacherStudents(m.teacher_id, role);
      setTeacherStudents(res.students || []);
      const existingStudentIds = (m.students || []).map(s => s.id);
      setSelectedStudentIds(existingStudentIds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    try {
      const payload = {
        id: editingId,
        title: formTitle.trim(),
        meeting_link: formLink.trim(),
        meeting_id: formMeetingId.trim(),
        passcode: formPasscode.trim(),
        teacher_id: Number(formTeacherId),
        scheduled_date: formDate,
        scheduled_time: formTime,
        duration_minutes: Number(formDuration),
        status: formStatus,
        notes: formNotes.trim(),
        student_ids: selectedStudentIds
      };

      await zoomMeetingApi.save(payload, role);
      setShowModal(false);
      setToast(modalMode === 'create' ? 'Zoom meeting scheduled and sent!' : 'Zoom meeting updated successfully!');
      setTimeout(() => setToast(''), 4000);
      await loadMeetings();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormBusy(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    let cancelReason = '';
    if (newStatus === 'cancelled') {
      const input = window.prompt('Optional reason for cancellation (visible to teacher & students):', 'Class cancelled by admin.');
      if (input === null) return; // User pressed Cancel
      cancelReason = input;
    } else {
      if (!window.confirm(`Are you sure you want to mark this class as ${newStatus.toUpperCase()}?`)) {
        return;
      }
    }

    try {
      await zoomMeetingApi.updateStatus(id, newStatus, cancelReason, role);
      await loadMeetings();
      setToast(`Class status updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting? This cannot be undone.')) {
      try {
        await zoomMeetingApi.delete(id, role);
        await loadMeetings();
        setToast('Meeting deleted.');
        setTimeout(() => setToast(''), 3000);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const toggleRoster = (mId) => {
    setExpandedRosterIds(prev => ({ ...prev, [mId]: !prev[mId] }));
  };

  const filteredMeetings = useMemo(() => {
    if (activeTab === 'all') return meetings;
    return meetings.filter(m => m.status === activeTab);
  }, [meetings, activeTab]);

  const liveCount = meetings.filter(m => m.status === 'live').length;
  const scheduledCount = meetings.filter(m => m.status === 'scheduled').length;
  const completedCount = meetings.filter(m => m.status === 'completed').length;
  const cancelledCount = meetings.filter(m => m.status === 'cancelled').length;

  return (
    <section className="zoom-section">
      {/* Top Banner & Header */}
      <header className="zoom-header">
        <div className="zoom-header-main">
          <div className="zoom-badge-row">
            <span className="zoom-portal-tag">{role} Live Room</span>
          </div>
          <h1>📹 {title}</h1>
          <p>
            {role === 'admin'
              ? 'Schedule Zoom meetings, assign teachers, select students, and control live status in real time.'
              : 'Join your live interactive Zoom classes and review your schedule.'}
          </p>
        </div>

        <div className="zoom-header-actions">
          <button
            type="button"
            className={`zoom-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title="Refresh meetings"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Refresh</span>
          </button>

          {role === 'admin' && (
            <button
              type="button"
              className="zoom-schedule-btn"
              onClick={openCreateModal}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Schedule Live Class</span>
            </button>
          )}
        </div>
      </header>

      {toast && (
        <div className="class-chat-toast" role="status" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>🔔</span>
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="class-chat-error" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="zoom-controls-bar">
        <div className="zoom-status-tabs" role="tablist">
          <button
            type="button"
            className={`zoom-status-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Classes <span className="tab-badge">{meetings.length}</span>
          </button>
          <button
            type="button"
            className={`zoom-status-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            🟢 Live Now <span className="tab-badge">{liveCount}</span>
          </button>
          <button
            type="button"
            className={`zoom-status-tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
          >
            Scheduled <span className="tab-badge">{scheduledCount}</span>
          </button>
          <button
            type="button"
            className={`zoom-status-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed <span className="tab-badge">{completedCount}</span>
          </button>
          <button
            type="button"
            className={`zoom-status-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled <span className="tab-badge">{cancelledCount}</span>
          </button>
        </div>
      </div>

      {/* Meeting Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="chat-loading-spinner" style={{ margin: '0 auto 12px auto' }}></div>
          <p style={{ color: '#64748b' }}>Loading live classes...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="zoom-empty-state">
          <div className="zoom-empty-icon">📹</div>
          <h3>No {activeTab !== 'all' ? activeTab : ''} classes found</h3>
          <p>
            {role === 'admin'
              ? 'Click the "Schedule Live Class" button above to create a Zoom session with a teacher and assigned students.'
              : 'There are no active live sessions scheduled for your account right now.'}
          </p>
          {role === 'admin' && (
            <button type="button" className="zoom-schedule-btn" onClick={openCreateModal}>
              Schedule Your First Class
            </button>
          )}
        </div>
      ) : (
        <div className="zoom-cards-grid">
          {filteredMeetings.map(m => {
            const isLive = m.status === 'live';
            const isCancelled = m.status === 'cancelled';
            const isCompleted = m.status === 'completed';

            return (
              <article
                key={m.id}
                className={`zoom-card status-${m.status}`}
              >
                <div>
                  <div className="zoom-card-top">
                    <span className={`zoom-card-status-badge ${m.status}`}>
                      {isLive && <span className="pulse-ring"></span>}
                      {m.status === 'live' ? '🟢 Live Now' : m.status}
                    </span>

                    {role === 'admin' && (
                      <div className="zoom-card-actions">
                        <button
                          type="button"
                          className="zoom-icon-btn"
                          title="Edit Meeting"
                          onClick={() => openEditModal(m)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="zoom-icon-btn danger"
                          title="Delete Meeting"
                          onClick={() => handleDelete(m.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="zoom-card-title">{m.title}</h3>

                  {/* Teacher Information (Hidden for student role) */}
                  {role !== 'student' && (
                    <div className="zoom-teacher-chip">
                      <div className="zoom-teacher-avatar">
                        {m.teacher_photo ? (
                          <img
                            src={formatPhotoUrl(m.teacher_photo)}
                            alt={m.teacher_name}
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display = 'inline';
                              }
                            }}
                          />
                        ) : null}
                        <span style={{ display: m.teacher_photo ? 'none' : 'inline' }}>
                          {(m.teacher_name || 'T')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="zoom-teacher-name">Teacher: {m.teacher_name}</div>
                        <div className="zoom-teacher-title">{m.teacher_email || 'Assigned Instructor'}</div>
                      </div>
                    </div>
                  )}

                  {/* Date, Time (Asia/Kolkata) & Duration */}
                  <div className="zoom-meta-info">
                    <div className="zoom-meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span><strong>Date:</strong> {formatKolkataTime(m.scheduled_date, m.scheduled_time)}</span>
                    </div>

                    <div className="zoom-meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span><strong>Time:</strong> {formatTime12h(m.scheduled_time)} ({m.duration_minutes} mins)</span>
                    </div>

                    {m.meeting_id && (
                      <div className="zoom-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>ID: <code>{m.meeting_id}</code> {m.passcode && `· Passcode: ${m.passcode}`}</span>
                      </div>
                    )}
                  </div>

                  {/* Class Instructions (Visible to Admin, Teacher, and Student) */}
                  {m.notes && m.notes.trim() !== '' && (
                    <div className="zoom-card-note">
                      <div className="zoom-note-header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <span>Instructions:</span>
                      </div>
                      <p className="zoom-note-text">{m.notes}</p>
                    </div>
                  )}

                  {/* Cancelled Banner */}
                  {isCancelled && (
                    <div className="zoom-cancelled-banner">
                      ⚠️ <strong>Class Cancelled:</strong> {m.cancel_reason || 'Cancelled by Admin.'}
                    </div>
                  )}

                  {/* Students Roster (Hidden for student role) */}
                  {role !== 'student' && (
                    <div className="zoom-students-roster">
                      <button
                        type="button"
                        className="roster-toggle-btn"
                        onClick={() => toggleRoster(m.id)}
                      >
                        👥 {m.student_count || 0} Student{m.student_count !== 1 ? 's' : ''} Enrolled
                        <span>{expandedRosterIds[m.id] ? '▲ Hide' : '▼ View'}</span>
                      </button>

                      {expandedRosterIds[m.id] && (
                        <div className="roster-tags-wrap">
                          {m.students && m.students.length > 0 ? (
                            m.students.map(s => (
                              <span key={s.id} className="student-tag" title={s.email}>
                                {s.student_name}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>All students of teacher</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer / Join CTA */}
                <div className="zoom-card-footer">
                  {!isCancelled && (
                    <a
                      href={m.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`zoom-join-btn ${isLive ? 'live' : isCompleted ? 'completed' : ''}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                      <span>
                        {isLive
                          ? 'Join Zoom Meeting (LIVE)'
                          : isCompleted
                          ? 'Completed'
                          : 'Join Zoom Meeting'}
                      </span>
                    </a>
                  )}

                  {/* Admin Fast Status Toolbar */}
                  {role === 'admin' && (
                    <div className="zoom-status-changer">
                      <span className="status-change-label">Set Status:</span>
                      <div className="status-btn-group">
                        <button
                          type="button"
                          className="status-pill-btn btn-live"
                          onClick={() => handleStatusChange(m.id, 'live')}
                          title="Mark class as Live right now"
                        >
                          Live
                        </button>
                        <button
                          type="button"
                          className="status-pill-btn btn-complete"
                          onClick={() => handleStatusChange(m.id, 'completed')}
                          title="Mark class completed"
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          className="status-pill-btn btn-cancel"
                          onClick={() => handleStatusChange(m.id, 'cancelled')}
                          title="Cancel this class"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="status-pill-btn btn-schedule"
                          onClick={() => handleStatusChange(m.id, 'scheduled')}
                          title="Revert to Scheduled"
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Admin Schedule / Edit Modal */}
      {showModal && role === 'admin' && (
        <div className="zoom-modal-backdrop" onClick={() => !formBusy && setShowModal(false)}>
          <div className="zoom-modal" onClick={e => e.stopPropagation()}>
            <div className="zoom-modal-header">
              <h2>📹 {modalMode === 'create' ? 'Schedule New Live Class' : 'Edit Live Class'}</h2>
              <button
                type="button"
                className="zoom-modal-close"
                onClick={() => !formBusy && setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form className="zoom-modal-form" onSubmit={handleSubmitForm}>
              {/* Meeting Title */}
              <div className="zoom-form-group">
                <label>Meeting Title / Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spoken English 1-on-1 Practice or Group Discussion"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                />
              </div>

              {/* Zoom Link */}
              <div className="zoom-form-group">
                <label>Zoom Meeting Link URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://us04web.zoom.us/j/... or Google Meet"
                  value={formLink}
                  onChange={e => setFormLink(e.target.value)}
                />
              </div>

              {/* Custom Attractive Teacher Selection Dropdown */}
              <div className="zoom-form-group zoom-custom-dropdown-group">
                <label>Assign Teacher *</label>
                <div className="zoom-custom-select-wrapper">
                  <button
                    type="button"
                    className={`zoom-custom-select-trigger ${formTeacherId ? 'has-value' : ''} ${teacherDropdownOpen ? 'open' : ''}`}
                    onClick={() => setTeacherDropdownOpen(prev => !prev)}
                  >
                    <div className="zoom-select-label-wrap">
                      {(() => {
                        const selectedTeacher = teachers.find(t => String(t.id) === String(formTeacherId));
                        if (!selectedTeacher) {
                          return <span className="zoom-select-placeholder">-- Select Teacher --</span>;
                        }
                        return (
                          <div className="zoom-selected-teacher-pill">
                            <span className="zoom-teacher-avatar-mini">
                              {selectedTeacher.photo ? (
                                <img
                                  src={formatPhotoUrl(selectedTeacher.photo)}
                                  alt={selectedTeacher.name}
                                  onError={e => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'inline';
                                  }}
                                />
                              ) : null}
                              <span style={{ display: selectedTeacher.photo ? 'none' : 'inline' }}>
                                {(selectedTeacher.name || 'T').charAt(0).toUpperCase()}
                              </span>
                            </span>
                            <span className="zoom-selected-name">{selectedTeacher.name}</span>
                            <span className="zoom-selected-spec">
                              ({selectedTeacher.specialization || 'Teacher'})
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="zoom-select-actions-wrap">
                      {formTeacherId && (
                        <span
                          role="button"
                          className="zoom-select-clear-btn"
                          title="Clear / Remove selected teacher"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeacherChange('');
                            setTeacherSearch('');
                          }}
                        >
                          ✕
                        </span>
                      )}
                      <svg
                        className={`zoom-select-arrow ${teacherDropdownOpen ? 'rotated' : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </button>

                  {/* Hidden input for form requirement */}
                  <input
                    type="hidden"
                    required
                    value={formTeacherId}
                  />

                  {teacherDropdownOpen && (
                    <div className="zoom-custom-dropdown-menu">
                      <div className="zoom-dropdown-search-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                          type="text"
                          placeholder="Search teacher by name..."
                          value={teacherSearch}
                          onChange={e => setTeacherSearch(e.target.value)}
                          autoFocus
                          onClick={e => e.stopPropagation()}
                        />
                        {teacherSearch && (
                          <button
                            type="button"
                            className="zoom-search-clear-btn"
                            onClick={() => setTeacherSearch('')}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="zoom-custom-dropdown-list custom-scrollbar">
                        {/* Option to clear / unselect teacher */}
                        <div
                          className={`zoom-dropdown-item zoom-dropdown-item-reset ${!formTeacherId ? 'selected' : ''}`}
                          onClick={() => {
                            handleTeacherChange('');
                            setTeacherDropdownOpen(false);
                            setTeacherSearch('');
                          }}
                        >
                          <div className="zoom-dropdown-item-avatar zoom-avatar-placeholder">
                            <span>✕</span>
                          </div>
                          <div className="zoom-dropdown-item-info">
                            <span className="zoom-item-name" style={{ color: '#64748b' }}>-- Select Teacher --</span>
                            <span className="zoom-item-spec">Clear / remove assigned teacher</span>
                          </div>
                          {!formTeacherId && (
                            <svg className="zoom-item-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        {teachers.filter(t => {
                          if (!teacherSearch.trim()) return true;
                          const q = teacherSearch.toLowerCase();
                          return (
                            (t.name || '').toLowerCase().includes(q) ||
                            (t.specialization || '').toLowerCase().includes(q)
                          );
                        }).length === 0 ? (
                          <div className="zoom-dropdown-empty">No teachers match "{teacherSearch}"</div>
                        ) : (
                          teachers
                            .filter(t => {
                              if (!teacherSearch.trim()) return true;
                              const q = teacherSearch.toLowerCase();
                              return (
                                (t.name || '').toLowerCase().includes(q) ||
                                (t.specialization || '').toLowerCase().includes(q)
                              );
                            })
                            .map(t => {
                              const isSelected = String(t.id) === String(formTeacherId);
                              return (
                                <div
                                  key={t.id}
                                  className={`zoom-dropdown-item ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    handleTeacherChange(t.id);
                                    setTeacherDropdownOpen(false);
                                    setTeacherSearch('');
                                  }}
                                >
                                  <div className="zoom-dropdown-item-avatar">
                                    {t.photo ? (
                                      <img
                                        src={formatPhotoUrl(t.photo)}
                                        alt={t.name}
                                        onError={e => {
                                          e.currentTarget.style.display = 'none';
                                          if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'inline';
                                        }}
                                      />
                                    ) : null}
                                    <span style={{ display: t.photo ? 'none' : 'inline' }}>
                                      {(t.name || 'T').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="zoom-dropdown-item-info">
                                    <span className="zoom-item-name">{t.name}</span>
                                    <span className="zoom-item-spec">{t.specialization || 'Teacher'}</span>
                                  </div>
                                  {isSelected && (
                                    <svg className="zoom-item-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  )}
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Students Selection Roster */}
              {formTeacherId && (
                <div className="zoom-form-group">
                  <label>
                    <span>Assign Students ({selectedStudentIds.length}/{teacherStudents.length} selected)</span>
                    {teacherStudents.length > 0 && (
                      <button
                        type="button"
                        className="select-all-btn"
                        onClick={handleSelectAllStudents}
                      >
                        {selectedStudentIds.length === teacherStudents.length ? 'Deselect All' : 'Select All Students'}
                      </button>
                    )}
                  </label>

                  {loadingStudents ? (
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading students under this teacher...</p>
                  ) : teacherStudents.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No students registered under this teacher yet.</p>
                  ) : (
                    <div className="zoom-students-picker">
                      {teacherStudents.map(s => {
                        const isChecked = selectedStudentIds.includes(s.id);
                        return (
                          <label key={s.id} className="student-checkbox-item">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleStudent(s.id)}
                            />
                            <span className="student-checkbox-name">{s.student_name}</span>
                            <span className="student-checkbox-course">{s.course || 'Enrolled'}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Date & Time */}
              <div className="zoom-form-row">
                <div className="zoom-form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                  />
                </div>
                <div className="zoom-form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Duration & Status */}
              <div className="zoom-form-row">
                <div className="zoom-form-group">
                  <label>Duration (Minutes)</label>
                  <select
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes (1 hour)</option>
                    <option value="90">90 minutes (1.5 hours)</option>
                    <option value="120">120 minutes (2 hours)</option>
                  </select>
                </div>
                <div className="zoom-form-group">
                  <label>Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value)}
                  >
                    <option value="scheduled">🔵 Scheduled</option>
                    <option value="live">🟢 Live Now</option>
                    <option value="completed">⚪ Completed</option>
                    <option value="cancelled">🔴 Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Instructions for Teacher & Students */}
              <div className="zoom-form-group">
                <label>Instructions</label>
                <textarea
                  rows={3}
                  placeholder="(write here about time )"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                />
              </div>

              <div className="zoom-modal-footer">
                <button
                  type="button"
                  className="zoom-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={formBusy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="zoom-submit-btn"
                  disabled={formBusy}
                >
                  {formBusy ? 'Sending...' : modalMode === 'create' ? 'Send Live Meeting' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
