import { h } from 'preact';

const ProfilePage = ({ user }) => {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-xl font-medium text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{user?.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
            <p className="mt-1 text-xs text-gray-400 capitalize">{user?.role}</p>
            
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                This page will contain profile management functionality including:
              </p>
              <ul className="mt-4 text-sm text-gray-500 space-y-1">
                <li>• Update personal information and contact details</li>
                <li>• Change password and security settings</li>
                <li>• Manage notification preferences</li>
                <li>• View account activity and login history</li>
                <li>• Upload and manage profile picture</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
