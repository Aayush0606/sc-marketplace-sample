import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router";
import network_service from "../utils/network_service";
import { USER_PACKAGE_URL } from "../constants/api_constants";
import { Role } from "../types/user";

type PackageStatus = "published" | "rejected" | "pending" | "starred";

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<PackageStatus>("published");
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const fetchIdRef = useRef<number>(0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/marketplace");
  };

  const fetchPackages = useCallback(
    async (status: PackageStatus) => {
      setLoading(true);
      setError(null);
      const currentFetchId = ++fetchIdRef.current;

      try {
        const token = localStorage.getItem("token");
        const response = await network_service.get<any>({
          url: `${USER_PACKAGE_URL}?status=${status.toUpperCase()}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (currentFetchId === fetchIdRef.current) {
          setPackages(response.data.packages);
        }
      } catch (err) {
        if (currentFetchId === fetchIdRef.current) {
          setError("Failed to fetch packages");
        }
      } finally {
        if (currentFetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchPackages(activeTab);
  }, [activeTab, fetchPackages]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 bg-opacity-75 backdrop-blur-lg rounded-lg shadow-lg p-6">
            <div className="text-center">
              <img
                src={user?.avatarUrl}
                alt={user?.displayName}
                className="mx-auto h-24 w-24 rounded-full border-4 border-primary-500 shadow-lg"
              />
              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {user?.displayName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
            <div className="mt-6 space-y-2">
              <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                Edit Profile
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                Change Password
              </button>
              {user?.role===Role.Admin && <button 
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                onClick={()=>{navigate('/review')}}>
                Review Packages
              </button>}
              <button
                className="w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white rounded-md"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Package List */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px overflow-x-auto whitespace-nowrap">
                {(["published", "pending", "rejected", "starred"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setActiveTab(status)}
                      className={`transition-all duration-300 py-3 px-6 font-medium text-sm capitalize ${
                        activeTab === status
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg shadow"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 animate-pulse">
                    Loading...
                  </p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-12">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : !packages || packages.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No packages found in this category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg, index) => (
                    <div
                      key={`${pkg.id}-${index}`}
                      className="p-6 bg-gradient-to-br from-gray-100 dark:from-gray-700 to-gray-200 dark:to-gray-600 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {pkg.packageName}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                        {pkg.description}
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Submitted:{" "}
                          {new Date(pkg.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ProfilePage };
