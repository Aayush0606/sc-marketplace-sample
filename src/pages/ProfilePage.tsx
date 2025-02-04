import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router";
import network_service from "../utils/network_service";
import { USER_PACKAGE_URL } from "../constants/api_constants";
import { Tooltip } from "react-tooltip";
import { Pencil, Info } from "lucide-react";
import EditMoral from "../components/EditMoral";
import { Package } from "../types/package";

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
  const theme = useSelector((state: RootState) => state.theme);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const openModal = (packageName: Package) => {
    setIsModalOpen(true);
    setEditingPackage(packageName);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

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
    const token = localStorage.getItem("token");
    if (token === null || token === '') {
      navigate("/marketplace");
      return;
    }
    fetchPackages(activeTab);
  }, [activeTab, fetchPackages]);

  const statusTooltipStyles: Record<PackageStatus, string> = {
    published: "text-green-500",
    rejected: "text-red-500",
    pending: "text-yellow-500",
    starred: "text-blue-500",
  };

  const statusTooltipMessages: Record<PackageStatus, string> = {
    published: "Package approved by admin",
    rejected: "Package rejected by admin: {remark}",
    pending: "Package waiting for approval by admin",
    starred: "Package starred by user",
  };

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
              {user?.role === "admin" && (
                <button
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => {
                    navigate("/review");
                  }}
                >
                  Review Packages
                </button>
              )}
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
                      className={`transition-all duration-300 py-3 px-6 font-medium text-sm capitalize ${activeTab === status
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
                      className="p-6 bg-gradient-to-br from-gray-100 dark:from-gray-700 to-gray-200 dark:to-gray-600 rounded-lg shadow-xl hover:shadow-2xl transform transition-all duration-300"
                    >
                      <div className="flex items-center justify-between gap-4 w-full">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate min-w-0 flex-1">
                          {pkg.packageName}
                        </h3>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="relative">
                            <Info
                              size={18}
                              className={`${statusTooltipStyles[activeTab]} cursor-pointer hover:opacity-80 transition-opacity`}
                              data-tooltip-id={`tooltip-${pkg.id}`}
                            />
                            <Tooltip
                              id={`tooltip-${pkg.id}`}
                              place="top"
                              clickable
                              variant={theme === "dark" ? "dark" : "light"}
                              opacity={1}
                              className="rounded-lg shadow-lg p-2 text-black dark:text-white max-w-xs whitespace-normal"
                            >
                              {activeTab === "rejected" && pkg.remark
                                ? `Package rejected by admin : ${pkg.remark}`
                                : statusTooltipMessages[activeTab]}
                            </Tooltip>
                          </div>
                          <button
                            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                            onClick={() => openModal(pkg)}
                          >
                            <Pencil size={18} className="text-gray-700 dark:text-white" />
                          </button>
                        </div>
                      </div>
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
      <EditMoral
        isOpen={isModalOpen}
        onClose={closeModal}
        packageDetails={editingPackage}
      />
    </div>
  );
};

export { ProfilePage };
