import React, { useCallback, useEffect, useRef, useState } from "react";
import network_service from "../utils/network_service";
import { PACKAGE_URL, USER_PACKAGE_URL } from "../constants/api_constants";
import Modal, { setAppElement } from "react-modal"
import { Check, Code, X } from "lucide-react";


Modal.setAppElement("#root");


const ReviewPackages: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [packages, setPackages] = useState<any[]>([]);
    
    const fetchIdRef = useRef<number>(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);

    const openAccept = () => {
        setIsAccepted(true);
    }

    const closeAccept = () => {
        setIsAccepted(false);
    }

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = (e:any) => {
        e.preventDefault();
        alert("Form submitted!");
        closeModal();
    };


    const fetchPackages = useCallback(
        async () => {
            setLoading(true);
            setError(null);
            const currFetchId = ++fetchIdRef.current;

            try{
                const token = localStorage.getItem("token");
                const response = await network_service.get<any>({
                    url: PACKAGE_URL,
                    timeOutDuration:10000,
                    headers: {
                    Authorization: `Bearer ${token}`,
                    },
                });
                if (currFetchId === fetchIdRef.current){
                    setPackages(response.data.packages);
                    console.log(response.data.packages)
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
        },
        []
    )

    useEffect(() => {
        fetchPackages();
      }, [fetchPackages]);

    return(
        <div className="w-screen h-screen">
        <div className="flex flex-col items-center h-full py-5 px-10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 p-5">
                Review Packages
            </h2>
            <div className="w-full h-min-20bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="">
                    {/* Packages */}
                    <div className="p-10">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 animate-pulse">
                                    Loading...
                                </p>
                            </div>
                        ): error ? (
                            <div className="flex justify-center items-center py-12">
                              <p className="text-red-500">{error}</p>
                            </div>
                          ): !packages || packages.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No packages found in this category.
                                </p>
                            </div>
                          ):(
                            <div className="flex flex-col">
                            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> */}
                            {packages.map((pkg, index) => (
                                // <div
                                //     key={`${pkg.id}-${index}`}
                                //     className="w-full p-6 mb-5 bg-gradient-to-br from-gray-100 dark:from-gray-700 to-gray-200 dark:to-gray-600 rounded-lg shadow-xl hover:shadow-2xl transform transition-all duration-300"
                                // >
                                //     <div className="flex">
                                //         <div className="flex flex-col flex-1">
                                //             <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                                //                 {pkg.packageName}
                                //             </h3>
                                //             <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                //                 {pkg.description}
                                //             </p>
                                //             <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                //                 By : {pkg.user.username}
                                //             </p>
                                //             <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                //                 Email : {pkg.user.email}
                                //             </p>
                                //             <div className="flex justify-between items-center mt-4">
                                //                 <span className="text-sm text-gray-500 dark:text-gray-400">
                                //                     Submitted:{" "}
                                //                     {new Date(pkg.updatedAt).toLocaleDateString("en-US", {
                                //                         year: "numeric",
                                //                         month: "long",
                                //                         day: "numeric",
                                //                     })}
                                //                 </span>
                                //             </div>
                                //             <div className="flex sm:flex-row pt-4">
                                //                 {/* Accept */}
                                //                 <button className="bg-green-500 px-5 py-2 mr-5 rounded-md hover:bg-green-300" onClick={openAccept}>
                                //                     Accept
                                //                 </button>
                                //                 <Modal
                                //                     isOpen={isAccepted}
                                //                     onRequestClose={closeAccept}
                                //                     contentLabel="Example Modal"
                                //                     className="w-[90%] max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 transition-all"
                                //                     overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                                //                 >
                                //                     <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                                //                         Accept
                                //                     </h2>
                                //                     {/* Buttons */}
                                //                     <div className="flex justify-end">
                                //                         <button
                                //                             type="button"
                                //                             onClick={closeAccept}
                                //                             className="px-4 py-2 mr-2 bg-gray-400 text-white rounded hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
                                //                         >
                                //                             Cancel
                                //                         </button>
                                //                         <button
                                //                             type="submit"
                                //                             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                //                         >
                                //                             Confirm
                                //                         </button>
                                //                     </div>
                                //                 </Modal>
                                //                 {/* Reject */}
                                //                 <button 
                                //                     className="bg-red-500 px-5 py-2 mr-5 rounded-md hover:bg-red-300"
                                //                     onClick={openModal}
                                //                 >
                                //                     Reject
                                //                 </button>
                                //                 <button
                                //                     type="submit"
                                //                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                //                 >
                                //                     Review code
                                //                 </button>
                                //                 <Modal
                                //                     isOpen={isModalOpen}
                                //                     onRequestClose={closeModal}
                                //                     contentLabel="Example Modal"
                                //                     className="w-[90%] max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 transition-all"
                                //                     overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                                //                 >
                                //                     <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                                //                         Reject
                                //                     </h2>
                                //                     <form onSubmit={handleSubmit}>
                                //                         {/* Input field */}
                                //                         <input
                                //                             type="text"
                                //                             placeholder="Reason for rejecting"
                                //                             className="w-full px-4 py-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                //                             required
                                //                         />

                                //                         {/* Buttons */}
                                //                         <div className="flex justify-end">
                                //                             <button
                                //                                 type="button"
                                //                                 onClick={closeModal}
                                //                                 className="px-4 py-2 mr-2 bg-gray-400 text-white rounded hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
                                //                             >
                                //                                 Cancel
                                //                             </button>
                                //                             <button
                                //                                 type="submit"
                                //                                 className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                //                             >
                                //                                 Submit
                                //                             </button>
                                //                         </div>
                                //                     </form>
                                //                 </Modal>
                                //             </div>
                                //         </div>
                                //         <img
                                //             src={pkg.thumbnail ? pkg.thumbnail : "https://salescode.ai/wp-content/uploads/2023/04/Square-Teal-.png"}
                                //             alt={pkg.packageName}
                                //             className="w-3/5 h-48 object-cover ml-6 rounded-lg"
                                //         />
                                //     </div>
                                // </div>
                                <div
                                    key={`${pkg.id}-${index}`}
                                    className="w-full p-6 mb-5 bg-gradient-to-br from-gray-100 dark:from-gray-700 to-gray-200 dark:to-gray-600 rounded-lg shadow-xl hover:shadow-2xl transform transition-all duration-300"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Image at the top for md screens and below, on the side for larger screens */}
                                        <img
                                            src={pkg.thumbnail ? pkg.thumbnail : "https://salescode.ai/wp-content/uploads/2023/04/Square-Teal-.png"}
                                            alt={pkg.packageName}
                                            className="md:w-3/5 h-48 object-cover rounded-lg mb-6 md:mb-0 md:ml-6 md:order-2"
                                        />
                                        <div className="flex flex-col flex-1 md:order-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                {pkg.packageName}
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                                {pkg.description}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-1">
                                                By : {pkg.user.username}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                                Email : {pkg.user.email}
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
                                            <div className="flex flex-row pt-4">
                                                {/* Accept */}
                                                <button className="bg-green-500 px-3 py-1 mr-5 rounded-md hover:bg-green-300" onClick={openAccept}>
                                                    <div className="flex">
                                                    <Check /> Accept
                                                    </div>
                                                
                                                </button>
                                                <Modal
                                                    isOpen={isAccepted}
                                                    onRequestClose={closeAccept}
                                                    contentLabel="Example Modal"
                                                    className="w-[90%] max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 transition-all"
                                                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                                                >
                                                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                                                    Accept
                                                    </h2>
                                                    {/* Buttons */}
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={closeAccept}
                                                            className="px-4 py-2 mr-2 bg-gray-400 text-white rounded hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                                        >
                                                            Confirm
                                                        </button>
                                                    </div>
                                                </Modal>
                                                {/* Reject */}
                                                <button 
                                                    className="bg-red-500 px-3 py-2 mr-5 rounded-md hover:bg-red-300"
                                                    onClick={openModal}
                                                >
                                                    <div className="flex">
                                                    <X /> Reject
                                                    </div>
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                                >
                                                    <div className="flex">
                                                    <Code className="mr-1"/>Review code
                                                    </div>
                                                </button>
                                                <Modal
                                                    isOpen={isModalOpen}
                                                    onRequestClose={closeModal}
                                                    contentLabel="Example Modal"
                                                    className="w-[90%] max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 transition-all"
                                                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                                                >
                                                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                                                        Reject
                                                    </h2>
                                                    <form onSubmit={handleSubmit}>
                                                        {/* Input field */}
                                                        <input
                                                            type="text"
                                                            placeholder="Reason for rejecting"
                                                            className="w-full px-4 py-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                                            required
                                                        />

                                                        {/* Buttons */}
                                                        <div className="flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={closeModal}
                                                                className="px-4 py-2 mr-2 bg-gray-400 text-white rounded hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                                            >
                                                                Submit
                                                            </button>
                                                        </div>
                                                    </form>
                                                </Modal>
                                            </div>
                                        </div>
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
    )
}

export default ReviewPackages;