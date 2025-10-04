"use client";
import { useState } from "react";
import Link from "next/link";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "STUDENT" | "ADMIN";
  department?: string;
  student_id?: string;
  agreeToTerms: boolean;
}

interface SignupFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  department?: string;
  student_id?: string;
  agreeToTerms?: string;
  api?: string;
}

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
    department: "",
    student_id: "",
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  const departments = [
    "Computer Science",
    "Engineering",
    "Business",
    "Medicine",
    "Arts",
    "Science",
    "Law"
  ];

  const handleTabChange = (tab: "STUDENT" | "ADMIN") => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      role: tab,
      department: tab === "ADMIN" ? undefined : "",
      student_id: tab === "ADMIN" ? undefined : ""
    }));
    setErrors({});
  };

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: SignupFormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
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
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (activeTab === "STUDENT") {
      if (!formData.department) {
        newErrors.department = "Department is required for students";
      }
      if (!formData.student_id) {
        newErrors.student_id = "Student ID is required";
      }
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const strengthMap = {
      0: { text: "Very Weak", color: "bg-red-500" },
      1: { text: "Weak", color: "bg-red-400" },
      2: { text: "Fair", color: "bg-yellow-400" },
      3: { text: "Good", color: "bg-blue-400" },
      4: { text: "Strong", color: "bg-green-400" },
      5: { text: "Very Strong", color: "bg-green-500" }
    };

    return { strength, ...strengthMap[strength as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: activeTab,
        ...(activeTab === "STUDENT" && {
          department: formData.department,
          student_id: formData.student_id
        })
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ api: data.error || "Registration failed" });
      } else {
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      setErrors({ api: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23AC92E4' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }}></div>
      
      <div className="relative w-full max-w-lg">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="m22 21-3-3m-5.5 0a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join the university events platform</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => handleTabChange("STUDENT")}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "STUDENT"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("ADMIN")}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "ADMIN"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* API Error */}
          {errors.api && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.api}
            </div>
          )}

          <div className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.name 
                      ? "border-red-300 focus:ring-red-200" 
                      : "border-gray-200 focus:ring-purple-200 focus:bg-white"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 7V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3"></path>
                    <path d="M21 8 12 13l-9-5"></path>
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.email 
                      ? "border-red-300 focus:ring-red-200" 
                      : "border-gray-200 focus:ring-purple-200 focus:bg-white"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Student-specific fields */}
            {activeTab === "STUDENT" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-semibold text-gray-700">
                    Department
                  </label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      errors.department 
                        ? "border-red-300 focus:ring-red-200" 
                        : "border-gray-200 focus:ring-purple-200 focus:bg-white"
                    }`}
                  >
                    <option value="">Select your department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-1">{errors.department}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="student_id" className="text-sm font-semibold text-gray-700">
                    Student ID
                  </label>
                  <input
                    id="student_id"
                    type="text"
                    value={formData.student_id}
                    onChange={(e) => handleInputChange("student_id", e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      errors.student_id 
                        ? "border-red-300 focus:ring-red-200" 
                        : "border-gray-200 focus:ring-purple-200 focus:bg-white"
                    }`}
                    placeholder="e.g., CS2024001"
                  />
                  {errors.student_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.student_id}</p>
                  )}
                </div>
              </>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="m7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.password 
                      ? "border-red-300 focus:ring-red-200" 
                      : "border-gray-200 focus:ring-purple-200 focus:bg-white"
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path d="m15 18-.722-3.25m-1.278 1.25L12 14m-3 4-.722-3.25M2 2l20 20"></path>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength >= 4 ? 'text-green-600' : 
                      passwordStrength.strength >= 3 ? 'text-blue-600' :
                      passwordStrength.strength >= 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword 
                      ? "border-red-300 focus:ring-red-200" 
                      : "border-gray-200 focus:ring-purple-200 focus:bg-white"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showConfirmPassword ? (
                      <path d="m15 18-.722-3.25m-1.278 1.25L12 14m-3 4-.722-3.25M2 2l20 20"></path>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="space-y-2">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-0.5"
                />
                <span className="ml-3 text-sm text-gray-600">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                <>
                  Create Account
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}