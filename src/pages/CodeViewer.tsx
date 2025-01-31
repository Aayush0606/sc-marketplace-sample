import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import axios from "axios";
import { ChevronDown, ChevronRight } from "lucide-react";
import MarkdownComponent from "../components/MarkdownComponent";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import ReviewModal from "../components/PackageActionModal";
import network_service from "../utils/network_service";

const isFile = (path: string) => path.includes(".") && !path.endsWith("/");

const ZipViewer: React.FC = () => {
  const [fileList, setFileList] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedPaths, setExpandedPaths] = useState<{ [key: string]: boolean }>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"accept" | "reject" | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const theme = useSelector((state: RootState) => state.theme);
  const packageName = searchParams.get("package");

  useEffect(() => {
    fetchAndProcessBuffer();
  }, []);

  const openModal = (type: "accept" | "reject") => {
    setModalType(type);
    setIsModalOpen(true);
    setSelectedPackage(packageName);
  };

  const closeModal = () => {
    setModalType(null);
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const fetchAndProcessBuffer = async () => {
    setLoading(true);
    setError(null);
    setFileList(null);
    setFileContent("");

    try {
      const response = await network_service.get<any>({url:`/package/${packageName}`, 
        headers: {
          consumerKey: "e755c4b448d84c72837850c4bedf3619",
        
      }});

      const packageBuffer = response.data.packageBuffer;

      let fileContentMap: { [key: string]: string } = {};
      let allPackages: { [key: string]: string[] } = {};

      for (const { packageName, buffer } of packageBuffer) {
        if (buffer.type === "Buffer") {
          const arrayBuffer = new ArrayBuffer(buffer.data.length);
          const view = new Uint8Array(arrayBuffer);
          view.set(buffer.data);

          try {
            const zip = await JSZip.loadAsync(arrayBuffer);
            zip.forEach(async (relativePath) => {
              if (!relativePath.startsWith(".") && !relativePath.startsWith("windows")) {
                if (!allPackages[packageName]) {
                  allPackages[packageName] = [];
                }
                allPackages[packageName].push(relativePath);

                const fileData = await zip.file(relativePath)?.async("text");
                if (fileData) {
                  fileContentMap[`${packageName}/${relativePath}`] = fileData;
                }
              }
            });
          } catch (err) {
            setError(`Error processing ZIP from ${packageName}`);
            console.error(err);
          }
        }
      }

      const fileTree = createTreeStructure(allPackages, packageName);
      setFileList({ tree: fileTree, content: fileContentMap });
      setExpandedPaths({ [packageName || ""]: true });
    } catch (err) {
      setError((err as Error).message || "An error occurred while processing the buffer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTreeStructure = (packages: { [key: string]: string[] }, packageName: string | null) => {
    const tree: any = {};

    if (packageName && packages[packageName]) {
      const files = packages[packageName];
      const packageTree: any = {};

      files.forEach((file) => {
        const parts = file.split("/");
        let current = packageTree;

        parts.forEach((part, index) => {
          if (!current[part]) {
            current[part] = index === parts.length - 1 ? null : {};
          }
          current = current[part];
        });
      });

      tree[packageName] = packageTree;
    }

    return tree;
  };

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleClick = (path: string) => {
    if (isFile(path)) {
      setSelectedFile(path);
      setFileContent(fileList.content[path]);
    } else {
      toggleExpand(path);
    }
  };

  const renderTree = (node: any, path: string = ""): JSX.Element[] => {
    return Object.keys(node).map((key) => {
      const currentNode = node[key];
      const fullPath = path ? `${path}/${key}` : key;
      const isOpen = expandedPaths[fullPath];

      return (
        <div key={fullPath} className="ml-4">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleClick(fullPath)}
          >
            {currentNode && (
              <span
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(fullPath);
                }}
              >
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            )}
            <span className="font-medium">{key}</span>
          </div>

          {isOpen && currentNode && renderTree(currentNode, fullPath)}
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="w-1/3 min-w-[300px] max-w-md flex flex-col border-r border-gray-200 dark:border-gray-700">
        <div className="h-[75%] overflow-y-auto p-4 bg-white dark:bg-gray-800">
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}
          <div className="h-full border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 overflow-y-auto text-gray-500 dark:text-gray-400">
            {fileList ? (
              <div>{renderTree(fileList.tree)}</div>
            ) : (
              <p>No file structure to display</p>
            )}
          </div>
        </div>

        <div className="h-[25%] p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex gap-4 w-full">
            <button
              onClick={() => openModal("accept")}
              className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => openModal("reject")}
              className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {selectedFile ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {selectedFile.split("/").map((part, index, arr) => (
                <span key={index}>
                  {index > 0 && (
                    <span className="mx-2 text-gray-400">/</span>
                  )}
                  <span className={index === arr.length - 1 ? "font-medium" : ""}>
                    {part}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Select a file to view its content</p>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-800">
          {selectedFile && (
            <div className="h-full">
              {selectedFile.endsWith(".md") ? (
                <MarkdownComponent markdown={fileContent} />
              ) : (
                <SyntaxHighlighter
                  language="dart"
                  style={theme === 'dark' ? oneDark : oneLight}
                  showLineNumbers={true}
                  wrapLines={true}
                  className="h-full"
                >
                  {fileContent}
                </SyntaxHighlighter>
              )}
            </div>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        modalType={modalType}
        selectedPackage={selectedPackage}
        fetchPackages={null}
      />
    </div>
  );
};

export default ZipViewer;