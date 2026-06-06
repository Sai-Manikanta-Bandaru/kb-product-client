import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';

const ScreenFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description,
        });
      } else {
        reset({
          name: '',
          description: ''
        });
      }
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? 'Edit Screen' : 'Add Screen'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter screen name"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            placeholder="Enter screen description"
            {...register('description')}
          ></textarea>
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center min-w-[100px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScreenFormModal;
