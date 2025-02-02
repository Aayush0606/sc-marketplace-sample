import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Eye, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { PackageCard } from '../components/PackageCard';
import { Tabs, TabsData } from '../components/Tabs';
import { Package } from '../types/package';
import network_service from '../utils/network_service';

export const PackageDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [packageDetails, setPackageDetails] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  const { items } = useSelector((state: RootState) => state.packages);
  const relatedPackage = items.slice(0, 3);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      const localPackage = items.find((p) => p._id === id);
      if (localPackage) {
        setPackageDetails(localPackage);
        setLoading(false);
        return;
      }

      try {
        const response = await network_service.get<any>({ url: '/package/all' });
        const foundPackage = response.data.packages.find((p: Package) => p._id === id);
        setPackageDetails(foundPackage || null);
      } catch (error) {
        console.error('Error fetching packages:', error);
        setPackageDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [id, items]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900">
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Loading package details...
        </p>
      </div>
    );
  }

  if (!packageDetails) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          No such package exists.
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
          Please check the package ID or try again later.
        </p>
      </div>
    );
  }

  const tabsData: TabsData = Object.entries(packageDetails.availableMarkdowns).reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {} as TabsData
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {packageDetails.packageName}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {packageDetails.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mr-2">12</p>
                <Star className="w-5 h-5 text-yellow-400 mr-1" />
              </div>
              <div className="flex items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mr-2">14</p>
                <Eye className="w-5 h-5 text-gray-500 mr-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <Tabs tabsData={tabsData} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Author info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                About the Author
              </h3>
              <div className="flex items-center mb-4">
                <img
                  src={`https://robohash.org/${packageDetails.user.username}?set=set3`}
                  alt={packageDetails.user.username}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {packageDetails.user.username}
                  </h4>
                  <p className="text-sm text-gray-500">Package Developer</p>
                </div>
              </div>
            </div>

            {/* Document URLs */}
            {packageDetails.documentUrls && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Resource Links
                </h3>
                <ul className="space-y-3">
                  {packageDetails.documentUrls.map((url) => {
                    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
                    const displayUrl = new URL(normalizedUrl).hostname + new URL(normalizedUrl).pathname;

                    return (
                      <li key={normalizedUrl}>
                        <a
                          href={normalizedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-300"
                        >
                          <span>{displayUrl}</span>
                        </a>
                      </li>
                    );
                  })}

                </ul>
              </div>
            )}

            {/* Related packages */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                You May Also Like
              </h3>
              <div className="space-y-4">
                {relatedPackage.map((pkg) => (
                  <PackageCard key={pkg._id} package={pkg} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
