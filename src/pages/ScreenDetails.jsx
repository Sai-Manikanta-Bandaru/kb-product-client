import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from '../components/ui/Table';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ContentFormModal from '../components/contents/ContentFormModal';
import { getClient } from '../services/clientService';
import { getScreen } from '../services/screenService';
import { getScreenContents, uploadContent, activateContent, deleteContent } from '../services/contentService';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ScreenDetails = () => {
  const { clientId, screenId } = useParams();

  // States
  const [client, setClient] = useState(null);
  const [screen, setScreen] = useState(null);
  const [contents, setContents] = useState([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isContentsLoading, setIsContentsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Actions
  const [selectedContent, setSelectedContent] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInitialData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [clientRes, screenRes] = await Promise.all([
        getClient(clientId),
        getScreen(screenId)
      ]);

      if (clientRes.success && screenRes.success) {
        setClient(clientRes.data);
        setScreen(screenRes.data);
      } else {
        setError('Failed to fetch client or screen details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching details.');
    } finally {
      setIsLoadingData(false);
    }
  }, [clientId, screenId]);

  const fetchContents = useCallback(async () => {
    setIsContentsLoading(true);
    try {
      const response = await getScreenContents(screenId);
      if (response.success) {
        setContents(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch contents');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching contents.');
    } finally {
      setIsContentsLoading(false);
    }
  }, [screenId]);

  useEffect(() => {
    fetchInitialData();
    fetchContents();
  }, [fetchInitialData, fetchContents]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleCopyUrl = () => {
    if (client && screen) {
      const url = `${window.location.origin}/player?clientSlug=${client.slug}&screenSlug=${screen.slug}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  const handleUploadSubmit = async (formData) => {
    setIsUploading(true);
    setError(null);
    try {
      const response = await uploadContent(formData);
      if (response.success) {
        showSuccess(response.message || 'Content uploaded successfully');
        setIsUploadModalOpen(false);
        fetchContents();
      } else {
        setError(response.message || 'Failed to upload content');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while uploading content.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleActivateClick = async (content) => {
    setIsActivating(true);
    setError(null);
    try {
      const response = await activateContent(content._id);
      if (response.success) {
        showSuccess(response.message || 'Content activated successfully');
        fetchContents();
      } else {
        setError(response.message || 'Failed to activate content');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while activating content.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeleteClick = (content) => {
    setSelectedContent(content);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContent) return;

    setIsDeleting(true);
    setError(null);
    try {
      const response = await deleteContent(selectedContent._id);
      if (response.success) {
        showSuccess(response.message || 'Content deleted successfully');
        setIsConfirmModalOpen(false);
        fetchContents();
      } else {
        setError(response.message || 'Failed to delete content');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while deleting content.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Preview',
      render: (content) => {
        const mediaUrl = `https://kb-product-server.onrender.com/${content.filePath}`;
        if (content.mediaType === 'video') {
          return (
            <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
              <video src={mediaUrl} className="w-full h-full object-cover" controls={false} muted />
            </div>
          );
        }
        return (
          <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
            <img src={mediaUrl} alt={content.fileName} className="w-full h-full object-cover" />
          </div>
        );
      }
    },
    { header: 'File Name', accessor: 'originalFileName' },
    { header: 'Media Type', accessor: 'mediaType', render: (content) => <span className="capitalize">{content.mediaType}</span> },
    { header: 'File Size', render: (content) => formatFileSize(content.fileSize) },
    {
      header: 'Active Status',
      accessor: 'isActive',
      render: (content) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${content.isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {content.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Uploaded Date',
      accessor: 'createdAt',
      render: (content) => content.createdAt ? new Date(content.createdAt).toLocaleDateString() : '-'
    },
    {
      header: 'Actions',
      render: (content) => (
        <div className="flex space-x-3 items-center">
          {!content.isActive && (
            <button
              onClick={() => handleActivateClick(content)}
              disabled={isActivating}
              className="text-green-600 hover:text-green-900 transition font-medium disabled:opacity-50"
            >
              Activate
            </button>
          )}
          <button
            onClick={() => handleDeleteClick(content)}
            className="text-red-600 hover:text-red-900 transition font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!client || !screen) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Details not found</h2>
        <Link to={`/clients/${clientId}`} className="text-blue-600 hover:underline mt-4 inline-block">Back to Client</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 space-x-2">
        <Link to="/clients" className="hover:text-blue-600 transition">Clients</Link>
        <span>/</span>
        <Link to={`/clients/${clientId}`} className="hover:text-blue-600 transition">{client.name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{screen.name}</span>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Screen Information Card with Live Preview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{screen.name}</h1>
              {screen.description && <p className="text-sm text-gray-500 mt-1">{screen.description}</p>}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${screen.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
              }`}>
              {screen.status}
            </span>
          </div>

          {/* Live Player Preview */}
          <div className="flex-1 bg-black rounded-lg overflow-hidden border border-gray-800 min-h-[240px] relative">
            <iframe
              src={`${window.location.origin}/player?clientSlug=${client.slug}&screenSlug=${screen.slug}`}
              className="absolute top-0 left-0 w-full h-full border-0 pointer-events-none"
              title="Live Screen Preview"
            />
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <span className="font-medium">Slug:</span> {screen.slug}
          </div>
        </div>

        {/* Player URL Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-2">Player URL</h2>
            <p className="text-sm text-gray-500 mb-4">Use this URL to display content on the screen.</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 break-all text-sm font-mono text-gray-700">
              {`${window.location.origin}/player?clientSlug=${client.slug}&screenSlug=${screen.slug}`}
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleCopyUrl}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copySuccess ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
        </div>
      </div>

      {/* Content Section Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Content Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage media content for {screen.name}</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Upload Content
        </button>
      </div>

      {/* Content Table */}
      {isContentsLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <Table columns={columns} data={contents} keyField="_id" />
      )}

      {/* Modals */}
      <ContentFormModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
        isLoading={isUploading}
        screenId={screenId}
      />

      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Content"
        message="Are you sure you want to delete this content? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ScreenDetails;
