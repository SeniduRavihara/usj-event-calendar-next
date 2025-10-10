"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../components/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if user is logged in
  useEffect(() => {
    if (user && !loading) {
      const redirectUrl = user.role === "ADMIN" ? "/admin" : "/dashboard";
      router.push(redirectUrl);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">
                  USJ Event Calendar
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-white transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/25"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">
                USJ Event Calendar
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Stay updated with all the latest events, activities, and
              happenings at the University of Sri Jayewardenepura. Never miss an
              important event again with our modern, intuitive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/register"
                className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  Get Started
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>
              <Link
                href="/login"
                className="group bg-slate-800/50 text-white px-10 py-4 rounded-2xl font-semibold text-lg border border-slate-600 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 transform hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="flex items-center justify-center">
                  Sign In
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </span>
              </Link>
            </div>
        </div>
      </main>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-white mb-4">
              Why Choose USJ Event Calendar?
            </h2>
            <p className="text-xl text-slate-400 text-center mb-16 max-w-2xl mx-auto">
              Experience the future of event management with our cutting-edge
              platform
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group text-center p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Event Management
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Easily create, manage, and track university events and
                  activities with our intuitive dashboard.
                </p>
              </div>

              <div className="group text-center p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  User Friendly
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Intuitive interface designed for both students and
                  administrators with modern UX principles.
                </p>
              </div>

              <div className="group text-center p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Real-time Updates
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Get instant notifications about new events and updates with
                  our real-time synchronization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-800/80 backdrop-blur-xl border-t border-slate-700/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                USJ Event Calendar
              </span>
            </div>
            <p className="text-slate-400">
              © 2024 University of Sri Jayewardenepura Event Calendar. All
              rights reserved.
            </p>
          </div>
      </footer>
      </div>
    </div>
  );
}
