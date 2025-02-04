import React, { useCallback, useEffect, useRef, useState } from "react";
import network_service from "../utils/network_service";
import { CHANGE_PACKAGE_STATUS, PACKAGE_URL } from "../constants/api_constants";
import Modal from "react-modal";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { Role } from "../types/user";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import ReviewModal from "../components/PackageActionModal";

Modal.setAppElement("#root");

const ReviewPackages: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [packages, setPackages] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"accept" | "reject" | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

    const navigate = useNavigate();
    const fetchIdRef = useRef<number>(0);

    const fetchPackages = useCallback(async () => {
        setLoading(true);
        setError(null);
        const currFetchId = ++fetchIdRef.current;

        try {
            const token = localStorage.getItem("token") ?? "";
            const decodedToken = jwtDecode<DecodedToken>(token);
            const response = await network_service.get<any>({
                url: `${PACKAGE_URL}?status=PENDING`,
                // url: `${PACKAGE_URL}`,
                timeOutDuration: 10000,
                headers: {
                    userid: `${decodedToken.id}`,
                },
            });
            if (currFetchId === fetchIdRef.current) {
                setPackages(response.data.packages);
            }
        } catch (err) {
            if (currFetchId === fetchIdRef.current) {
                setError("Failed to fetch packages");
            }
        } finally {
            if (currFetchId === fetchIdRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token === null || token === '') {
            navigate("/marketplace");
            return;
        }
        const decodedToken = jwtDecode<DecodedToken>(token!);
        if (!decodedToken.id || decodedToken.role !== Role.Admin) {
            navigate("/marketplace");
            return;
        }
        fetchPackages();
    }, [fetchPackages, navigate]);

    const openModal = (type: "accept" | "reject", packageName: string) => {
        setModalType(type);
        setIsModalOpen(true);
        setSelectedPackage(packageName);
    };

    const closeModal = () => {
        setModalType(null);
        setIsModalOpen(false);
        setSelectedPackage(null);
    };

    const handleReviewClick = async (packageName: string) => {
        navigate(`/review-code?package=${packageName}`);
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto py-8 px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
                    Review Packages
                </h2>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center py-12">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : !packages.length ? (
                        <div className="flex justify-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">No packages found in this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg shadow-md p-4 hover:shadow-lg transition-transform transform"
                                >
                                    <img
                                        src={(pkg.thumbnail && pkg.thumbnail !== "") ? pkg.thumbnail : "https://salescode.ai/wp-content/uploads/2023/04/Square-Teal-.png"}
                                        alt={pkg.packageName}
                                        className="w-full h-40 object-cover rounded-md mb-4"
                                    />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {pkg.packageName}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 line-clamp-1">
                                        {pkg.description}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Uploaded by: {pkg.user.username}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Email: {pkg.user.email}</p>
                                    <span className="block text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        Submitted: {new Date(pkg.updatedAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>

                                    <div className="flex w-full gap-2 mt-4">
                                        <button
                                            onClick={() => openModal("accept", pkg.packageName)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                        >
                                            <CheckCircle size={16} /> Accept
                                        </button>
                                        <button
                                            onClick={() => openModal("reject", pkg.packageName)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        >
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleReviewClick(pkg.packageName)}
                                        className="flex items-center gap-2 mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        <FileText size={16} /> Review Code
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <ReviewModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    modalType={modalType}
                    selectedPackage={selectedPackage}
                    fetchPackages={fetchPackages}
                />
            </div>
        </div>
    );
};

export default ReviewPackages;
