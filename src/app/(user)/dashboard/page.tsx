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
        return "bg-blue-500";
      case "SE":
        return "bg-green-500";
      case "IS":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
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
                  <option value="CS">Computer Science</option>
                  <option value="SE">Software Engineering</option>
                  <option value="IS">Information Systems</option>
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
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDepartmentTagClass(
                                  event.departments[0]
                                )}`}
                              >
                                {event.departments[0]}
                              </span>
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
                          <button className="px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded-lg hover:bg-slate-700/70 transition-colors text-sm font-medium">
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white hover:bg-slate-700/70 hover:border-purple-500/50 transition-all"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white hover:bg-slate-700/70 hover:border-purple-500/50 transition-all"
                  >
                    →
                  </button>
                </div>
              </div>

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
                        !isCurrentMonth ? "bg-slate-600/10 text-slate-500" : ""
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
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded cursor-pointer transition-all hover:scale-105 overflow-hidden text-ellipsis whitespace-nowrap ${
                              event.departments &&
                              Array.isArray(event.departments)
                                ? getDepartmentTagClass(event.departments[0])
                                : "bg-blue-500"
                            } text-white`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-slate-400 text-center cursor-pointer hover:bg-slate-600/60 rounded p-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
