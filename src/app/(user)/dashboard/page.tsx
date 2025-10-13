"use client";

import {
  Bell,
  Calendar,
  CalendarDays,
  List,
  LogOut,
  MapPin,
  Plus,
  Search,
  User,
  User as UserIcon,
  X,
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
  departments: string[] | null;
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
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    "month"
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // View event details
  const viewEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

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
        console.log("=== FRONTEND EVENTS FETCH ===");
        console.log("Events received:", data.events);
        if (data.events && data.events.length > 0) {
          console.log("First event departments:", data.events[0].departments);
          console.log(
            "Type of first event departments:",
            typeof data.events[0].departments
          );
          console.log(
            "Is first event departments an array?",
            Array.isArray(data.events[0].departments)
          );
        }
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

  // Update current time every minute for live time indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
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
    // Create date strings in local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    return events.filter((event) => {
      if (!event.date) return false;
      // Compare with the event date directly (already in YYYY-MM-DD format from API)
      return event.date === dateString;
    });
  };

  // Get week days for week view
  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get start of week (Sunday)
  const getStartOfWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const navigateDate = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (calendarView === "month") {
        if (direction === "prev") {
          newDate.setMonth(newDate.getMonth() - 1);
        } else {
          newDate.setMonth(newDate.getMonth() + 1);
        }
      } else if (calendarView === "week") {
        if (direction === "prev") {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() + 7);
        }
      } else if (calendarView === "day") {
        if (direction === "prev") {
          newDate.setDate(newDate.getDate() - 1);
        } else {
          newDate.setDate(newDate.getDate() + 1);
        }
      }
      return newDate;
    });
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location &&
        event.location.toLowerCase().includes(searchTerm.toLowerCase()));

    // Create department mapping for short codes
    const departmentMap: Record<string, string[]> = {
      "Computer Science": ["Computer Science", "CS"],
      "Software Engineering": ["Software Engineering", "SE"],
      "Information Systems": ["Information Systems", "IS"],
    };

    const matchesDepartment =
      selectedDepartment === "All Departments" ||
      (event.departments &&
        Array.isArray(event.departments) &&
        (event.departments.includes(selectedDepartment) ||
          (departmentMap[selectedDepartment] &&
            event.departments.some((dept) =>
              departmentMap[selectedDepartment].includes(dept)
            ))));

    return matchesSearch && matchesDepartment;
  });

  const getDepartmentTagClass = (dept: string) => {
    switch (dept) {
      case "Computer Science":
        return "bg-blue-500";
      case "Software Engineering":
        return "bg-green-500";
      case "Information Systems":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventIcon = (departments: string[] | null) => {
    if (!departments || !Array.isArray(departments))
      return <Calendar className="w-5 h-5" />;
    if (departments.includes("Computer Science"))
      return <User className="w-5 h-5" />;
    if (departments.includes("Software Engineering"))
      return <Plus className="w-5 h-5" />;
    if (departments.includes("Information Systems"))
      return <UserIcon className="w-5 h-5" />;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100">
        <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <Link href="/dashboard">
              <div className="flex flex-col">
                <div className="text-base font-semibold text-white">
                  Faculty Events
                </div>
                <div className="text-xs text-slate-300 hidden sm:block">
                  University of Sri Jayewardenepura
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="w-8 h-8 rounded-full bg-slate-700/30 flex items-center justify-center text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all relative"
            >
              <Bell className="w-4 h-4" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </Link>
            <Link
              href="/profile"
              className="w-8 h-8 rounded-full bg-slate-700/30 flex items-center justify-center text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all"
            >
              <User className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          <section className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              Welcome back, {user?.name || "User"}!
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                ● {events.length} events
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Discover exciting events, workshops, and activities across
              Computer Science, Software Engineering, and Information Systems
              departments.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:border-purple-500/50 transition-all">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {getCurrentMonthEvents()}
                </h3>
                <p className="text-slate-400 text-xs">This month</p>
              </div>
              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:border-purple-500/50 transition-all">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {events.length}
                </h3>
                <p className="text-slate-400 text-xs">Total events</p>
              </div>
              <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:border-purple-500/50 transition-all">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {user?.department || "N/A"}
                </h3>
                <p className="text-slate-400 text-xs">Your department</p>
              </div>
              <div className="w-9 h-9 bg-purple-500 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-slate-700/50 rounded-2xl p-1 mb-6">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "list"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
              Events List
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "calendar"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Calendar View
            </button>
          </div>

          {activeTab === "list" ? (
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all min-w-[150px]"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">
                    Software Engineering
                  </option>
                  <option value="Information Systems">
                    Information Systems
                  </option>
                </select>
              </div>

              <h2 className="text-2xl font-semibold text-white mb-6">
                Upcoming Events
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-slate-400 mt-4">Loading events...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No events found</p>
                  <p className="text-slate-500 text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border border-slate-700/50 rounded-2xl p-6 bg-slate-700/20 backdrop-blur-sm hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-slate-700/50 border border-slate-600/50 rounded-xl flex items-center justify-center text-slate-400">
                        {getEventIcon(event.departments)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">
                            {event.title}
                          </h3>
                          {event.departments &&
                            Array.isArray(event.departments) && (
                              <div className="flex flex-wrap gap-1">
                                {event.departments.map((dept, index) => (
                                  <span
                                    key={index}
                                    className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDepartmentTagClass(
                                      dept
                                    )}`}
                                  >
                                    {dept}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {event.registration_needed &&
                        event.registration_link ? (
                          <a
                            href={event.registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            Register
                          </a>
                        ) : (
                          <button
                            onClick={() => viewEvent(event)}
                            className="px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded-lg hover:bg-slate-700/70 transition-colors text-sm font-medium"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
              {/* Calendar Header with View Toggle */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  {calendarView === "month"
                    ? currentDate.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : calendarView === "week"
                    ? `Week of ${getStartOfWeek(currentDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}`
                    : currentDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                </h2>
                <div className="flex items-center gap-4">
                  {/* View Toggle Buttons */}
                  <div className="flex bg-slate-700/50 rounded-xl p-1">
                    <button
                      onClick={() => setCalendarView("month")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        calendarView === "month"
                          ? "bg-purple-500 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setCalendarView("week")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        calendarView === "week"
                          ? "bg-purple-500 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setCalendarView("day")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        calendarView === "day"
                          ? "bg-purple-500 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Day
                    </button>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigateDate("prev")}
                      className="p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white hover:bg-slate-700/70 hover:border-purple-500/50 transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white hover:bg-slate-700/70 hover:border-purple-500/50 transition-all text-sm font-medium"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => navigateDate("next")}
                      className="p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white hover:bg-slate-700/70 hover:border-purple-500/50 transition-all"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Content - Conditional Rendering */}
              {calendarView === "month" ? (
                <div className="grid grid-cols-7 gap-px bg-slate-700/50 rounded-xl overflow-hidden">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="bg-slate-600/80 p-4 text-center font-semibold text-slate-300 text-sm"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {getDaysInMonth(currentDate).map((day, index) => {
                    if (!day) {
                      return (
                        <div
                          key={index}
                          className="min-h-[120px] bg-transparent"
                        ></div>
                      );
                    }

                    const dayEvents = getEventsForDate(day);
                    const isToday =
                      day.toDateString() === new Date().toDateString();
                    const isCurrentMonth =
                      day.getMonth() === currentDate.getMonth();

                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[120px] p-2 border border-slate-600/20 transition-all hover:bg-slate-600/40 ${
                          isToday
                            ? "bg-purple-500/20 border-purple-500/50"
                            : "bg-slate-600/20"
                        } ${
                          !isCurrentMonth
                            ? "bg-slate-600/10 text-slate-500"
                            : ""
                        }`}
                      >
                        <div
                          className={`font-semibold text-sm mb-2 ${
                            !isCurrentMonth ? "text-slate-500" : "text-white"
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded cursor-pointer transition-all hover:scale-105 overflow-hidden text-ellipsis whitespace-nowrap ${
                                event.departments &&
                                Array.isArray(event.departments)
                                  ? getDepartmentTagClass(event.departments[0])
                                  : "bg-blue-500"
                              } text-white`}
                              title={`${event.title}${
                                event.departments &&
                                Array.isArray(event.departments)
                                  ? ` - ${event.departments.join(", ")}`
                                  : ""
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div
                              className="text-xs text-slate-400 text-center cursor-pointer hover:bg-slate-600/60 rounded p-1"
                              onClick={() => {
                                setCurrentDate(day);
                                setCalendarView("day");
                              }}
                            >
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : calendarView === "week" ? (
                <div className="grid grid-cols-7 gap-px bg-slate-700/50 rounded-xl overflow-hidden">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="bg-slate-600/80 p-4 text-center font-semibold text-slate-300 text-sm"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {getWeekDays(getStartOfWeek(currentDate)).map((day) => {
                    const dayEvents = getEventsForDate(day);
                    const isToday =
                      day.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[200px] p-3 border border-slate-600/20 transition-all hover:bg-slate-600/40 ${
                          isToday
                            ? "bg-purple-500/20 border-purple-500/50"
                            : "bg-slate-600/20"
                        }`}
                      >
                        <div
                          className={`font-semibold text-sm mb-3 ${
                            isToday ? "text-purple-300" : "text-white"
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        <div className="space-y-2">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-2 rounded cursor-pointer transition-all hover:scale-105 ${
                                event.departments &&
                                Array.isArray(event.departments)
                                  ? getDepartmentTagClass(event.departments[0])
                                  : "bg-blue-500"
                              } text-white`}
                              title={`${event.title} - ${event.time}${
                                event.departments &&
                                Array.isArray(event.departments)
                                  ? ` - ${event.departments.join(", ")}`
                                  : ""
                              }`}
                            >
                              <div className="font-medium truncate">
                                {event.title}
                              </div>
                              <div className="text-xs opacity-75">
                                {event.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {currentDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </h3>
                    <p className="text-slate-400">
                      {getEventsForDate(currentDate).length} events scheduled
                    </p>
                  </div>

                  {/* Timeline View */}
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-20 top-0 bottom-0 w-0.5 bg-slate-600/50"></div>

                    {/* Current Time Indicator */}
                    {(() => {
                      const isToday =
                        currentTime.toDateString() ===
                        currentDate.toDateString();
                      if (!isToday) return null;

                      const currentHour = currentTime.getHours();
                      const currentMinute = currentTime.getMinutes();
                      const currentTimePosition =
                        (currentHour + currentMinute / 60) * 60; // 60px per hour

                      return (
                        <div
                          className="absolute left-20 top-0 w-full z-10"
                          style={{
                            transform: `translateY(${currentTimePosition}px)`,
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg -translate-x-1.5"></div>
                            <div className="h-0.5 bg-red-500 flex-1"></div>
                            <div className="ml-2 text-xs text-red-400 font-medium bg-slate-800/90 px-2 py-1 rounded">
                              {currentTime.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Hour Labels and Events */}
                    <div className="space-y-0">
                      {Array.from({ length: 24 }, (_, hour) => {
                        const hourEvents = getEventsForDate(currentDate).filter(
                          (event) => {
                            if (!event.time) return false;
                            const eventHour = parseInt(
                              event.time.split(":")[0]
                            );
                            return eventHour === hour;
                          }
                        );

                        return (
                          <div
                            key={hour}
                            className="relative flex items-start min-h-[60px]"
                          >
                            {/* Hour Label */}
                            <div className="w-20 text-right pr-4 pt-2 flex-shrink-0">
                              <span className="text-sm text-slate-400 font-medium">
                                {hour === 0
                                  ? "12 AM"
                                  : hour < 12
                                  ? `${hour} AM`
                                  : hour === 12
                                  ? "12 PM"
                                  : `${hour - 12} PM`}
                              </span>
                            </div>

                            {/* Timeline Dot */}
                            <div className="absolute left-18 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-700 -translate-x-1/2 top-2"></div>

                            {/* Hour Grid Line */}
                            <div className="absolute left-20 right-0 h-px bg-slate-700/30 top-7"></div>

                            {/* Events for this hour */}
                            <div className="ml-8 flex-1 min-h-[60px] relative">
                              {hourEvents.length === 0 ? (
                                <div className="h-12"></div>
                              ) : (
                                <div className="space-y-2">
                                  {hourEvents.map((event) => (
                                    <div
                                      key={event.id}
                                      className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-3 hover:from-purple-500/30 hover:to-blue-500/30 transition-all cursor-pointer group"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-300 group-hover:bg-purple-500/30 transition-colors">
                                          {getEventIcon(event.departments)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-white truncate">
                                              {event.title}
                                            </h4>
                                            {event.departments &&
                                              Array.isArray(
                                                event.departments
                                              ) && (
                                                <div className="flex flex-wrap gap-1">
                                                  {event.departments.map(
                                                    (dept, index) => (
                                                      <span
                                                        key={index}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDepartmentTagClass(
                                                          dept
                                                        )}`}
                                                      >
                                                        {dept}
                                                      </span>
                                                    )
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                          <p className="text-slate-300 text-sm mb-2 line-clamp-2">
                                            {event.description}
                                          </p>
                                          <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                              <Calendar className="w-3 h-3" />
                                              {event.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <MapPin className="w-3 h-3" />
                                              {event.location}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* No events message */}
                    {getEventsForDate(currentDate).length === 0 && (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">
                          No events scheduled for this day
                        </p>
                        <p className="text-slate-500 text-sm mt-2">
                          Events will appear on the timeline when scheduled
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedEvent.title}
                </h2>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedEvent.time}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.location}</span>
                </div>

                {selectedEvent.departments &&
                  selectedEvent.departments.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">Departments:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.departments.map((dept, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Description
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {selectedEvent.registration_needed &&
                  selectedEvent.registration_link && (
                    <div className="pt-4 border-t border-slate-700">
                      <a
                        href={selectedEvent.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Register for Event
                      </a>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
