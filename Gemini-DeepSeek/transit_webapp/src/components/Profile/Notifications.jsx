import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const navigate = useNavigate();

    const notifications = [
        {
            id: 1,
            title: 'Trip Updates',
            time: '9min',
            unread: true,
            message: 'Bus #18 to 6 Kilo is arriving at Bole Michael in 3 mins.',
            type: 'trip'
        },
        {
            id: 2,
            title: 'Trip Updates',
            time: '20min',
            unread: false,
            message: 'Train to Ayat delayed by 5 mins due to traffic near Megenagna.',
            type: 'trip'
        },
        {
            id: 3,
            title: 'General Announcements',
            time: '35min',
            unread: false,
            message: 'Public transport will operate on reduced schedule tomorrow for holiday.',
            type: 'announcement'
        }
    ];

    const yesterdayNotifications = [
        {
            id: 4,
            title: 'Trip Updates',
            time: '9min',
            unread: false,
            message: 'Your saved route CMC → Arat Kilo (Bus) now has heavy traffic. ETA +10 mins.',
            type: 'trip'
        }
    ];

    return (
        <div className="notifications-screen screen">
            {/* Header */}
            <div className="profile-header" style={{ position: 'sticky', top: 0, background: '#EAEAEA'}}>
                <button className="icon-btn-ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} color="#343A40" />
                </button>
                <span className="header-title" style={{ fontSize: '18px' }}>Notifications</span>
                <div style={{ width: 24 }}></div>
            </div>

            <div className="notifications-content" style={{ padding: '0 24px 80px', marginTop: '16px'}}>
                <div className="notification-date-label">Today</div>
                {notifications.map(notif => (
                    <div key={notif.id} className="notification-card">
                        <div className="notif-icon-box">
                            <Bell size={20} color={notif.type === 'trip' ? '#4A90E2' : '#6C757D'} />
                        </div>
                        <div className="notif-text-box">
                            <div className="notif-header">
                                <span className="notif-title">{notif.title}</span>
                                <div className="notif-meta">
                                    <span className="notif-time">{notif.time}</span>
                                    {notif.unread && <div className="unread-dot"></div>}
                                </div>
                            </div>
                            <p className="notif-msg">{notif.message}</p>
                        </div>
                    </div>
                ))}

                <div className="notification-date-label" style={{ marginTop: '32px' }}>Yesterday</div>
                {yesterdayNotifications.map(notif => (
                    <div key={notif.id} className="notification-card">
                        <div className="notif-icon-box">
                            <Bell size={20} color="#6C757D" />
                        </div>
                        <div className="notif-text-box">
                            <div className="notif-header">
                                <span className="notif-title">{notif.title}</span>
                                <div className="notif-meta">
                                    <span className="notif-time">{notif.time}</span>
                                </div>
                            </div>
                            <p className="notif-msg">{notif.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
