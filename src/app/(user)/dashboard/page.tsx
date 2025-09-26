'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Event {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  registered: number;
  capacity: number;
  department: 'CS' | 'SE' | 'IS';
  icon: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface Department {
  name: string;
  code: 'CS' | 'SE' | 'IS';
  eventCount: number;
  color: string;
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');

  const events: Event[] = [
    {
      id: 1,
      title: 'AI Workshop Series',
      subtitle: 'Introduction to Machine Learning fundamentals',
      date: '2025-06-25',
      time: '2:00 PM',
      location: 'Lab 301',
      registered: 45,
      capacity: 50,
      department: 'CS',
      icon: '🤖',
      isNew: true,
      isFeatured: true
    },
    {
      id: 2,
      title: 'Software Architecture Seminar',
      subtitle: 'Best practices in modern software architecture',
      date: '2025-06-28',
      time: '10:00 AM',
      location: 'Auditorium A',
      registered: 32,
      capacity: 100,
      department: 'SE',
      icon: '🏗️'
    },
    {
      id: 3,
      title: 'Database Design Competition',
      subtitle: 'Annual database design challenge',
      date: '2025-07-02',
      time: '9:00 AM',
      location: 'Computer Lab 2',
      registered: 28,
      capacity: 30,
      department: 'IS',
      icon: '🗃️',
      isFeatured: true
    }
  ];

  const departments: Department[] = [
    { name: 'Computer Science', code: 'CS', eventCount: 12, color: '#3b82f6' },
    { name: 'Software Engineering', code: 'SE', eventCount: 8, color: '#10b981' },
    { name: 'Information Systems', code: 'IS', eventCount: 6, color: '#8b5cf6' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All Departments' || 
                             event.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentTagClass = (dept: string) => {
    switch (dept) {
      case 'CS': return 'tag-cs';
      case 'SE': return 'tag-se';
      case 'IS': return 'tag-is';
      default: return '';
    }
  };

  const getDepartmentDotClass = (dept: string) => {
    switch (dept) {
      case 'CS': return 'dot-cs';
      case 'SE': return 'dot-se';
      case 'IS': return 'dot-is';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container">
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8fafc;
          color: #334155;
          line-height: 1.6;
          min-height: 100vh;
        }

        .header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          font-weight: 600;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .logo-subtitle {
          font-size: 12px;
          color: #64748b;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .full-calendar-btn {
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .notification-icon, .profile-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
          position: relative;
        }

        .notification-icon::after {
          content: '';
          position: absolute;
          top: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .welcome-section {
          margin-bottom: 2rem;
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .new-events-badge {
          background: #dcfce7;
          color: #16a34a;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .welcome-description {
          color: #64748b;
          font-size: 16px;
          max-width: 600px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-info h3 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-info p {
          color: #64748b;
          font-size: 14px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .upcoming-events .stat-icon { background: #3b82f6; }
        .registrations .stat-icon { background: #10b981; }
        .department .stat-icon { background: #8b5cf6; }

        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .events-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .search-filter {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
        }

        .filter-select {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          min-width: 150px;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .event-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .event-icon {
          width: 48px;
          height: 48px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .event-content {
          flex: 1;
        }

        .event-content a {
          text-decoration: none;
          color: black;
        }

        .event-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .event-subtitle {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 0.5rem;
        }

        .event-details {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 12px;
          color: #64748b;
        }

        .event-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary a {
          color: white;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .department-tag {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
          color: white;
        }

        .tag-cs { background: #3b82f6; }
        .tag-se { background: #10b981; }
        .tag-is { background: #8b5cf6; }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .calendar-widget, .departments-widget {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .calendar-month {
          font-size: 1.5rem;
          font-weight: 600;
          color: #8b5cf6;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .calendar-link {
          color: #64748b;
          font-size: 14px;
          text-align: center;
          text-decoration: none;
        }

        .department-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .department-item:last-child {
          border-bottom: none;
        }

        .department-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #1e293b;
        }

        .department-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot-cs { background: #3b82f6; }
        .dot-se { background: #10b981; }
        .dot-is { background: #8b5cf6; }

        .event-count {
          font-size: 12px;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .header {
            padding: 1rem;
          }
          
          .main-content {
            padding: 1rem;
          }
          
          .search-filter {
            flex-direction: column;
          }
        }

        a {
          text-decoration: none;
        }
      `}</style>

      <header className="header">
        <div className="logo-section">
          <div className="logo">📅</div>
          <Link href="/dashboard">
            <div className="logo-text">
              <div className="logo-title">Faculty Events</div>
              <div className="logo-subtitle">University of Sri Jayewardenepura</div>
            </div>
          </Link>
        </div>
        <div className="header-actions">
          <Link href="/calendar" className="full-calendar-btn">📅 Full Calendar</Link>
          <div className="notification-icon">
            <Link href="/notifications">🔔</Link>
          </div>
          <div className="profile-icon">
            <Link href="/profile">👤</Link>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <h1 className="welcome-title">
            Welcome back, John!
            <span className="new-events-badge">● 3 new events</span>
          </h1>
          <p className="welcome-description">
            Discover exciting events, workshops, and activities across Computer Science, 
            Software Engineering, and Information Systems departments.
          </p>
        </section>

        <div className="stats-grid">
          <div className="stat-card upcoming-events">
            <div className="stat-info">
              <h3>{filteredEvents.length}</h3>
              <p>This month</p>
            </div>
            <div className="stat-icon">📅</div>
          </div>
          <div className="stat-card registrations">
            <div className="stat-info">
              <h3>{events.reduce((sum, event) => sum + event.registered, 0)}</h3>
              <p>Total registrations</p>
            </div>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-card department">
            <div className="stat-info">
              <h3>CS</h3>
              <p>FC221001</p>
            </div>
            <div className="stat-icon">🎓</div>
          </div>
        </div>

        <div className="content-grid">
          <section className="events-section">
            <div className="search-filter">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="filter-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option>All Departments</option>
                {departments.map(dept => (
                  <option key={dept.code} value={dept.code}>{dept.name}</option>
                ))}
              </select>
            </div>

            <h2 className="section-title">Upcoming Events</h2>

            {filteredEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-icon">{event.icon}</div>
                <div className="event-content">
                  <Link href={`/events/${event.id}`}>
                    <h3 className="event-title">
                      {event.title}
                      {event.isFeatured && ' ⭐'}
                      <span className={`department-tag ${getDepartmentTagClass(event.department)}`}>
                        {event.department}
                      </span>
                    </h3>
                  </Link>
                  <p className="event-subtitle">{event.subtitle}</p>
                  <div className="event-details">
                    <span>📅 {event.date} at {event.time}</span>
                    <span>📍 {event.location}</span>
                    <span>👥 {event.registered}/{event.capacity} registered</span>
                  </div>
                </div>
                <div className="event-actions">
                  <button className="btn btn-secondary">
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </button>
                  <button className="btn btn-primary">
                    <Link href={`/events/${event.id}/register`}>Register</Link>
                  </button>
                </div>
              </div>
            ))}
          </section>

          <aside className="sidebar">
            <div className="calendar-widget">
              <h3 className="section-title">Quick Calendar</h3>
              <div className="calendar-month">June 2025</div>
              <Link href="/calendar" className="calendar-link">Click to view full calendar</Link>
            </div>

            <div className="departments-widget">
              <h3 className="section-title">Departments</h3>
              {departments.map(dept => (
                <div key={dept.code} className="department-item">
                  <div className="department-name">
                    <span className={`department-dot ${getDepartmentDotClass(dept.code)}`}></span>
                    {dept.name}
                  </div>
                  <span className="event-count">{dept.eventCount} events</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
