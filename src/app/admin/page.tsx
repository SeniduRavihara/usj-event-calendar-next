"use client";

import {
  Bell,
  Calendar,
  CalendarDays,
  Edit,
  Eye,
  Filter,
  GraduationCap,
  List,
  MapPin,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthContext";
import { ProtectedRoute } from "../../components/ProtectedRoute";

// Types
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

interface EventFormData {
  title: string;
  departments: string[];
  description: string;
  date: string;
  time: string;
  location: string;
  registration_needed: boolean;
  registration_link: string;
  cover_color: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState<"list" | "calendar" | "analytics">(
    "list"
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    "month"
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    departments: [],
    description: "",
    date: "",
    time: "",
    location: "",
    registration_needed: false,
    registration_link: "",
    cover_color: "#3b82f6",
  });

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

  // Update current time every minute for live time indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch("/api/analytics/users", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch analytics when analytics tab is selected
  useEffect(() => {
    if (activeTab === "analytics" && !analyticsData) {
      fetchAnalytics();
    }
  }, [activeTab, analyticsData]);

  // Notification system
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: "success" | "error" }>
  >([]);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  // Event CRUD operations
  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      departments: [],
      description: "",
      date: "",
      time: "",
      location: "",
      registration_needed: false,
      registration_link: "",
      cover_color: "#3b82f6",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    console.log("Opening edit modal for event:", event);
    console.log("Event date:", event.date, "Event time:", event.time);
    setEditingEvent(event);
    setFormData({
      title: event.title,
      departments: Array.isArray(event.departments) ? event.departments : [],
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      registration_needed: event.registration_needed,
      registration_link: event.registration_link || "",
      cover_color: event.cover_color || "#3b82f6",
    });
    console.log("Form data set to:", {
      title: event.title,
      date: event.date,
      time: event.time,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingEvent
        ? `/api/events/${editingEvent.id}`
        : "/api/events";
      const method = editingEvent ? "PUT" : "POST";

      console.log("Submitting event:", { editingEvent, formData, url, method });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          departments: JSON.stringify(formData.departments),
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to save event: ${errorData.error || "Unknown error"}`
        );
      }

      const data = await response.json();
      console.log("Success response:", data);

      if (editingEvent) {
        // Update existing event in state
        setEvents((prev) =>
          prev.map((event) =>
            event.id === editingEvent.id ? data.event : event
          )
        );
        showNotification("Event updated successfully!");
      } else {
        // Add new event to state
        setEvents((prev) => [...prev, data.event]);
        showNotification("Event created successfully!");
      }

      closeModal();
    } catch (err) {
      console.error("Error saving event:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      showNotification(`Failed to save event: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: number) => {
    console.log("Attempting to delete event with ID:", id);
    if (
      confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      setDeletingEventId(id);
      try {
        console.log("Sending DELETE request to:", `/api/events/${id}`);
        const response = await fetch(`/api/events/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        console.log("Delete response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Delete error response:", errorData);
          throw new Error(
            `Failed to delete event: ${errorData.error || "Unknown error"}`
          );
        }

        setEvents((prev) => prev.filter((event) => event.id !== id));
        showNotification("Event deleted successfully!");
        console.log("Event deleted successfully from state");
      } catch (err) {
        console.error("Error deleting event:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        showNotification(`Failed to delete event: ${errorMessage}`, "error");
      } finally {
        setDeletingEventId(null);
      }
    }
  };

  const viewEvent = (event: Event) => {
    alert(
      `Viewing details for "${event.title}". In a real application, this would open a detailed view.`
    );
  };

  // Utility functions
  const getDepartmentInfo = (departments: string[] | null) => {
    if (
      !departments ||
      !Array.isArray(departments) ||
      departments.length === 0
    ) {
      return {
        name: "ALL",
        color: "bg-gray-500",
        icon: <Calendar className="w-5 h-5" />,
      };
    }

    const dept = departments[0]; // Use first department for display
    switch (dept) {
      case "Computer Science":
        return {
          name: "CS",
          color: "bg-blue-500",
          icon: <Calendar className="w-5 h-5" />,
        };
      case "Software Engineering":
        return {
          name: "SE",
          color: "bg-emerald-500",
          icon: <Calendar className="w-5 h-5" />,
        };
      case "Information Systems":
        return {
          name: "IS",
          color: "bg-purple-500",
          icon: <Calendar className="w-5 h-5" />,
        };
      default:
        return {
          name: dept,
          color: "bg-gray-500",
          icon: <Calendar className="w-5 h-5" />,
        };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === "") {
      return "No date set";
    }
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate department event counts
  const getDepartmentCounts = () => {
    const counts: { [key: string]: number } = {};

    events.forEach((event) => {
      if (event.departments && Array.isArray(event.departments)) {
        event.departments.forEach((dept: string) => {
          counts[dept] = (counts[dept] || 0) + 1;
        });
      }
    });

    return counts;
  };

  const departmentCounts = getDepartmentCounts();

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

  // Get events for a specific week
  const getEventsForWeek = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return events.filter((event) => {
      if (!event.date) return false;
      // Parse event date in local timezone
      const eventDate = new Date(event.date + "T00:00:00");
      return eventDate >= startDate && eventDate <= endDate;
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

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location &&
        event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment =
      departmentFilter === "all" ||
      (event.departments &&
        Array.isArray(event.departments) &&
        event.departments.includes(departmentFilter));
    return matchesSearch && matchesDepartment;
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-6 py-3 rounded-lg shadow-lg text-white animate-pulse ${
                notification.type === "success"
                  ? "bg-emerald-600"
                  : "bg-red-600"
              }`}
            >
              {notification.message}
            </div>
          ))}
        </div>

        {/* Header */}
        <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="text-base font-semibold text-white">
                Faculty Events Admin
              </div>
              <div className="text-xs text-slate-300 hidden sm:block">
                University of Sri Jayewardenepura
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-slate-700/50 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-600/50 transition-colors cursor-pointer">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
            </div>
            <div className="w-8 h-8 bg-slate-700/50 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-600/50 transition-colors cursor-pointer">
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-red-500/25"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          {/* Welcome Section */}
          <section className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              Welcome back, {user?.name || "Admin"}!
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                ● Admin
              </span>
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                ● {events.length} events
              </span>
            </h1>
            <p className="text-slate-300 max-w-2xl">
              Manage events, workshops, and activities across Computer Science,
              Software Engineering, and Information Systems departments.
            </p>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">
                    {events.length}
                  </h3>
                  <p className="text-slate-300 text-sm">Total events</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">
                    {filteredEvents.length}
                  </h3>
                  <p className="text-slate-300 text-sm">Filtered events</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">
                    {user?.department || "N/A"}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {user?.student_id || "Admin"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-8 mb-8">
            <div className="flex bg-slate-700/50 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
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
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "calendar"
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                Calendar View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "analytics"
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-5 h-5" />
                Analytics
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Events Section */}
            <div className="lg:col-span-2">
              {activeTab === "list" ? (
                <section className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                  {/* Admin Panel */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
                    <h3 className="text-orange-400 font-medium text-sm mb-2 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Admin Controls
                    </h3>
                    <p className="text-orange-300 text-xs">
                      You have full access to create, edit, and delete events.
                      Changes will be reflected immediately.
                    </p>
                  </div>

                  {/* Create Button */}
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={openCreateModal}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/25"
                    >
                      <Plus className="w-4 h-4" />
                      Create Event
                    </button>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-slate-700/50 text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="pl-10 pr-8 py-3 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-slate-700/50 text-white min-w-[200px]"
                      >
                        <option value="all">All Departments</option>
                        <option value="Computer Science">
                          Computer Science
                        </option>
                        <option value="Software Engineering">
                          Software Engineering
                        </option>
                        <option value="Information Systems">
                          Information Systems
                        </option>
                      </select>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-6">
                    Upcoming Events
                  </h2>

                  {/* Events List */}
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-slate-400">Loading events...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8">
                        <p className="text-red-600">{error}</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Retry
                        </button>
                      </div>
                    ) : filteredEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No events found.</p>
                      </div>
                    ) : (
                      filteredEvents.map((event) => {
                        const departmentInfo = getDepartmentInfo(
                          event.departments
                        );

                        return (
                          <div
                            key={event.id}
                            className="bg-slate-700/50 border border-slate-600/50 rounded-2xl p-6 hover:shadow-lg hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-200 backdrop-blur-sm"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-slate-600/50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-500/50">
                                {departmentInfo.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-white truncate">
                                    {event.title}
                                  </h3>
                                  <span
                                    className={`${departmentInfo.color} text-white text-xs font-medium px-2 py-1 rounded-full`}
                                  >
                                    {departmentInfo.name}
                                  </span>
                                </div>
                                <p className="text-slate-300 text-sm mb-3">
                                  {event.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {formatDate(event.date)} at{" "}
                                      {event.time || "No time set"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>Created by {event.creator.name}</span>
                                  </div>
                                </div>
                                {event.registration_needed && (
                                  <div className="mb-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-600">
                                        Registration Required
                                      </span>
                                      {event.registration_link && (
                                        <a
                                          href={event.registration_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                                        >
                                          Register Here
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                              <button
                                onClick={() => viewEvent(event)}
                                className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all hover:-translate-y-1"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => openEditModal(event)}
                                className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-all hover:-translate-y-1 hover:shadow-lg"
                                title="Edit this event"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteEvent(event.id)}
                                disabled={deletingEventId === event.id}
                                className={`flex items-center gap-1 px-3 py-2 text-white rounded-lg text-sm font-medium transition-all hover:-translate-y-1 hover:shadow-lg ${
                                  deletingEventId === event.id
                                    ? "bg-red-400 cursor-not-allowed"
                                    : "bg-red-500 hover:bg-red-600"
                                }`}
                                title="Delete this event"
                              >
                                {deletingEventId === event.id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                {deletingEventId === event.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              ) : activeTab === "calendar" ? (
                <section className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                  {/* Admin Panel */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
                    <h3 className="text-orange-400 font-medium text-sm mb-2 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Admin Controls
                    </h3>
                    <p className="text-orange-300 text-xs">
                      You have full access to create, edit, and delete events.
                      Changes will be reflected immediately.
                    </p>
                  </div>

                  {/* Calendar Header with View Toggle */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white">
                      {calendarView === "month"
                        ? currentDate.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : calendarView === "week"
                        ? `Week of ${getStartOfWeek(
                            currentDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}`
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
                    <div className="grid grid-cols-7 gap-1 bg-slate-700/30 rounded-xl p-2">
                      {/* Day headers */}
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div
                            key={day}
                            className="p-2 text-center text-sm font-medium text-slate-400"
                          >
                            {day}
                          </div>
                        )
                      )}

                      {/* Calendar days */}
                      {getDaysInMonth(currentDate).map((day, index) => {
                        if (!day) {
                          return <div key={index} className="p-2"></div>;
                        }

                        const dayEvents = getEventsForDate(day);
                        const isToday =
                          day.toDateString() === new Date().toDateString();
                        const isCurrentMonth =
                          day.getMonth() === currentDate.getMonth();

                        return (
                          <div
                            key={index}
                            className={`p-2 min-h-[120px] border border-slate-600/30 rounded-lg ${
                              isToday
                                ? "bg-purple-500/20 border-purple-500/50"
                                : ""
                            } ${!isCurrentMonth ? "opacity-50" : ""}`}
                          >
                            <div
                              className={`text-sm font-medium mb-1 ${
                                isToday ? "text-purple-400" : "text-slate-300"
                              }`}
                            >
                              {day.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayEvents
                                .slice(0, 3)
                                .map((event, eventIndex) => (
                                  <div
                                    key={eventIndex}
                                    className="text-xs p-1 rounded bg-blue-500/80 text-white truncate cursor-pointer hover:bg-blue-500 transition-colors"
                                    title={event.title}
                                    onClick={() => openEditModal(event)}
                                  >
                                    {event.title.length > 12
                                      ? event.title.substring(0, 12) + "..."
                                      : event.title}
                                  </div>
                                ))}
                              {dayEvents.length > 3 && (
                                <div
                                  className="text-xs text-slate-400 text-center cursor-pointer hover:bg-slate-600/60 rounded p-1"
                                  onClick={() => {
                                    setSelectedDate(day);
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
                    <div className="grid grid-cols-7 gap-1 bg-slate-700/30 rounded-xl p-2">
                      {/* Day headers */}
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div
                            key={day}
                            className="p-2 text-center text-sm font-medium text-slate-400"
                          >
                            {day}
                          </div>
                        )
                      )}
                      {getWeekDays(getStartOfWeek(currentDate)).map(
                        (day, index) => {
                          const dayEvents = getEventsForDate(day);
                          const isToday =
                            day.toDateString() === new Date().toDateString();

                          return (
                            <div
                              key={day.toISOString()}
                              className={`p-3 min-h-[200px] border border-slate-600/30 rounded-lg ${
                                isToday
                                  ? "bg-purple-500/20 border-purple-500/50"
                                  : ""
                              }`}
                            >
                              <div
                                className={`text-sm font-medium mb-3 ${
                                  isToday ? "text-purple-400" : "text-slate-300"
                                }`}
                              >
                                {day.getDate()}
                              </div>
                              <div className="space-y-2">
                                {dayEvents.map((event) => (
                                  <div
                                    key={event.id}
                                    className="text-xs p-2 rounded bg-blue-500/80 text-white cursor-pointer hover:bg-blue-500 transition-colors"
                                    title={`${event.title} - ${event.time}`}
                                    onClick={() => openEditModal(event)}
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
                        }
                      )}
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
                          {getEventsForDate(currentDate).length} events
                          scheduled
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
                            const hourEvents = getEventsForDate(
                              currentDate
                            ).filter((event) => {
                              if (!event.time) return false;
                              const eventHour = parseInt(
                                event.time.split(":")[0]
                              );
                              return eventHour === hour;
                            });

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
                                          className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-3 hover:from-orange-500/30 hover:to-red-500/30 transition-all cursor-pointer group"
                                          onClick={() => openEditModal(event)}
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center text-orange-300 group-hover:bg-orange-500/30 transition-colors">
                                              <Calendar className="w-4 h-4" />
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
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500">
                                                      {event.departments[0]}
                                                    </span>
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
                                            <div className="flex gap-1">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openEditModal(event);
                                                }}
                                                className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                                              >
                                                <Edit className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  deleteEvent(event.id);
                                                }}
                                                className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
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
                </section>
              ) : activeTab === "analytics" ? (
                <section className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                  {/* Analytics Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
                      <Users className="w-6 h-6" />
                      User Analytics
                    </h2>
                    <p className="text-slate-400">
                      Overview of all users and their statistics
                    </p>
                  </div>

                  {/* Analytics Content */}
                  {analyticsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="mt-4 text-slate-400">
                        Loading analytics...
                      </p>
                    </div>
                  ) : analyticsData ? (
                    <div className="space-y-6">
                      {/* Statistics Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-blue-400">
                              Total Users
                            </h3>
                            <Users className="w-5 h-5 text-blue-400" />
                          </div>
                          <p className="text-3xl font-bold text-white">
                            {analyticsData.statistics.totalUsers}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-green-400">
                              Students
                            </h3>
                            <GraduationCap className="w-5 h-5 text-green-400" />
                          </div>
                          <p className="text-3xl font-bold text-white">
                            {analyticsData.statistics.totalStudents}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-purple-400">
                              Admins
                            </h3>
                            <User className="w-5 h-5 text-purple-400" />
                          </div>
                          <p className="text-3xl font-bold text-white">
                            {analyticsData.statistics.totalAdmins}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-orange-400">
                              Recent Users (30 days)
                            </h3>
                            <Users className="w-5 h-5 text-orange-400" />
                          </div>
                          <p className="text-3xl font-bold text-white">
                            {analyticsData.statistics.recentUsers}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-pink-400">
                              With Student ID
                            </h3>
                            <GraduationCap className="w-5 h-5 text-pink-400" />
                          </div>
                          <p className="text-3xl font-bold text-white">
                            {analyticsData.statistics.usersWithStudentId}
                          </p>
                        </div>
                      </div>

                      {/* Users by Department */}
                      <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Users by Department
                        </h3>
                        <div className="space-y-3">
                          {analyticsData.statistics.usersByDepartment.map(
                            (dept: any) => (
                              <div
                                key={dept.department}
                                className="flex items-center justify-between p-3 bg-slate-600/30 rounded-lg"
                              >
                                <span className="text-slate-300">
                                  {dept.department}
                                </span>
                                <span className="text-white font-semibold">
                                  {dept.count} users
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* All Users Table */}
                      <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          All Users
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-600">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                  Name
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                  Email
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                  Role
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                  Department
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                  Student ID
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                  Joined
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {analyticsData.users.map((user: any) => (
                                <tr
                                  key={user.id}
                                  className="border-b border-slate-600/50 hover:bg-slate-600/20"
                                >
                                  <td className="py-3 px-4 text-sm text-white">
                                    {user.name}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-slate-300">
                                    {user.email}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        user.role === "ADMIN"
                                          ? "bg-purple-500/20 text-purple-400"
                                          : "bg-blue-500/20 text-blue-400"
                                      }`}
                                    >
                                      {user.role}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-slate-300">
                                    {user.department || "-"}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-slate-300">
                                    {user.student_id || "-"}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-slate-400">
                                    {new Date(
                                      user.created_at
                                    ).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400">
                        Failed to load analytics data.
                      </p>
                    </div>
                  )}
                </section>
              ) : null}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Calendar Widget */}
              <div className="bg-emerald-50 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-2 hover:border-emerald-500 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Quick Calendar
                </h3>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    July 2025
                  </div>
                  <p className="text-sm text-slate-400">View full calendar →</p>
                </div>
              </div>

              {/* Departments Widget */}
              <div className="bg-emerald-50 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-2 hover:border-emerald-500 hover:-translate-y-1 transition-all duration-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">
                  Departments
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-slate-700">
                        Computer Science
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded-full">
                      {departmentCounts["Computer Science"] || 0} events
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-medium text-slate-700">
                        Software Engineering
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded-full">
                      {departmentCounts["Software Engineering"] || 0} events
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-medium text-slate-700">
                        Information Systems
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded-full">
                      {departmentCounts["Information Systems"] || 0} events
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Departments *
                    </label>
                    <div className="space-y-2">
                      {[
                        "Computer Science",
                        "Software Engineering",
                        "Information Systems",
                      ].map((dept) => (
                        <label key={dept} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.departments.includes(dept)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  departments: [...prev.departments, dept],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  departments: prev.departments.filter(
                                    (d) => d !== dept
                                  ),
                                }));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-900 font-medium">
                            {dept}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Time *
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            time: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Registration Required
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.registration_needed}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            registration_needed: e.target.checked,
                          }))
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900 font-medium">
                        Event requires registration
                      </span>
                    </label>
                  </div>
                  {formData.registration_needed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Registration Link
                      </label>
                      <input
                        type="url"
                        value={formData.registration_link}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            registration_link: e.target.value,
                          }))
                        }
                        placeholder="https://example.com/register"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Cover Color
                    </label>
                    <input
                      type="color"
                      value={formData.cover_color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cover_color: e.target.value,
                        }))
                      }
                      className="w-full h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? editingEvent
                          ? "Updating..."
                          : "Creating..."
                        : editingEvent
                        ? "Update Event"
                        : "Create Event"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
