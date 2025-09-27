'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Bell, 
  User, 
  Users, 
  GraduationCap,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  X
} from 'lucide-react';

// Types
interface Event {
  id: number;
  title: string;
  department: 'cs' | 'se' | 'is';
  description: string;
  date: string;
  time: string;
  location: string;
  maxReg: number;
  currentReg: number;
}

interface EventFormData {
  title: string;
  department: 'cs' | 'se' | 'is' | '';
  description: string;
  date: string;
  time: string;
  location: string;
  maxReg: number;
}

export default function AdminDashboard() {
  // State management
  const [events, setEvents] = useState<Event[]>([
    { id: 1, title: 'AI Workshop Series', department: 'cs', description: 'Introduction to Machine Learning fundamentals', date: '2025-06-25', time: '14:00', location: 'Lab 301', maxReg: 50, currentReg: 45 },
    { id: 2, title: 'Software Architecture Seminar', department: 'se', description: 'Best practices in modern software architecture', date: '2025-06-28', time: '10:00', location: 'Auditorium A', maxReg: 100, currentReg: 32 },
    { id: 3, title: 'Database Design Competition', department: 'is', description: 'Annual database design challenge', date: '2025-07-02', time: '09:00', location: 'Computer Lab 2', maxReg: 30, currentReg: 28 }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    department: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxReg: 0
  });

    // Notification system
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'error'}>>([]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

    // Event CRUD operations
  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      department: '',
      description: '',
      date: '',
      time: '',
      location: '',
      maxReg: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      department: event.department,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      maxReg: event.maxReg
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingEvent) {
      // Update existing event
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...formData, department: formData.department as 'cs' | 'se' | 'is' }
          : event
      ));
      showNotification('Event updated successfully!');
    } else {
      // Create new event
      const newEvent: Event = {
        id: Date.now(),
        ...formData,
        department: formData.department as 'cs' | 'se' | 'is',
        currentReg: 0
      };
      setEvents(prev => [...prev, newEvent]);
      showNotification('Event created successfully!');
    }

    setIsLoading(false);
    closeModal();
  };

  const deleteEvent = (id: number) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      setEvents(prev => prev.filter(event => event.id !== id));
      showNotification('Event deleted successfully!');
    }
  };

  const viewEvent = (event: Event) => {
    alert(`Viewing details for "${event.title}". In a real application, this would open a detailed view.`);
  };

    // Utility functions
  const getDepartmentInfo = (department: string) => {
    switch (department) {
      case 'cs': return { name: 'CS', color: 'bg-blue-500', icon: '🤖' };
      case 'se': return { name: 'SE', color: 'bg-emerald-500', icon: '🏗️' };
      case 'is': return { name: 'IS', color: 'bg-purple-500', icon: '🗃️' };
      default: return { name: 'UN', color: 'bg-gray-500', icon: '📋' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || event.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

return(
      <div className="min-h-screen bg-blue-50">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-6 py-3 rounded-lg shadow-lg text-white animate-pulse ${
              notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
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
            <div className="text-base font-semibold text-slate-800">Faculty Events Admin</div>
            <div className="text-xs text-slate-600 hidden sm:block">University of Sri Jayewardenepura</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/calendar" className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors text-sm">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            Welcome back, Admin User!
            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">● Admin</span>
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-medium">● 3 new events</span>
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Manage events, workshops, and activities across Computer Science, Software Engineering, and Information Systems departments.
          </p>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-emerald-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-2 hover:border-green-500 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-slate-800 mb-1">3</h3>
                <p className="text-slate-600 text-sm">This month</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-slate-700">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-emerald-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-2 hover:border-green-500 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-slate-800 mb-1">3</h3>
                <p className="text-slate-600 text-sm">Active events</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-slate-700">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-emerald-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-2 hover:border-green-500 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-slate-800 mb-1">CS</h3>
                <p className="text-slate-600 text-sm">FC221001</p>
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
                <h3 className="text-orange-800 font-medium text-sm mb-2 flex items-center gap-2">🔧 Admin Controls</h3>
                <p className="text-orange-700 text-xs">You have full access to create, edit, and delete events. Changes will be reflected immediately.</p>
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
                    className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white min-w-[200px]"
                  >
                    <option value="all">All Departments</option>
                    <option value="cs">Computer Science</option>
                    <option value="se">Software Engineering</option>
                    <option value="is">Information Systems</option>
                  </select>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-slate-800 mb-6">Upcoming Events</h2>

              {/* Events List */}
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const departmentInfo = getDepartmentInfo(event.department);
                  const registrationPercentage = (event.currentReg / event.maxReg) * 100;

                  return (
                    <div key={event.id} className="bg-sky-200 border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                          {departmentInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-800 truncate">{event.title}</h3>
                            <span className={`${departmentInfo.color} text-white text-xs font-medium px-2 py-1 rounded-full`}>
                              {departmentInfo.name}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm mb-3">{event.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(event.date)} at {formatTime(event.time)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{event.currentReg}/{event.maxReg} registered</span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-500">Registration Progress</span>
                              <span className="text-xs text-slate-500">{Math.round(registrationPercentage)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  registrationPercentage >= 90 ? 'bg-red-500' :
                                  registrationPercentage >= 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${registrationPercentage}%` }}
                              ></div>
                            </div>
                          </div>
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
                })}
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
                <div className="text-2xl font-bold text-purple-600 mb-2">July 2025</div>
                <p className="text-sm text-slate-600">View full calendar →</p>
              </div>
            </div>

            {/* Departments Widget */}
            <div className="bg-emerald-50 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-2 hover:border-emerald-500 hover:-translate-y-1 transition-all duration-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Departments</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-slate-700">Computer Science</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">12 events</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-slate-700">Software Engineering</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">8 events</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-slate-700">Information Systems</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">6 events</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      </div>
);



}