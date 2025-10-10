"use client";

import { ArrowLeft, Calendar, CalendarDays } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "../../components/ProtectedRoute";

export default function CalendarPage() {
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

        <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          <section className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <CalendarDays className="w-8 h-8" />
              Full Calendar View
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              View all events in a comprehensive calendar layout
            </p>
          </section>

          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                Calendar View Coming Soon
              </h2>
              <p className="text-slate-400 mb-6">
                This page will display a full calendar view of all events.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
