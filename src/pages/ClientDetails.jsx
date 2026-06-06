import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from '../components/ui/Table';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ScreenFormModal from '../components/screens/ScreenFormModal';
import { getClient } from '../services/clientService';
import { getScreens, createScreen, updateScreen, deleteScreen } from '../services/screenService';

const ClientDetails = () => {
  const { clientId } = useParams();
  
  // Client state
  const [client, setClient] = useState(null);
  const [isClientLoading, setIsClientLoading] = useState(true);
  
  // Screens state
  const [screens, setScreens] = useState([]);
  const [isScreensLoading, setIsScreensLoading] = useState(true);
  
  // Shared state
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // Action states
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClientDetails = useCallback(async () => {
    setIsClientLoading(true);
    try {
      const response = await getClient(clientId);
      if (response.success) {
        setClient(response.data);
      } else {
        setError(response.message || 'Failed to fetch client details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching client details.');
    } finally {
      setIsClientLoading(false);
    }
  }, [clientId]);

  const fetchScreens = useCallback(async () => {
    setIsScreensLoading(true);
    try {
      const response = await getScreens();
      if (response.success) {
        // Filter screens by clientId
        const clientScreens = response.data.filter(screen => screen.clientId === clientId);
        setScreens(clientScreens);
      } else {
        setError(response.message || 'Failed to fetch screens');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching screens.');
    } finally {
      setIsScreensLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientDetails();
    fetchScreens();
  }, [fetchClientDetails, fetchScreens]);

  // Display success message temporarily
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleAddClick = () => {
    setSelectedScreen(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (screen) => {
    setSelectedScreen(screen);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (screen) => {
    setSelectedScreen(screen);
    setIsConfirmModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (selectedScreen) {
        // Edit mode
        const response = await updateScreen(selectedScreen._id, data);
        if (response.success) {
          showSuccess(response.message || 'Screen updated successfully');
          setIsFormModalOpen(false);
          fetchScreens();
        } else {
          setError(response.message || 'Failed to update screen');
        }
      } else {
        // Add mode - automatically attach clientId
        const screenData = { ...data, clientId };
        const response = await createScreen(screenData);
        if (response.success) {
          showSuccess(response.message || 'Screen created successfully');
          setIsFormModalOpen(false);
          fetchScreens();
        } else {
          setError(response.message || 'Failed to create screen');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving the screen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedScreen) return;
    
    setIsDeleting(true);
    setError(null);
    try {
      const response = await deleteScreen(selectedScreen._id);
      if (response.success) {
        showSuccess(response.message || 'Screen deleted successfully');
        setIsConfirmModalOpen(false);
        fetchScreens();
      } else {
        setError(response.message || 'Failed to delete screen');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while deleting the screen.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { header: 'Screen Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (screen) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
          screen.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {screen.status || 'active'}
        </span>
      )
    },
    { 
      header: 'Created Date', 
      accessor: 'createdAt',
      render: (screen) => screen.createdAt ? new Date(screen.createdAt).toLocaleDateString() : '-'
    },
    {
      header: 'Actions',
      render: (screen) => (
        <div className="flex space-x-3">
          <button 
            onClick={() => handleEditClick(screen)}
            className="text-indigo-600 hover:text-indigo-900 transition font-medium"
          >
            Edit
          </button>
          <button 
            onClick={() => handleDeleteClick(screen)}
            className="text-red-600 hover:text-red-900 transition font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (isClientLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
        <Link to="/clients" className="text-indigo-600 hover:underline mt-4 inline-block">Back to Clients</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 space-x-2">
        <Link to="/clients" className="hover:text-indigo-600 transition">Clients List</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{client.name}</span>
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

      {/* Client Information Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{client.name}</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl">{client.description || 'No description provided.'}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
            client.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {client.status}
          </span>
        </div>
      </div>

      {/* Screens Section Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Screens</h2>
          <p className="text-sm text-gray-500 mt-1">Manage screens for {client.name}</p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Screen
        </button>
      </div>

      {/* Screens Table */}
      {isScreensLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <Table columns={columns} data={screens} keyField="_id" />
      )}

      {/* Modals */}
      <ScreenFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedScreen}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Screen"
        message="Are you sure you want to delete this screen? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ClientDetails;
