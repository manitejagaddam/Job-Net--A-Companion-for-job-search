import React, { useState } from 'react';
import { aiAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import JobCard from '../components/JobCard';

const AI = () => {
  const [activeTab, setActiveTab] = useState('extract');
  const [text, setText] = useState('');
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();

  const handleExtractSkills = async () => {
    if (!text.trim()) {
      setError('Please enter some text to extract skills from');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await aiAPI.extractSkills(text);
      setExtractedSkills(response.data.skills);
      setSuccess(`Successfully extracted ${response.data.count} skills!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to extract skills');
      console.error('Error extracting skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkills = async () => {
    if (!user) {
      setError('Please log in to update your skills');
      return;
    }

    if (!text.trim()) {
      setError('Please enter some text to extract skills from');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await aiAPI.updateSkillsFromText(text);
      setExtractedSkills(response.data.skills);
      setSuccess('Skills updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update skills');
      console.error('Error updating skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!user) {
      setError('Please log in to get job recommendations');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await aiAPI.getRecommendations({ limit: 5 });
      setRecommendations(response.data.recommendations);
      setSuccess('Found job recommendations for you!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to get recommendations');
      console.error('Error getting recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'extract', name: 'Skill Extraction', icon: '🔍' },
    { id: 'recommendations', name: 'Job Recommendations', icon: '💡' },
    { id: 'matching', name: 'Smart Matching', icon: '🎯' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Tools
        </h1>
        <p className="text-gray-600">
          Leverage artificial intelligence to enhance your job search and career development
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Skill Extraction Tab */}
      {activeTab === 'extract' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Extract Skills from Text
          </h2>
          <p className="text-gray-600 mb-6">
            Paste your resume, bio, or any text to automatically extract relevant skills using AI.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your text
              </label>
              <textarea
                id="text"
                rows="6"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Paste your resume, bio, or any text here..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleExtractSkills}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Extracting...' : 'Extract Skills'}
              </button>
              
              {user && (
                <button
                  onClick={handleUpdateSkills}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update My Skills'}
                </button>
              )}
            </div>

            {extractedSkills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Extracted Skills ({extractedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            AI Job Recommendations
          </h2>
          <p className="text-gray-600 mb-6">
            Get personalized job recommendations based on your skills and profile.
          </p>

          {!user ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🔐</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Login Required
              </h3>
              <p className="text-gray-600 mb-4">
                Please log in to get personalized job recommendations.
              </p>
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium">
                Login
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={handleGetRecommendations}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 mb-6"
              >
                {loading ? 'Finding Recommendations...' : 'Get Recommendations'}
              </button>

              {recommendations.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recommended Jobs for You
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recommendations.map((rec) => (
                      <div key={rec.job._id} className="relative">
                        <JobCard job={rec.job} />
                        <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          {rec.matchScore.toFixed(1)}% Match
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Smart Matching Tab */}
      {activeTab === 'matching' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Smart Job Matching
          </h2>
          <p className="text-gray-600 mb-6">
            Understand how our AI calculates job-candidate compatibility scores.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">
                How It Works
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Analyzes your skills against job requirements</li>
                <li>• Uses advanced NLP to understand context</li>
                <li>• Calculates similarity scores using AI algorithms</li>
                <li>• Considers skill overlap and relevance</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-900 mb-3">
                Benefits
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Find jobs that match your skills perfectly</li>
                <li>• Save time by focusing on relevant opportunities</li>
                <li>• Discover roles you might not have considered</li>
                <li>• Improve your application success rate</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Tips for Better Matching
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium mb-2">For Job Seekers:</h4>
                <ul className="space-y-1">
                  <li>• Keep your skills up to date</li>
                  <li>• Include both technical and soft skills</li>
                  <li>• Add relevant certifications</li>
                  <li>• Update your bio regularly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">For Employers:</h4>
                <ul className="space-y-1">
                  <li>• Be specific about required skills</li>
                  <li>• Include both must-have and nice-to-have skills</li>
                  <li>• Use clear, descriptive job titles</li>
                  <li>• Provide detailed job descriptions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AI; 