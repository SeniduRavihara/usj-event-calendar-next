"use client";

import {
  Bell,
  Calendar,
  Edit,
  Eye,
  Filter,
  GraduationCap,
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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

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

      if (!response.ok) {
        throw new Error("Failed to save event");
      }

      const data = await response.json();

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
      showNotification("Failed to save event", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to delete event");
        }

        setEvents((prev) => prev.filter((event) => event.id !== id));
        showNotification("Event deleted successfully!");
      } catch (err) {
        console.error("Error deleting event:", err);
        showNotification("Failed to delete event", "error");
      }
    }
  };

  const viewEvent = (event: Event) => {
    alert(
      `Viewing details for "${event.title}". In a real application, this would open a detailed view.`
    );
  };

  // Utility functions
  const getDepartmentInfo = (departments: any) => {
    if (
      !departments ||
      !Array.isArray(departments) ||
      departments.length === 0
    ) {
      return { name: "ALL", color: "bg-gray-500", icon: "📋" };
    }

    const dept = departments[0]; // Use first department for display
    switch (dept) {
      case "CS":
        return { name: "CS", color: "bg-blue-500", icon: "🤖" };
      case "SE":
        return { name: "SE", color: "bg-emerald-500", icon: "🏗️" };
      case "IS":
        return { name: "IS", color: "bg-purple-500", icon: "🗃️" };
      default:
        return { name: dept, color: "bg-gray-500", icon: "📋" };
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

  const formatTime = (timeString: string) => {
    if (!timeString || timeString.trim() === "") {
      return "No time set";
    }
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
      <div className="min-h-screen bg-blue-50">
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
        <header className="bg-sky-300 border-b border-slate-200 px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-semibold">
              📅
            </div>
            <div className="flex flex-col">
              <div className="text-base font-semibold text-slate-800">
                Faculty Events Admin
              </div>
              <div className="text-xs text-slate-600 hidden sm:block">
                University of Sri Jayewardenepura
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/calendar"
              className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Full Calendar</span>
            </a>
            <div className="relative">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          {/* Welcome Section */}
          <section className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              Welcome back, {user?.name || "Admin"}!
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                ● Admin
              </span>
              <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                ● {events.length} events
              </span>
            </h1>
            <p className="text-gray-700 max-w-2xl">
              Manage events, workshops, and activities across Computer Science,
              Software Engineering, and Information Systems departments.
            </p>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-emerald-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-2 hover:border-green-500 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">
                    {events.length}
                  </h3>
                  <p className="text-gray-700 text-sm">Total events</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-slate-700">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-emerald-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-2 hover:border-green-500 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">
                    {filteredEvents.length}
                  </h3>
                  <p className="text-gray-700 text-sm">Filtered events</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-slate-700">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-emerald-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-2 hover:border-green-500 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">
                    {user?.department || "N/A"}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {user?.student_id || "Admin"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-slate-700">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Events Section */}
            <div className="lg:col-span-2">
              <section className="bg-blue-200 rounded-xl p-6 shadow-lg">
                {/* Admin Panel */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h3 className="text-orange-800 font-medium text-sm mb-2 flex items-center gap-2">
                    🔧 Admin Controls
                  </h3>
                  <p className="text-orange-700 text-xs">
                    You have full access to create, edit, and delete events.
                    Changes will be reflected immediately.
                  </p>
                </div>

                {/* Create Button */}
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 min-w-[200px]"
                    >
                      <option value="all">All Departments</option>
                      <option value="cs">Computer Science</option>
                      <option value="se">Software Engineering</option>
                      <option value="is">Information Systems</option>
                    </select>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Upcoming Events
                </h2>

                {/* Events List */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-700">Loading events...</p>
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
                      <p className="text-gray-700">No events found.</p>
                    </div>
                  ) : (
                    filteredEvents.map((event) => {
                      const departmentInfo = getDepartmentInfo(
                        event.departments
                      );

                      return (
                        <div
                          key={event.id}
                          className="bg-sky-200 border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                              {departmentInfo.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-slate-800 truncate">
                                  {event.title}
                                </h3>
                                <span
                                  className={`${departmentInfo.color} text-white text-xs font-medium px-2 py-1 rounded-full`}
                                >
                                  {departmentInfo.name}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mb-3">
                                {event.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
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
                              className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-all hover:-translate-y-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all hover:-translate-y-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
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
                  <p className="text-sm text-gray-700">View full calendar →</p>
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
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {departmentCounts["CS"] || 0} events
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-medium text-slate-700">
                        Software Engineering
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {departmentCounts["SE"] || 0} events
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-medium text-slate-700">
                        Information Systems
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {departmentCounts["IS"] || 0} events
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
                      {["CS", "SE", "IS"].map((dept) => (
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
