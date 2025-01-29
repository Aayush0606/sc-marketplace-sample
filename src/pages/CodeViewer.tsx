import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import axios from "axios";
import { ChevronDown, ChevronRight } from "lucide-react";
import MarkdownComponent from "../components/MarkdownComponent";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { twilight } from "react-syntax-highlighter/dist/esm/styles/prism";

const isFile = (path: string) => {
  return path.includes('.') && !path.endsWith('/');
};

const ZipViewer: React.FC = () => {
  const [fileList, setFileList] = useState<any>(null); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedPaths, setExpandedPaths] = useState<{ [key: string]: boolean }>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  useEffect(() => {
    fetchAndProcessBuffer();
  }, []);

  const fetchAndProcessBuffer = async () => {
    setLoading(true);
    setError(null);
    setFileList(null);
    setFileContent("");

    try {
      const response = await axios.get("https://salescode-marketplace.salescode.ai/package/dummy1", {
        headers: {
          consumerKey: "e755c4b448d84c72837850c4bedf3619",
        },
      });

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
              if (!relativePath.startsWith('.') && !relativePath.startsWith('windows')) {
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

      const fileTree = createTreeStructure(allPackages);
      setFileList({ tree: fileTree, content: fileContentMap });
    } catch (err) {
      setError((err as Error).message || "An error occurred while processing the buffer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTreeStructure = (packages: { [key: string]: string[] }) => {
    const tree: any = {};

    Object.keys(packages).forEach((packageName) => {
      const files = packages[packageName];
      const packageTree: any = {};

      files.forEach((file) => {
        const parts = file.split('/');
        let current = packageTree;

        parts.forEach((part, index) => {
          if (!current[part]) {
            current[part] = index === parts.length - 1 ? null : {};
          }
          current = current[part];
        });
      });

      tree[packageName] = packageTree;
    });

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



  const renderTree = (node: any, path: string = ''): JSX.Element[] => {
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

          {isOpen && currentNode && renderTree(currentNode, fullPath)} {/* Recursively render subdirectories */}
        </div>
      );
    });
  };

  if(loading){
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex mt-4 h-screen">
      <div
        className="overflow-x-auto overflow-y-auto max-h-screen w-1/3 p-2 border-r"
        style={{ minWidth: "200px", height: "100vh" }}
      >
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <div className="space-y-2">
          {fileList ? (
            <div className="p-2 space-y-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white">
              {renderTree(fileList.tree)}
            </div>
          ) : (
            <p>No file structure to display</p>
          )}
        </div>
      </div>

      <div
        className="overflow-x-auto overflow-y-auto max-h-screen flex-1 p-2"
        style={{ minWidth: "300px", height: "100vh" }}
      >
        <div className=" p-4 rounded-lg h-full">
          {selectedFile ? (
            <>
              <h2 className="font-bold text-lg">Selected File: {selectedFile}</h2>
              {selectedFile.endsWith(".md") ?
                <MarkdownComponent markdown={fileContent} /> :
                <SyntaxHighlighter language="dart"  style={twilight}>
                  {fileContent}
                </SyntaxHighlighter>
              }
            </>
          ) : (
            <p className="text-orange-300">Select a file to view its content</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZipViewer;
