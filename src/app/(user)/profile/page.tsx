"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    studentId: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMsg({ text: "Not authenticated. Please log in.", type: "error" });
        return;
      }
      try {
        const res = await fetch("/USJ_Events_Calender/api/profile.php", {
          headers: { Authorization: "Bearer " + token },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setForm({
          name: data.name || "",
          email: data.email || "",
          department: data.department || "",
          studentId: data.studentId || "",
        });
      } catch (err) {
        setMsg({ text: "Could not load profile. " + err.message, type: "error" });
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setMsg({ text: "Not authenticated. Please log in.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/USJ_Events_Calender/api/user_profile.php", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ text: "Profile updated successfully!", type: "success" });
      } else {
        setMsg({ text: data.error || "Failed to update profile.", type: "error" });
      }
    } catch (err) {
      setMsg({ text: "Could not update profile. " + err.message, type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#e0f2f7] to-[#c5e1ed] text-gray-800">
      <div className="w-full max-w-xl flex justify-between items-center px-6 py-4">
        <a
          href="../dashboard/"
          className="bg-white text-blue-500 px-4 py-2 rounded-xl shadow-md hover:bg-blue-50 font-semibold flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> Dashboard
        </a>
        <div className="flex items-center gap-2">
          <i className="fas fa-user-circle text-blue-500 text-2xl"></i>
          <span className="font-bold text-lg">My Profile</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="font-semibold text-sm text-gray-600">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="font-semibold text-sm text-gray-600">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1">
              <label htmlFor="department" className="font-semibold text-sm text-gray-600">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
              >
                <option value="">Select department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Information Systems">Information Systems</option>
              </select>
            </div>

            <div className="flex flex-col flex-1">
              <label htmlFor="studentId" className="font-semibold text-sm text-gray-600">
                Student ID
              </label>
              <input
                id="studentId"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
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
  );
}
