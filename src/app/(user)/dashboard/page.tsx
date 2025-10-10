"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../../components/AuthContext";
import { ProtectedRoute } from "../../../components/ProtectedRoute";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  departments: any;
  registration_needed: boolean;
  registration_link?: string;
  cover_color?: string;
  created_by: number;
  creator: {
    id: number;
    name: string;
    email: string;
    department?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Calculate events for current month
  const getCurrentMonthEvents = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return events.filter((event) => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      return (
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    }).length;
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "All Departments" ||
      (event.departments &&
        Array.isArray(event.departments) &&
        event.departments.includes(selectedDepartment));
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentTagClass = (dept: string) => {
    switch (dept) {
      case "CS":
        return "tag-cs";
      case "SE":
        return "tag-se";
      case "IS":
        return "tag-is";
      default:
        return "";
    }
  };

  const getDepartmentDotClass = (dept: string) => {
    switch (dept) {
      case "CS":
        return "dot-cs";
      case "SE":
        return "dot-se";
      case "IS":
        return "dot-is";
      default:
        return "";
    }
  };

  const getEventIcon = (departments: any) => {
    if (!departments || !Array.isArray(departments)) return "📅";
    if (departments.includes("CS")) return "🤖";
    if (departments.includes("SE")) return "🏗️";
    if (departments.includes("IS")) return "🗃️";
    return "📅";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="dashboard-container">
        <style jsx>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .dashboard-container {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              sans-serif;
            background: linear-gradient(
              135deg,
              #0f172a 0%,
              #1e1b4b 50%,
              #0f172a 100%
            );
            color: #f8fafc;
            line-height: 1.6;
            min-height: 100vh;
          }

          .header {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(71, 85, 105, 0.3);
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
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
          }

          .logo-text {
            display: flex;
            flex-direction: column;
          }

          .logo-title {
            font-size: 16px;
            font-weight: 600;
            color: #f8fafc;
          }

          .logo-subtitle {
            font-size: 12px;
            color: #94a3b8;
          }

          .header-actions {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .full-calendar-btn {
            color: #94a3b8;
            text-decoration: none;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: color 0.2s ease;
          }

          .full-calendar-btn:hover {
            color: #f8fafc;
          }

          .notification-icon,
          .profile-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(71, 85, 105, 0.3);
            color: #94a3b8;
            cursor: pointer;
            position: relative;
            transition: all 0.2s ease;
          }

          .notification-icon:hover,
          .profile-icon:hover {
            background: rgba(71, 85, 105, 0.5);
            color: #f8fafc;
          }

          .notification-icon::after {
            content: "";
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
            color: #f8fafc;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .new-events-badge {
            background: linear-gradient(135deg, #10b981, #059669);
            color: #ffffff;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          }

          .welcome-description {
            color: #94a3b8;
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
            background: rgba(30, 27, 75, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(71, 85, 105, 0.3);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            border-color: rgba(139, 92, 246, 0.5);
          }

          .stat-info h3 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
          }

          .stat-info p {
            color: #94a3b8;
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

          .upcoming-events .stat-icon {
            background: #3b82f6;
          }
          .registrations .stat-icon {
            background: #10b981;
          }
          .department .stat-icon {
            background: #8b5cf6;
          }

          .content-grid {
            display: block;
          }

          .events-section {
            background: rgba(30, 27, 75, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(71, 85, 105, 0.3);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }

          .search-filter {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .search-input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid rgba(71, 85, 105, 0.5);
            border-radius: 12px;
            font-size: 14px;
            background: rgba(51, 65, 85, 0.3);
            color: #f8fafc;
            transition: all 0.2s ease;
          }

          .search-input:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
            background: rgba(51, 65, 85, 0.5);
          }

          .search-input::placeholder {
            color: #94a3b8;
          }

          .filter-select {
            padding: 0.75rem;
            border: 1px solid rgba(71, 85, 105, 0.5);
            border-radius: 12px;
            font-size: 14px;
            background: rgba(51, 65, 85, 0.3);
            color: #f8fafc;
            min-width: 150px;
            transition: all 0.2s ease;
          }

          .filter-select:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
            background: rgba(51, 65, 85, 0.5);
          }

          .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #f8fafc;
            margin-bottom: 1.5rem;
          }

          .event-card {
            border: 1px solid rgba(71, 85, 105, 0.3);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(51, 65, 85, 0.2);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }

          .event-card:hover {
            border-color: rgba(139, 92, 246, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          }

          .event-icon {
            width: 48px;
            height: 48px;
            background: rgba(71, 85, 105, 0.3);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            border: 1px solid rgba(71, 85, 105, 0.5);
          }

          .event-content {
            flex: 1;
          }

          .event-content a {
            text-decoration: none;
            color: #f8fafc;
          }

          .event-title {
            font-size: 16px;
            font-weight: 600;
            color: #f8fafc;
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .event-subtitle {
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 0.5rem;
          }

          .event-details {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 12px;
            color: #94a3b8;
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
            background: rgba(71, 85, 105, 0.3);
            color: #f8fafc;
            border: 1px solid rgba(71, 85, 105, 0.5);
          }

          .department-tag {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
            color: white;
          }

          .tag-cs {
            background: #3b82f6;
          }
          .tag-se {
            background: #10b981;
          }
          .tag-is {
            background: #8b5cf6;
          }

          @media (max-width: 768px) {
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
                <div className="logo-subtitle">
                  University of Sri Jayewardenepura
                </div>
              </div>
            </Link>
          </div>
          <div className="header-actions">
            <Link href="/calendar" className="full-calendar-btn">
              📅 Full Calendar
            </Link>
            <div className="notification-icon">
              <Link href="/notifications">🔔</Link>
            </div>
            <div className="profile-icon">
              <Link href="/profile">👤</Link>
            </div>
            <button
              onClick={handleLogout}
              className="logout-btn"
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main-content">
          <section className="welcome-section">
            <h1 className="welcome-title">
              Welcome back, {user?.name || "User"}!
              <span className="new-events-badge">● {events.length} events</span>
            </h1>
            <p className="welcome-description">
              Discover exciting events, workshops, and activities across
              Computer Science, Software Engineering, and Information Systems
              departments.
            </p>
          </section>

          <div className="stats-grid">
            <div className="stat-card upcoming-events">
              <div className="stat-info">
                <h3>{getCurrentMonthEvents()}</h3>
                <p>This month</p>
              </div>
              <div className="stat-icon">📅</div>
            </div>
            <div className="stat-card registrations">
              <div className="stat-info">
                <h3>{events.length}</h3>
                <p>Total events</p>
              </div>
              <div className="stat-icon">👥</div>
            </div>
            <div className="stat-card department">
              <div className="stat-info">
                <h3>{user?.department || "N/A"}</h3>
                <p>{user?.student_id || "N/A"}</p>
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
                  <option value="CS">Computer Science</option>
                  <option value="SE">Software Engineering</option>
                  <option value="IS">Information Systems</option>
                </select>
              </div>

              <h2 className="section-title">Upcoming Events</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-slate-400">Loading events...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-400">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No events found.</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-icon">
                      {getEventIcon(event.departments)}
                    </div>
                    <div className="event-content">
                      <Link href={`/events/${event.id}`}>
                        <h3 className="event-title">
                          {event.title}
                          {event.departments &&
                            Array.isArray(event.departments) &&
                            event.departments.map((dept: string) => (
                              <span
                                key={dept}
                                className={`department-tag ${getDepartmentTagClass(
                                  dept
                                )}`}
                              >
                                {dept}
                              </span>
                            ))}
                        </h3>
                      </Link>
                      <p className="event-subtitle">{event.description}</p>
                      <div className="event-details">
                        <span>
                          📅 {formatDate(event.date)} at {event.time}
                        </span>
                        <span>📍 {event.location}</span>
                        <span>👤 Created by {event.creator.name}</span>
                      </div>
                    </div>
                    <div className="event-actions">
                      <button className="btn btn-secondary">
                        <Link href={`/events/${event.id}`}>View Details</Link>
                      </button>
                      {event.registration_needed && event.registration_link ? (
                        <button className="btn btn-primary">
                          <a
                            href={event.registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Register
                          </a>
                        </button>
                      ) : (
                        <button className="btn btn-primary" disabled>
                          No Registration
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
