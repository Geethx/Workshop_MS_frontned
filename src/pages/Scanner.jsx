import { useState } from 'react';
import { transactionService, itemService } from '../services';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiAlertCircle, FiX, FiTrash2 } from 'react-icons/fi';

const Scanner = () => {
  const [manualCode, setManualCode] = useState('');
  const [action, setAction] = useState('CheckOut');
  const [notes, setNotes] = useState('');
  const [checkoutPerson, setCheckoutPerson] = useState('');
  const [projectName, setProjectName] = useState('');
  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!manualCode.trim()) {
      toast.error('Please enter an item code');
      return;
    }

    // Check if item already in list
    if (itemList.some(item => item.code === manualCode.toUpperCase())) {
      toast.warning('Item already in the list');
      setManualCode('');
      return;
    }

    setLoading(true);

    try {
      // Get item details
      const itemData = await itemService.getItemByCode(manualCode);
      const item = itemData.item;

      // Validate item status based on action
      if (action === 'CheckOut' && item.status === 'Outside') {
        toast.error(`${item.name} is already checked out`);
        setLoading(false);
        return;
      }

      if (action === 'CheckIn' && item.status === 'Inside') {
        toast.error(`${item.name} is already checked in`);
        setLoading(false);
        return;
      }

      // Add to list
      setItemList([...itemList, item]);
      toast.success(`${item.name} added to list`);
      setManualCode('');
    } catch (error) {
      const message = error.response?.data?.message || 'Item not found';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (code) => {
    setItemList(itemList.filter(item => item.code !== code));
    toast.info('Item removed from list');
  };

  const handleProcessAll = async () => {
    if (itemList.length === 0) {
      toast.error('Please add at least one item to the list');
      return;
    }

    if (action === 'CheckOut') {
      if (!checkoutPerson.trim()) {
        toast.error('Please enter checkout person name');
        return;
      }
      if (!projectName.trim()) {
        toast.error('Please enter project name');
        return;
      }
    }

    setProcessing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const item of itemList) {
        try {
          if (action === 'CheckOut') {
            await transactionService.checkOutItem(item.code, notes, checkoutPerson, projectName);
          } else {
            await transactionService.checkInItem(item.code, notes);
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to ${action} ${item.name}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully ${action === 'CheckOut' ? 'checked out' : 'checked in'} ${successCount} item(s)`);
      }

      if (failCount > 0) {
        toast.error(`Failed to process ${failCount} item(s)`);
      }

      // Clear form and list
      setItemList([]);
      setNotes('');
      setCheckoutPerson('');
      setProjectName('');
      setManualCode('');

    } catch (error) {
      toast.error('An error occurred while processing items');
    } finally {
      setProcessing(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all items from the list?')) {
      setItemList([]);
      toast.info('Item list cleared');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Check In / Check Out</h1>
        <p className="mt-2 text-gray-600">Add multiple items and process them together</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Form */}
        <div className="space-y-6">
          {/* Main Form Container */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {/* Action Selection */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Action
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setAction('CheckOut');
                      setItemList([]);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      action === 'CheckOut'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Check Out
                  </button>
                  <button
                    onClick={() => {
                      setAction('CheckIn');
                      setItemList([]);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      action === 'CheckIn'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Check In
                  </button>
                </div>
              </div>

              {/* Code Entry Form */}
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Item Code <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      placeholder="Enter item code"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={loading || !manualCode.trim()}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {loading ? 'Adding...' : 'Add Item'}
                    </button>
                  </div>
                </div>
              </form>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Items in list: <span className="font-semibold">{itemList.length}</span></p>
              </div>
            </div>
          </div>

          {/* Checkout Details - Only for CheckOut */}
          {action === 'CheckOut' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Checkout Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Checkout Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={checkoutPerson}
                    onChange={(e) => setCheckoutPerson(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter person's name"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="2"
                    placeholder="Add any notes..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Check In Notes */}
          {action === 'CheckIn' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Check In Details</h3>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="2"
                  placeholder="Add any notes..."
                ></textarea>
              </div>
            </div>
          )}

          {/* Process Button */}
          <div className="flex space-x-3">
            <button
              onClick={handleProcessAll}
              disabled={processing || itemList.length === 0}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 ${
                action === 'CheckOut'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {processing
                ? 'Processing...'
                : `${action} All Items (${itemList.length})`}
            </button>
            {itemList.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={processing}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Right Side - Item List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Item List ({itemList.length})
            </h3>
            {itemList.length > 0 && (
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                action === 'CheckOut'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {action === 'CheckOut' ? 'Checking Out' : 'Checking In'}
              </span>
            )}
          </div>

          {itemList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No items added yet</p>
              <p className="text-sm mt-2">Enter item codes to add them to the list</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {itemList.map((item, index) => (
                <div
                  key={item.code}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Code: {item.code}</p>
                      <p className="text-sm text-gray-600">Category: {item.category}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      )}
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'Inside'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          Current: {item.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.code)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;
