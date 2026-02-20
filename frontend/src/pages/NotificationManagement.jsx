import { useState, useEffect } from 'react';
import api from '../services/api';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0
  });
  const [filter, setFilter] = useState('all');
  const [testForm, setTestForm] = useState({
    email: '',
    phone: '',
    type: 'email'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications/history?status=${filter === 'all' ? '' : filter}`);
      setNotifications(response.data.notifications || []);
      setStats(response.data.stats || { total: 0, sent: 0, failed: 0, pending: 0 });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerReminders = async () => {
    try {
      setTriggerLoading(true);
      const response = await api.post('/notifications/trigger-reminders');
      setMessage({ type: 'success', text: response.data.message });
      fetchNotifications();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to trigger reminders' });
    } finally {
      setTriggerLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleTestNotification = async (e) => {
    e.preventDefault();
    try {
      setTestLoading(true);
      const response = await api.post('/notifications/test', testForm);
      setMessage({ type: 'success', text: response.data.message });
      setTestForm({ email: '', phone: '', type: 'email' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send test notification' });
    } finally {
      setTestLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      sent: 'bg-green-100 text-green-800',
      delivered: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const styles = {
      email: 'bg-purple-100 text-purple-800',
      sms: 'bg-indigo-100 text-indigo-800',
      both: 'bg-pink-100 text-pink-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  const getReminderTypeBadge = (type) => {
    const labels = {
      '24_hour': '24h Reminder',
      'same_day': 'Same Day',
      '1_hour': '1h Reminder',
      'confirmation': 'Confirmation',
      'cancellation': 'Cancellation'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor appointment reminders sent via SMS and Email
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sent</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-[#5f6FFF]/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#5f6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Actions Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trigger Reminders */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Trigger</h2>
              <p className="text-sm text-gray-600 mb-4">
                Manually trigger reminder notifications for upcoming appointments.
              </p>
              <button
                onClick={handleTriggerReminders}
                disabled={triggerLoading}
                className="w-full bg-[#5f6FFF] hover:bg-[#4b5bdb] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {triggerLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Triggering...
                  </span>
                ) : (
                  'Trigger Reminders Now'
                )}
              </button>
              <p className="text-xs text-gray-500 mt-3">
                💡 Automatic reminders run at 6 PM (24h) and 7 AM (same-day) EAT
              </p>
            </div>

            {/* Test Notification */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Notification</h2>
              <form onSubmit={handleTestNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Type
                  </label>
                  <select
                    value={testForm.type}
                    onChange={(e) => setTestForm({ ...testForm, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#5f6FFF] focus:border-transparent"
                  >
                    <option value="email">Email Only</option>
                    <option value="sms">SMS Only</option>
                    <option value="both">Both Email & SMS</option>
                  </select>
                </div>

                {(testForm.type === 'email' || testForm.type === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={testForm.email}
                      onChange={(e) => setTestForm({ ...testForm, email: e.target.value })}
                      placeholder="test@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#5f6FFF] focus:border-transparent"
                      required={testForm.type === 'email' || testForm.type === 'both'}
                    />
                  </div>
                )}

                {(testForm.type === 'sms' || testForm.type === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={testForm.phone}
                      onChange={(e) => setTestForm({ ...testForm, phone: e.target.value })}
                      placeholder="0712345678"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#5f6FFF] focus:border-transparent"
                      required={testForm.type === 'sms' || testForm.type === 'both'}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={testLoading}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {testLoading ? 'Sending...' : 'Send Test'}
                </button>
              </form>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reminder Schedule</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <span><strong>24 Hours Before:</strong> Evening reminder (6 PM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span><strong>Same Day:</strong> Morning reminder (7 AM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span><strong>Hourly Check:</strong> 8 AM - 5 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">Notification History</h2>
                  <div className="flex gap-2">
                    {['all', 'sent', 'pending', 'failed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          filter === status
                            ? 'bg-[#5f6FFF] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-[#5f6FFF]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">No notifications found</p>
                    <p className="text-sm text-gray-400 mt-1">Notifications will appear here once sent</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recipient
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reminder
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sent At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <tr key={notification.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              {notification.recipient_email && (
                                <p className="text-gray-900">{notification.recipient_email}</p>
                              )}
                              {notification.recipient_phone && (
                                <p className="text-gray-500">{notification.recipient_phone}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(notification.notification_type)}`}>
                              {notification.notification_type?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {getReminderTypeBadge(notification.reminder_type)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(notification.status)}`}>
                              {notification.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500">
                            {formatDate(notification.sent_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
