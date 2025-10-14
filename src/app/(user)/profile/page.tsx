"use client";

import {
  ArrowLeft,
  Building2,
  GraduationCap,
  LogOut,
  Mail,
  Save,
  User,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../../components/AuthContext";
import { ProtectedRoute } from "../../../components/ProtectedRoute";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    student_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (user) {
      console.log("User data:", user); // Debug log
      setForm({
        name: user.name || "",
        email: user.email || "",
        department: user.department || "",
        student_id: user.student_id || "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Debug log for form state
  useEffect(() => {
    console.log("Form state:", form);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: "Profile updated successfully!", type: "success" });
        // Refresh user data
        await refreshUser();
      } else {
        setMsg({
          text: data.error || "Failed to update profile.",
          type: "error",
        });
      }
    } catch (err) {
      setMsg({
        text: "Could not update profile. " + (err as Error).message,
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <UserIcon className="w-6 h-6" />
            </div>
            <Link href="/dashboard">
              <div className="flex flex-col">
                <div className="text-base font-semibold text-gray-900">
                  Faculty Events
                </div>
                <div className="text-xs text-gray-500 hidden sm:block">
                  University of Sri Jayewardenepura
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap w-48 h-11"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
          <section className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <User className="w-8 h-8" />
              My Profile
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage your personal information and account settings
            </p>
          </section>

          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={form.department || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">
                      Software Engineering
                    </option>
                    <option value="Information Systems">
                      Information Systems
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="student_id"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    <GraduationCap className="w-4 h-4 inline mr-2" />
                    Student ID
                  </label>
                  <input
                    id="student_id"
                    name="student_id"
                    type="text"
                    value={form.student_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your student ID"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>

            {msg && (
              <div
                className={`mt-6 p-4 rounded-xl font-medium text-center ${
                  msg.type === "success"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {msg.text}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
