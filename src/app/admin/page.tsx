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

}