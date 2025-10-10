"use client";

import {
  Bell,
  Calendar,
  CalendarDays,
  Filter,
  List,
  LogOut,
  MapPin,
  Plus,
  Search,
  User,
  User as UserIcon,
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Calendar utility functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return events.filter((event) => {
      if (!event.date) return false;
      const eventDate = new Date(event.date).toISOString().split("T")[0];
      return eventDate === dateString;
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
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
    if (!departments || !Array.isArray(departments))
      return <Calendar className="w-5 h-5" />;
    if (departments.includes("CS")) return <User className="w-5 h-5" />;
    if (departments.includes("SE")) return <Plus className="w-5 h-5" />;
    if (departments.includes("IS")) return <UserIcon className="w-5 h-5" />;
    return <Calendar className="w-5 h-5" />;
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
            gap: 12px;
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
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .stat-card {
            background: rgba(30, 27, 75, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(71, 85, 105, 0.3);
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
            border-color: rgba(139, 92, 246, 0.5);
          }

          .stat-info h3 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
          }

          .stat-info p {
            color: #94a3b8;
            font-size: 12px;
          }

          .stat-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
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

          /* Tab Navigation Styles */
          .tab-navigation {
            margin-top: 2rem !important;
            margin-bottom: 2rem !important;
          }

          .tab-navigation button {
            padding: 0.75rem 1.5rem !important;
            min-height: 48px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          /* Calendar Styles */
          .calendar-section {
            background: rgba(30, 27, 75, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(71, 85, 105, 0.3);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }

          .calendar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
          }

          .calendar-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #f8fafc;
            margin: 0;
          }

          .calendar-nav-btn {
            background: rgba(71, 85, 105, 0.3);
            border: 1px solid rgba(71, 85, 105, 0.5);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            color: #f8fafc;
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .calendar-nav-btn:hover {
            background: rgba(71, 85, 105, 0.5);
            border-color: rgba(139, 92, 246, 0.5);
          }

          .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: rgba(71, 85, 105, 0.3);
            border-radius: 12px;
            overflow: hidden;
          }

          .calendar-day-header {
            background: rgba(51, 65, 85, 0.8);
            padding: 1rem 0.5rem;
            text-align: center;
            font-weight: 600;
            color: #94a3b8;
            font-size: 0.875rem;
          }

          .calendar-day {
            background: rgba(51, 65, 85, 0.2);
            min-height: 120px;
            padding: 0.5rem;
            border: 1px solid rgba(71, 85, 105, 0.2);
            transition: all 0.2s ease;
          }

          .calendar-day:hover {
            background: rgba(51, 65, 85, 0.4);
          }

          .calendar-day.today {
            background: rgba(139, 92, 246, 0.2);
            border-color: rgba(139, 92, 246, 0.5);
          }

          .calendar-day.other-month {
            background: rgba(51, 65, 85, 0.1);
            color: #64748b;
          }

          .calendar-day.empty {
            background: transparent;
            border: none;
          }

          .calendar-day-number {
            font-weight: 600;
            color: #f8fafc;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }

          .calendar-day.other-month .calendar-day-number {
            color: #64748b;
          }

          .calendar-events {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .calendar-event {
            background: rgba(59, 130, 246, 0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .calendar-event:hover {
            background: rgba(59, 130, 246, 1);
            transform: scale(1.02);
          }

          .calendar-event.tag-cs {
            background: rgba(59, 130, 246, 0.8);
          }

          .calendar-event.tag-se {
            background: rgba(16, 185, 129, 0.8);
          }

          .calendar-event.tag-is {
            background: rgba(139, 92, 246, 0.8);
          }

          .calendar-event-more {
            background: rgba(71, 85, 105, 0.6);
            color: #94a3b8;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.7rem;
            text-align: center;
            cursor: pointer;
          }

          .calendar-event-more:hover {
            background: rgba(71, 85, 105, 0.8);
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

            .calendar-day {
              min-height: 80px;
              padding: 0.25rem;
            }

            .calendar-day-number {
              font-size: 0.75rem;
            }

            .calendar-event {
              font-size: 0.65rem;
              padding: 1px 4px;
            }

            .calendar-title {
              font-size: 1.25rem;
            }

            .calendar-nav-btn {
              padding: 0.5rem 0.75rem;
              font-size: 1rem;
            }
          }

          a {
            text-decoration: none;
          }
        `}</style>

        <header className="header">
          <div className="logo-section">
            <div className="logo">
              <Calendar className="w-6 h-6" />
            </div>
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
            <div className="notification-icon">
              <Link href="/notifications">
                <Bell className="w-4 h-4" />
              </Link>
            </div>
            <div className="profile-icon">
              <Link href="/profile">
                <User className="w-4 h-4" />
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="logout-btn flex items-center gap-2"
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
              <LogOut className="w-4 h-4" />
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
              <div className="stat-icon">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="stat-card registrations">
              <div className="stat-info">
                <h3>{events.length}</h3>
                <p>Total events</p>
              </div>
              <div className="stat-icon">
                <Plus className="w-4 h-4" />
              </div>
            </div>
            <div className="stat-card department">
              <div className="stat-info">
                <h3>{user?.department || "N/A"}</h3>
                <p>{user?.student_id || "N/A"}</p>
              </div>
              <div className="stat-icon">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="content-grid">
            {/* Tab Navigation */}
            <div className="tab-navigation mt-8 mb-8">
              <div className="flex bg-slate-700/50 rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className={`flex-1 py-6 px-8 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === "list"
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="w-5 h-5" />
                  Events List
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("calendar")}
                  className={`flex-1 py-6 px-8 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === "calendar"
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CalendarDays className="w-5 h-5" />
                  Calendar View
                </button>
              </div>
            </div>

            {activeTab === "list" ? (
              <section className="events-section">
                <div className="search-filter">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="search-input pl-10"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      className="filter-select pl-10"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <option>All Departments</option>
                      <option value="CS">Computer Science</option>
                      <option value="SE">Software Engineering</option>
                      <option value="IS">Information Systems</option>
                    </select>
                  </div>
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
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.date)} at {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            Created by {event.creator.name}
                          </span>
                        </div>
                      </div>
                      <div className="event-actions">
                        <button className="btn btn-secondary">
                          <Link href={`/events/${event.id}`}>View Details</Link>
                        </button>
                        {event.registration_needed &&
                        event.registration_link ? (
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
            ) : (
              <section className="calendar-section">
                <div className="calendar-header">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="calendar-nav-btn"
                  >
                    ←
                  </button>
                  <h2 className="calendar-title">
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="calendar-nav-btn"
                  >
                    →
                  </button>
                </div>

                <div className="calendar-grid">
                  {/* Day headers */}
                  <div className="calendar-day-header">Sun</div>
                  <div className="calendar-day-header">Mon</div>
                  <div className="calendar-day-header">Tue</div>
                  <div className="calendar-day-header">Wed</div>
                  <div className="calendar-day-header">Thu</div>
                  <div className="calendar-day-header">Fri</div>
                  <div className="calendar-day-header">Sat</div>

                  {/* Calendar days */}
                  {getDaysInMonth(currentDate).map((day, index) => {
                    if (!day) {
                      return (
                        <div key={index} className="calendar-day empty"></div>
                      );
                    }

                    const dayEvents = getEventsForDate(day);
                    const isToday =
                      day.toDateString() === new Date().toDateString();
                    const isCurrentMonth =
                      day.getMonth() === currentDate.getMonth();

                    return (
                      <div
                        key={index}
                        className={`calendar-day ${isToday ? "today" : ""} ${
                          !isCurrentMonth ? "other-month" : ""
                        }`}
                      >
                        <div className="calendar-day-number">
                          {day.getDate()}
                        </div>
                        <div className="calendar-events">
                          {dayEvents.slice(0, 3).map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`calendar-event ${getDepartmentTagClass(
                                event.departments?.[0] || ""
                              )}`}
                              title={event.title}
                            >
                              {event.title.length > 15
                                ? event.title.substring(0, 15) + "..."
                                : event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="calendar-event-more">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
