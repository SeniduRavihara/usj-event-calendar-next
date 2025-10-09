"use client";

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
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#e0f2f7] to-[#c5e1ed] text-gray-800">
        <div className="w-full max-w-xl flex justify-between items-center px-6 py-4">
          <a
            href="/dashboard"
            className="bg-white text-blue-500 px-4 py-2 rounded-xl shadow-md hover:bg-blue-50 font-semibold flex items-center gap-2"
          >
            ← Dashboard
          </a>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <span className="font-bold text-lg">My Profile</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-xl shadow-md hover:bg-red-600 font-semibold"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 w-full max-w-md flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="name"
                className="font-semibold text-sm text-gray-600"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white text-gray-900"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="font-semibold text-sm text-gray-600"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white text-gray-900"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col flex-1">
                <label
                  htmlFor="department"
                  className="font-semibold text-sm text-gray-600"
                >
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white text-gray-900"
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

              <div className="flex flex-col flex-1">
                <label
                  htmlFor="student_id"
                  className="font-semibold text-sm text-gray-600"
                >
                  Student ID
                </label>
                <input
                  id="student_id"
                  name="student_id"
                  value={form.student_id}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 py-3 rounded-xl text-white font-bold transition-all shadow-md ${
                loading
                  ? "bg-gradient-to-r from-blue-300 to-purple-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg"
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {msg && (
            <div
              className={`mt-4 p-3 rounded-lg font-semibold text-center border ${
                msg.type === "success"
                  ? "bg-green-50 text-green-700 border-green-700"
                  : "bg-red-50 text-red-700 border-red-700"
              }`}
            >
              {msg.text}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
