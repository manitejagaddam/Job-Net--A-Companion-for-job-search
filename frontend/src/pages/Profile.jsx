import React, { useState, useEffect } from 'react';
import { profileAPI, jobsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useMetaMask } from '../hooks/useMetaMask';
import JobCard from '../components/JobCard';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [userJobs, setUserJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  
  const { user, updateUser } = useAuth();
  const { account, isConnected, connectWallet } = useMetaMask();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserJobs();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const userData = response.data?.user || response.data || null;
      setProfile(userData);
      setEditForm({
        name: userData?.name || '',
        bio: userData?.bio || '',
        linkedin: userData?.linkedin || '',
        skills: userData?.skills || []
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserJobs = async () => {
    try {
      const response = await jobsAPI.getUserJobs();
      const jobs = response.data?.jobs || response.data || [];
      setUserJobs(Array.isArray(jobs) ? jobs : []);
    } catch (err) {
      console.error('Error fetching user jobs:', err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'skills') {
      // Handle skills as comma-separated string
      setEditForm(prev => ({
        ...prev,
        skills: value.split(',').map(s => s.trim()).filter(s => s)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.updateProfile(editForm);
      const updated = response.data?.user || response.data || null;
      setProfile(updated);
      updateUser(updated);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const result = await connectWallet();
      if (result.success && result.account) {
        await profileAPI.connectWallet(result.account);
        fetchProfile(); // Refresh profile to get updated wallet
        setSuccess('Wallet connected successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to connect wallet');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsAPI.deleteJob(jobId);
        setUserJobs(prev => prev.filter(job => job.id !== jobId));
        setSuccess('Job deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete job');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Profile
        </h1>
        <p className="text-gray-600">
          Manage your profile, skills, and job postings
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={editForm.bio}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={editForm.linkedin}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={editForm.skills.join(', ')}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name</span>
                  <p className="text-gray-900">{profile.name}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Email</span>
                  <p className="text-gray-900">{profile.email}</p>
                </div>

                {profile.bio && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Bio</span>
                    <p className="text-gray-900">{profile.bio}</p>
                  </div>
                )}

                {profile.linkedin && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">LinkedIn</span>
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {profile.linkedin}
                    </a>
                  </div>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Skills</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-500">Wallet</span>
                  {profile.wallet ? (
                    <p className="text-gray-900 font-mono text-sm">
                      {profile.wallet}
                    </p>
                  ) : (
                    <div className="mt-2">
                      <p className="text-gray-500 text-sm mb-2">
                        Connect your wallet to enable blockchain features
                      </p>
                      <button
                        onClick={handleConnectWallet}
                        disabled={!isConnected}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Postings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Your Job Postings ({userJobs.length})
            </h2>

            {userJobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">💼</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No job postings yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start posting jobs to find the perfect candidates for your team.
                </p>
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium">
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {userJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <p className="text-gray-600">
                          Posted on {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-primary-600">
                          ${Number(job.salary).toLocaleString()}
                        </span>
                        {job.location && (
                          <span className="text-gray-600">📍 {job.location}</span>
                        )}
                      </div>
                      
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-gray-500 text-xs">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 