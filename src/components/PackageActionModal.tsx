// ReviewModal.tsx
import React from 'react';
import Modal from "react-modal";
import network_service from "../utils/network_service";
import { CHANGE_PACKAGE_STATUS } from "../constants/api_constants";
import { useNavigate } from "react-router-dom";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalType: "accept" | "reject" | null;
    selectedPackage: string | null;
    fetchPackages:Function | null;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, modalType, selectedPackage,fetchPackages }) => {
    const [reason, setReason] = React.useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const status = modalType === 'accept' ? 'PUBLISHED' : 'REJECTED';
        try {
            await network_service.put<any>({
                url: `${CHANGE_PACKAGE_STATUS}/${selectedPackage}?status=${status}`,
                body: { "remark": reason },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setReason(null);
        } catch (error) {
            console.log(error);
            onClose();
            return;
        } finally {
            onClose();
        }
        if(fetchPackages){
            fetchPackages();
        }else{
            navigate('/review');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="w-full max-w-lg mx-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-xl p-6 sm:p-8"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4"
        >
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 capitalize">
                {modalType === "accept" ? "Accept Package" : "Reject Package"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {modalType === "accept"
                    ? "You are about to accept this package. Please confirm your action."
                    : "Provide a reason for rejecting this package."}
            </p>
            <form onSubmit={handleSubmit}>
                {modalType === "reject" && (
                    <textarea
                        placeholder="Reason for rejection"
                        className="w-full px-4 py-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 resize-none"
                        rows={4}
                        required
                        value={reason ?? ""}
                        onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                )}
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ReviewModal;