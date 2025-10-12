"use client";

import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Grid3X3,
  List,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "../../components/ProtectedRoute";

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  department: string;
  created_at: string;
  updated_at: string;
}

type ViewType = "month" | "week" | "day";

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          // Transform events to match calendar component interface
          const transformedEvents = (data.events || []).map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            start_date:
              event.date + (event.time ? `T${event.time}` : "T00:00:00"),
            end_date:
              event.date + (event.time ? `T${event.time}` : "T23:59:59"),
            location: event.location || "",
            department: event.departments?.[0] || "General",
            created_at: event.created_at,
            updated_at: event.updated_at,
          }));
          console.log("Fetched events:", transformedEvents);
          setEvents(transformedEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Navigation functions
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (view === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    }

    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    // Create date string in local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return events.filter((event) => {
      // Parse event dates in local timezone
      const eventStart = new Date(event.start_date + "T00:00:00");
      const eventEnd = new Date(event.end_date + "T00:00:00");
      const eventStartStr = `${eventStart.getFullYear()}-${String(
        eventStart.getMonth() + 1
      ).padStart(2, "0")}-${String(eventStart.getDate()).padStart(2, "0")}`;
      const eventEndStr = `${eventEnd.getFullYear()}-${String(
        eventEnd.getMonth() + 1
      ).padStart(2, "0")}-${String(eventEnd.getDate()).padStart(2, "0")}`;
      return dateStr >= eventStartStr && dateStr <= eventEndStr;
    });
  };

  // Get events for a specific week
  const getEventsForWeek = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    return events.filter((event) => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      return eventStart <= endDate && eventEnd >= startDate;
    });
  };

  // Month view helpers
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

  // Week view helpers
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return weekDays;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get department color
  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      "Computer Science": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Software Engineering":
        "bg-green-500/20 text-green-400 border-green-500/30",
      "Information Systems":
        "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return (
      colors[department] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
    );
  };

  // Render month view
  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-slate-400 bg-slate-700/50 rounded-lg"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          if (!day) {
            return (
              <div
                key={index}
                className="h-32 bg-slate-800/30 rounded-lg"
              ></div>
            );
          }

          const dayEvents = getEventsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={index}
              className={`h-32 p-2 border border-slate-600/50 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors ${
                isToday ? "bg-purple-500/20 border-purple-500/50" : ""
              } ${isSelected ? "bg-blue-500/20 border-blue-500/50" : ""}`}
              onClick={() => setSelectedDate(day)}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday ? "text-purple-400" : "text-white"
                }`}
              >
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate border ${getDepartmentColor(
                      event.department
                    )}`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-slate-400">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const weekEvents = getEventsForWeek(weekDays[0]);

    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();

          return (
            <div key={index} className="min-h-32">
              <div
                className={`p-3 text-center border-b border-slate-600/50 ${
                  isToday ? "bg-purple-500/20 text-purple-400" : "text-white"
                } ${isSelected ? "bg-blue-500/20" : ""}`}
              >
                <div className="text-sm font-medium">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-lg font-bold">{day.getDate()}</div>
              </div>
              <div className="p-2 space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-2 rounded border ${getDepartmentColor(
                      event.department
                    )}`}
                    title={`${event.title} - ${formatTime(event.start_date)}`}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {formatTime(event.start_date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate);

    return (
      <div className="space-y-4">
        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
          <h3 className="text-xl font-semibold text-white">
            {formatDate(selectedDate)}
          </h3>
          <p className="text-slate-400">
            {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}{" "}
            scheduled
          </p>
        </div>

        <div className="space-y-3">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No events scheduled for this day</p>
            </div>
          ) : (
            dayEvents.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg border ${getDepartmentColor(
                  event.department
                )}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg">{event.title}</h4>
                  <span className="text-sm opacity-75">
                    {formatTime(event.start_date)} -{" "}
                    {formatTime(event.end_date)}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm opacity-90 mb-2">{event.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.location}
                    </span>
                  )}
                  <span className="opacity-75">{event.department}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
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
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium text-sm shadow-lg hover:shadow-purple-500/25 hover:from-purple-600 hover:to-pink-700 transition-all duration-200 whitespace-nowrap w-48 h-11"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <section className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <CalendarDays className="w-8 h-8" />
              Full Calendar View
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              View all events in day, week, or month layout
            </p>
          </section>

          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-white">
                  {formatDate(currentDate)}
                </h2>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex bg-slate-700/50 rounded-lg p-1">
                  <button
                    onClick={() => setView("month")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      view === "month"
                        ? "bg-purple-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView("week")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      view === "week"
                        ? "bg-purple-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView("day")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      view === "day"
                        ? "bg-purple-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateDate("prev")}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigateDate("next")}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Content */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-slate-400">Loading calendar...</p>
              </div>
            ) : (
              <div className="min-h-96">
                {events.length === 0 && (
                  <div className="text-center py-8 mb-6 bg-slate-700/30 rounded-lg">
                    <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-400">
                      No events found. Create some events in the admin panel to
                      see them here.
                    </p>
                  </div>
                )}
                {view === "month" && renderMonthView()}
                {view === "week" && renderWeekView()}
                {view === "day" && renderDayView()}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
