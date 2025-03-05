import React from 'react';
import { Star, Eye } from 'lucide-react';
import { Package } from '../types/package';
import { useDispatch, useSelector } from 'react-redux';
import { toggleStar } from '../store/slices/packagesSlice';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_THUMBNAIL_URL } from '../constants/api_constants';

interface PackageCardProps {
  package: Package;
}

export const PackageCard: React.FC<PackageCardProps> = ({ package: pkg }) => {
  const dispatch = useDispatch();
  const navigate=useNavigate();
  const starredPackages = useSelector((state: RootState) => state.packages.starredPackages);
  const isStarred = starredPackages.includes(pkg._id);
  const handlePackageClick = (event: React.MouseEvent<HTMLDivElement>, packageId: string) => {
    event.preventDefault();
    navigate(`/package/${packageId}`);
  };

  return (
    <div
      onClick={(event) => handlePackageClick(event, pkg._id)}
      className="bg-white hover:cursor-pointer dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
    >
      <img
        src={(pkg.thumbnail && pkg.thumbnail!="")?pkg.thumbnail:DEFAULT_THUMBNAIL_URL}
        alt={pkg.packageName}
        className="w-full h-48 object-fill"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {pkg.packageName}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(toggleStar(pkg._id));
            }}
            className={`p-1 rounded-full transition-colors ${
              isStarred
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-400 hover:text-yellow-400'
            }`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-1">
          {pkg.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <p className='text-sm text-gray-500 dark:text-gray-400'>12</p>
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex items-center space-x-1">
              <p className='text-sm text-gray-500 dark:text-gray-400'>14</p>
              <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            by {pkg.user.username}
          </span>
        </div>
      </div>
    </div>
  );
};