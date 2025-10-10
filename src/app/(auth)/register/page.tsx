"use client";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentId: string;
  department: string;
  agreeToTerms: boolean;
}

interface SignupFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  studentId?: string;
  department?: string;
  agreeToTerms?: string;
  api?: string;
}

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    department: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SignupFormErrors>({});

  const handleInputChange = (
    field: keyof SignupFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: SignupFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (activeTab === "student") {
      if (!formData.studentId.trim()) {
        newErrors.studentId = "Student ID is required";
      }

      if (!formData.department) {
        newErrors.department = "Department is required";
      }
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (
    password: string
  ): { strength: number; text: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const strengthMap = {
      0: { strength: 0, text: "Very Weak", color: "bg-red-500" },
      1: { strength: 1, text: "Weak", color: "bg-red-400" },
      2: { strength: 2, text: "Fair", color: "bg-yellow-500" },
      3: { strength: 3, text: "Good", color: "bg-blue-500" },
      4: { strength: 4, text: "Strong", color: "bg-green-500" },
      5: { strength: 5, text: "Very Strong", color: "bg-green-600" },
    };

    return strengthMap[strength as keyof typeof strengthMap];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          role: activeTab === "admin" ? "ADMIN" : "STUDENT",
          student_id: activeTab === "student" ? formData.studentId : undefined,
          department: activeTab === "student" ? formData.department : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        window.location.href =
          "/login?message=Registration successful! Please log in.";
      } else {
        setErrors({ api: data.error || "Registration failed" });
      }
    } catch {
      setErrors({ api: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 relative overflow-hidden">
          {/* Glassmorphism accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl mb-6 shadow-2xl">
              <UserPlus className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Create Account
            </h1>
            <p className="text-slate-400 text-lg">
              Join us today and get started
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-slate-700/50 rounded-2xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab("student")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "student"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "admin"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Admin
            </button>
          </div>

          {/* API Error */}
          {errors.api && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm backdrop-blur-sm">
              {errors.api}
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-semibold text-slate-300"
                >
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className={`w-full pl-12 pr-4 py-4 bg-slate-700/50 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-white placeholder-slate-400 ${
                      errors.firstName
                        ? "border-red-500/50 focus:ring-red-500/20"
                        : "border-slate-600/50 focus:ring-purple-500/20 focus:bg-slate-700/70"
                    }`}
                    placeholder="First name"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-semibold text-slate-300"
                >
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={`w-full pl-12 pr-4 py-4 bg-slate-700/50 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-white placeholder-slate-400 ${
                      errors.lastName
                        ? "border-red-500/50 focus:ring-red-500/20"
                        : "border-slate-600/50 focus:ring-purple-500/20 focus:bg-slate-700/70"
                    }`}
                    placeholder="Last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-2">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-300"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 8 12 13l-9-5"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m3 8 9 5 9-5"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-700/50 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-white placeholder-slate-400 ${
                    errors.email
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-slate-600/50 focus:ring-purple-500/20 focus:bg-slate-700/70"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            {/* Student-specific fields */}
            {activeTab === "student" && (
              <>
                {/* Student ID Field */}
                <div className="space-y-3">
                  <label
                    htmlFor="studentId"
                    className="text-sm font-semibold text-slate-300"
                  >
                    Student ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-5m-4 0V5a2 2 0 1 1 4 0v1m-4 0a2 2 0 1 1 4 0m-5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 0 0-2.83 2M15 11h3m-3 4h2"
                        />
                      </svg>
                    </div>
                    <input
                      id="studentId"
                      type="text"
                      value={formData.studentId}
                      onChange={(e) =>
                        handleInputChange("studentId", e.target.value)
                      }
                      className={`w-full pl-12 pr-4 py-4 bg-slate-700/50 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-white placeholder-slate-400 ${
                        errors.studentId
                          ? "border-red-500/50 focus:ring-red-500/20"
                          : "border-slate-600/50 focus:ring-purple-500/20 focus:bg-slate-700/70"
                      }`}
                      placeholder="Enter your student ID"
                    />
                  </div>
                  {errors.studentId && (
                    <p className="text-red-400 text-sm mt-2">
                      {errors.studentId}
                    </p>
                  )}
                </div>

                {/* Department Field */}
                <div className="space-y-3">
                  <label
                    htmlFor="department"
                    className="text-sm font-semibold text-slate-300"
                  >
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                      className={`w-full pl-12 pr-4 py-4 bg-slate-700/50 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-white ${
                        errors.department
                          ? "border-red-500/50 focus:ring-red-500/20"
                          : "border-slate-600/50 focus:ring-purple-500/20 focus:bg-slate-700/70"
                      }`}
                    >
                      <option value="" className="bg-slate-700">
                        Select your department
                      </option>
                      <option value="CS" className="bg-slate-700">
                        Computer Science
                      </option>
                      <option value="SE" className="bg-slate-700">
                        Software Engineering
                      </option>
                      <option value="IS" className="bg-slate-700">
                        Information Systems
                      </option>
                    </select>
                  </div>
                  {errors.department && (
                    <p className="text-red-400 text-sm mt-2">
                      {errors.department}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Password Field */}
            <div className="space-y-3">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <circle cx="12" cy="16" r="1" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m7 11V7a5 5 0 0 1 10 0v4"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full pl-12 pr-14 py-4 bg-slate-700/50 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-white placeholder-slate-400 ${
                    errors.password
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-slate-600/50 focus:ring-purple-500/20 focus:bg-slate-700/70"
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-slate-600/20 rounded-r-2xl transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5 text-slate-400 hover:text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m15 18-.722-3.25"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m2 2 20 20"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6.71 6.71C2.66 9.49 1 12 1 12s3.5 7.5 11 7.5c1.29 0 2.51-.18 3.65-.5l-1.65-1.65"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m14 14.12A3 3 0 1 1 9.88 10"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-slate-400 hover:text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">
                      Password strength
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.strength >= 4
                          ? "text-green-400"
                          : passwordStrength.strength >= 3
                          ? "text-blue-400"
                          : passwordStrength.strength >= 2
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-400 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-3">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-slate-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <circle cx="12" cy="16" r="1" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m7 11V7a5 5 0 0 1 10 0v4"
                    />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`w-full pl-12 pr-14 py-4 bg-slate-700/50 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-white placeholder-slate-400 ${
                    errors.confirmPassword
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-slate-600/50 focus:ring-purple-500/20 focus:bg-slate-700/70"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-slate-600/20 rounded-r-2xl transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5 text-slate-400 hover:text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m15 18-.722-3.25"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m2 2 20 20"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6.71 6.71C2.66 9.49 1 12 1 12s3.5 7.5 11 7.5c1.29 0 2.51-.18 3.65-.5l-1.65-1.65"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m14 14.12A3 3 0 1 1 9.88 10"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-slate-400 hover:text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    handleInputChange("agreeToTerms", e.target.checked)
                  }
                  className="w-5 h-5 text-purple-500 bg-slate-700/50 border-slate-600/50 rounded focus:ring-purple-500 focus:ring-2 mt-0.5"
                />
                <span className="ml-3 text-sm text-slate-300">
                  I agree to the{" "}
                  <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-2xl hover:shadow-purple-500/25 hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                <>
                  Create {activeTab === "admin" ? "Admin" : "Student"} Account
                  <svg
                    className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
