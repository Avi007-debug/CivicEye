import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-md shadow-md mt-6">
        <h1 className="text-2xl font-semibold mb-4">User Profile</h1>
        <p>You need to be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-md shadow-md mt-6">
      <h1 className="text-2xl font-semibold mb-4">User Profile</h1>
      <div className="flex items-center space-x-6">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-full border border-gray-300"
        />
        <div>
          <p className="text-lg font-medium">{user.name}</p>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600 capitalize">{user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
