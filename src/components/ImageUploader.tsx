import { X } from 'lucide-react';
import React, { useState } from 'react';
import ImageUploading from 'react-images-uploading';

const ImageUploader: React.FC<any> = () => {
    const [images, setImages] = useState([]);
    const [isImage, setIsImage] = useState<boolean>(false);
    const maxNumber = 1;
    
    const onChange = (imageList: any, addUpdateIndex: any) => {
        console.log(imageList, addUpdateIndex);
        setImages(imageList);
        setIsImage(imageList.length > 0);
    };

    return (
        <div className='p-4'>
            <ImageUploading
                value={images}
                onChange={onChange}
                maxNumber={maxNumber}
                dataURLKey="data_url"
            >
                {({
                    imageList,
                    onImageUpload,
                    onImageRemove,
                    isDragging,
                    dragProps,
                }) => (
                    <div>
                        <div 
                            className="w-full px-4 py-2 mr-2 border-dotted border-blue-500 dark:border-white border-2 flex flex-col items-center justify-center rounded-md min-h-[200px]" 
                            onClick={() => !isImage && onImageUpload()}
                            {...dragProps}
                        >
                            {imageList.length > 0 ? (
                                <div className="relative group w-full h-full flex justify-center overflow-auto">
                                    <img 
                                        src={imageList[0]['data_url']} 
                                        alt="Uploaded" 
                                        className="max-h-[60%] object-contain rounded-lg group-hover:brightness-75"
                                    />
                                    <button
                                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                                <h2
                                    className='md:p-10 text-3xl dark:text-gray-300'
                                    style={isDragging ? { color: 'red' } : undefined}
                                >
                                    Drop Image here
                                </h2>
                            )}
                        </div>
                        
                        {!isImage && (
                            <button
                                type="button"
                                onClick={onImageUpload}
                                className="w-full px-4 py-2 mt-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                Upload
                            </button>
                        )}
                    </div>
                )}
            </ImageUploading>
        </div>
    );
};

export default ImageUploader;