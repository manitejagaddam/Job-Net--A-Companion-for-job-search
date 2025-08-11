import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const JobCard = ({ job }) => {
  const { user } = useAuth();

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {job.title}
          </h3>
          <p className="text-gray-600 mb-2">
            Posted by {job.postedBy?.name || 'Anonymous'}
          </p>
          <p className="text-sm text-gray-500">
            {formatDate(job.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary-600">
            {formatSalary(job.salary)}
          </span>
          <p className="text-sm text-gray-500">per year</p>
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">
        {job.description}
      </p>

      {job.location && (
        <p className="text-gray-600 mb-4">
          📍 {job.location}
        </p>
      )}

      {job.skills && job.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <Link
          to={`/jobs/${job._id}`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View Details →
        </Link>
        
        {user && (
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard; 