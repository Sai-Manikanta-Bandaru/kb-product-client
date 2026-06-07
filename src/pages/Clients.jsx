import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/ui/Table';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ClientFormModal from '../components/clients/ClientFormModal';
import { getClients, createClient, updateClient, deleteClient } from '../services/clientService';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Action states
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getClients();
      if (response.success) {
        setClients(response.data);
      } else {
        setError(response.message || 'Failed to fetch clients');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching clients.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Display success message temporarily
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleAddClick = () => {
    setSelectedClient(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (client) => {
    setSelectedClient(client);
    setIsConfirmModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (selectedClient) {
        // Edit mode
        const response = await updateClient(selectedClient._id, data);
        if (response.success) {
          showSuccess(response.message || 'Client updated successfully');
          setIsFormModalOpen(false);
          fetchClients();
        } else {
          setError(response.message || 'Failed to update client');
        }
      } else {
        // Add mode
        const response = await createClient(data);
        if (response.success) {
          showSuccess(response.message || 'Client created successfully');
          setIsFormModalOpen(false);
          fetchClients();
        } else {
          setError(response.message || 'Failed to create client');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving the client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedClient) return;

    setIsDeleting(true);
    setError(null);
    try {
      const response = await deleteClient(selectedClient._id);
      if (response.success) {
        showSuccess(response.message || 'Client deleted successfully');
        setIsConfirmModalOpen(false);
        fetchClients();
      } else {
        setError(response.message || 'Failed to delete client');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while deleting the client.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Status',
      accessor: 'status',
      render: (client) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${client.status === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {client.status}
        </span>
      )
    },
    {
      header: 'Created Date',
      accessor: 'createdAt',
      render: (client) => new Date(client.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      render: (client) => (
        <div className="flex space-x-3">
          <Link
            to={`/clients/${client._id}`}
            className="text-blue-600 hover:text-blue-900 transition font-medium"
          >
            View
          </Link>
          <button
            onClick={() => handleEditClick(client)}
            className="text-blue-600 hover:text-indigo-900 transition"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteClick(client)}
            className="text-red-600 hover:text-red-900 transition"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your clients and their locations</p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Client
        </button>
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

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <Table columns={columns} data={clients} keyField="_id" />
      )}

      {/* Modals */}
      <ClientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedClient}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Clients;
