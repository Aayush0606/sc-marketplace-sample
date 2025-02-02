import React, { useState } from "react";
import Modal from "react-modal";
import { Minus, Plus, X } from "lucide-react";
import ImageUploading from "react-images-uploading";
import axios from "axios";
import { BASE_URL } from "../constants/api_constants";
import network_service from "../utils/network_service";
import { Package } from "../types/package";
import { toast } from "react-toastify";

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  packageDetails: Package | null;
}

const EditMoral: React.FC<ModalComponentProps> = ({
  isOpen,
  onClose,
  packageDetails,
}) => {
  if (!packageDetails) {
    return null;
  }

  const [inputs, setInputs] = useState<string[]>(packageDetails.documentUrls?.length ? packageDetails.documentUrls : [""]);
  const [images, setImages] = useState<any[]>(
    packageDetails.thumbnail ? [{ data_url: packageDetails.thumbnail }] : []
  );
  const [isImage, setIsImage] = useState<boolean>(false);
  const maxNumber = 1;

  const handleInputChange = (value: string, index: number) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleAddInput = () => {
    if (inputs[inputs.length - 1].trim() === "") return;
    setInputs([...inputs, ""]);
  };

  const handleMinusInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const onChange = (imageList: any) => {
    setImages(imageList);
    setIsImage(imageList.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Always send array, even if empty
    const filteredInputs = inputs.filter((input) => input.trim() !== "");
    // Always send either new image URL or existing thumbnail
    let uploadedImageUrl = packageDetails.thumbnail;

    try {
      if (isImage && images[0]?.file) {
        const formData = new FormData();
        formData.append("thumbnail", images[0].file);
        const uploadResponse = await axios.post(
          `${BASE_URL}/util/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        uploadedImageUrl = uploadResponse.data.path;
      }

      const postResponse = await network_service.put<any>({
        url: `/package/updateMetadata/${packageDetails.packageName}`,
        body: {
          documentUrls: filteredInputs,
          thumbnail: uploadedImageUrl,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (postResponse.status === 200) {
        toast.success("Update successful!");
        onClose(); // Immediately close modal on success
      } else {
        throw new Error("Failed to update metadata. Please try again.");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || "An error occurred. Please try again."}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      contentLabel="Modal"
      className="w-full h-full max-h-fit overflow-auto max-w-4xl mx-10 p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 transition-all"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Edit package details
      </h2>

      <form onSubmit={handleSubmit} className="p-4">
        {inputs.map((input, index) => (
          <div key={index} className="flex items-center mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value, index)}
              className="w-full border dark:text-white border-gray-300 dark:border-blue-600 dark:bg-gray-700 rounded-lg px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
              placeholder="Add Links"
            />
            <button
              onClick={handleAddInput}
              className="px-2 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400 text-white"
            >
              <Plus />
            </button>
            {inputs.length > 1 && (
              <button
                onClick={() => handleMinusInput(index)}
                className="ml-2 px-2 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-500 hover:bg-red-600"
              >
                <Minus />
              </button>
            )}
          </div>
        ))}

        <div className="p-4">
          <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber} dataURLKey="data_url">
            {({ imageList, onImageUpload, onImageRemove }) => (
              <div className="w-full">
                <div
                  className="w-full px-4 py-2 border-dotted border-blue-500 dark:border-white border-2 flex flex-col items-center justify-center rounded-md min-h-[200px] cursor-pointer"
                  onClick={onImageUpload}
                >
                  {imageList.length > 0 ? (
                    <div className="relative w-full h-full flex justify-center">
                      <img
                        src={imageList[0]["data_url"]}
                        alt="Uploaded"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <button
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageRemove(0);
                          setIsImage(false);
                        }}
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <h2 className="md:p-10 text-3xl dark:text-gray-300">Drop Image here</h2>
                  )}
                </div>
              </div>
            )}
          </ImageUploading>
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
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
  );
};

export default EditMoral;