// ModalComponent.tsx
import React, { useState } from "react";
import Modal from "react-modal";
import ImageUploader from "./ImageUploader";
import { Minus, Plus } from "lucide-react";


interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit?: (reason?: string) => void;
//   caseType: "accept" | "reject";
}

const data = {
  links:[],
  image: String
}


const EditMoral: React.FC<ModalComponentProps> = ({
  isOpen,
  onClose,
  title,
//   onSubmit,
//   caseType,
}) => {


    const [inputs, setInputs] = useState<string[]>([""]);

    // Function to handle input change
    const handleInputChange = ( value: string) => {
        const newInputs = [...inputs];
        newInputs[inputs.length-1]=value;
        setInputs(newInputs);
    };

    // Function to add a new input field
    const handleAddInput = () => {
      if(inputs[inputs.length-1].trim()==="") return;
      const newVal=[...inputs,""];
      setInputs(newVal);
    };

    const handleMinusInput = (index: number) => {
      if (inputs.length <= 1) return;
    
    // Create a new array without the input at the specified index
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

    
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Modal"
      className="w-full h-full max-h-fit overflow-auto max-w-4xl mx-10 p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 transition-all"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        {title}
      </h2>
        <div className="p-4">
        {inputs.map((input, index) => (
            <div key={index} className="flex items-center mb-4">
            <input
                type="text"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full border dark:text-white border-gray-300 dark:border-blue-600 dark:bg-gray-700 rounded-lg px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                placeholder="Add Links"
            />
            {index === inputs.length - 1 && (
                <button
                onClick={handleAddInput}
                className={`px-2 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 ${
                  inputs[inputs.length-1].trim()!=="" 
                    ? 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-300 text-gray-400'
                }`}
              >
                <Plus className="" />
              </button>
            )}
            
            {inputs.length > 1 && index !== inputs.length - 1 &&<button
                onClick={() => handleMinusInput(index)}
                disabled={inputs.length <= 1}
                className={`px-2 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-500 hover:bg-red-600`}
            >
                <Minus/>
            </button>}
            </div>
        ))}
        </div>   
        <ImageUploader/>     
        <div className="flex justify-end p-4">
            <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-gray-400 text-white rounded hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
            >
            Cancel
            </button>
            <button
            type="button"
            onClick={()=>console.log(inputs)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
            Submit
            </button>
      </div>
    </Modal>
  );
};

export default EditMoral;
