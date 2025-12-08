import React, { useRef, useState } from 'react';
import { mockDb } from '../services/mockDb';
import { Download, Upload, AlertTriangle, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
        const dataStr = await mockDb.exportDatabase();
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `choir_ruvumera_backup_${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    } catch (e) {
        alert("Export failed");
    } finally {
        setDownloading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = event.target?.result as string;
        if (confirm('WARNING: This will overwrite all current data. This action cannot be undone. Are you sure?')) {
          await mockDb.importDatabase(jsonContent);
          alert('Database restored successfully! The page will now reload.');
          window.location.reload();
        }
      } catch (error) {
        alert('Failed to import database. Please ensure the file is valid.');
        console.error(error);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (user?.role !== 'ADMIN') {
    return <div className="text-center py-20">You do not have permission to view this page.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Backup & Settings</h1>
        <p className="text-gray-500">Manage your data and system preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
               <Database size={24} />
             </div>
             <h2 className="text-lg font-bold text-gray-900">Database Management</h2>
           </div>
           <p className="text-sm text-gray-500">
             Export your data to keep a safe backup, or import a backup file to restore data. 
             This allows you to move data between devices.
           </p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Export Data</h3>
              <p className="text-sm text-gray-500 mb-3">
                Download a JSON file containing all songs, users, and members.
              </p>
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Download size={16} />
                Download Backup
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Import Section */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Import Data</h3>
              <p className="text-sm text-gray-500 mb-3">
                Restore data from a backup file.
              </p>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex gap-3 mb-4">
                 <AlertTriangle size={20} className="text-yellow-600 shrink-0" />
                 <p className="text-xs text-yellow-700">
                   <strong>Warning:</strong> Importing will completely replace the current database. 
                   Make sure you have a backup of the current data before proceeding.
                 </p>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".json"
                onChange={handleUpload}
                className="hidden" 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Upload size={16} />
                Upload Backup File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;