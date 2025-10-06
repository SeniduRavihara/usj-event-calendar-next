"use client";
import { useAuth } from "../../../components/AuthContext";
import { ProtectedRoute } from "../../../components/ProtectedRoute";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/dashboard"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </a>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                User Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {user?.role}
                  </span>
                </div>

                {user?.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.department}
                    </p>
                  </div>
                )}

                {user?.student_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Student ID
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.student_id}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Member Since
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

