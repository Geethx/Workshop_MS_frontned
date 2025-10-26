import { useState, useEffect } from 'react';
import { itemService } from '../services';
import { toast } from 'react-toastify';
import { FiAlertCircle, FiUser, FiBriefcase, FiClock, FiSearch, FiImage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const CheckedOut = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const { canModify, isAdmin } = useAuth();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await itemService.getAllItems();
      
      // Filter only checked out items (status = Outside)
      const checkedOutItems = data.items.filter(item => item.status === 'Outside');
      setItems(checkedOutItems);
      
      // Get unique categories
      const uniqueCategories = [...new Set(checkedOutItems.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      toast.error('Failed to fetch checked out items');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.checkoutPerson && item.checkoutPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.projectName && item.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading checked out items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checked Out Items</h1>
          <p className="mt-2 text-gray-600">
            Items currently outside the workshop ({filteredItems.length} items)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, code, person, or project..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Checked Out Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No checked out items</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || categoryFilter ? 'No items match your filters.' : 'All items are currently inside the workshop.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Item Image */}
              {item.imageUrl ? (
                <div className="w-full h-48 overflow-hidden bg-gray-100">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(item.imageUrl, '_blank')}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <FiImage className="text-gray-300" size={48} />
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 font-mono">{item.code}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                    Outside
                  </span>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.category}
                  </span>
                </div>

                {/* Checkout Information */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  {/* Checkout Person */}
                  {item.checkoutPerson && (
                    <div className="flex items-start">
                      <FiUser className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Checkout Person</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.checkoutPerson}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Project Name */}
                  {item.projectName && (
                    <div className="flex items-start">
                      <FiBriefcase className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Project</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.projectName}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="flex items-start">
                    <FiClock className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Checked out</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(item.lastUpdated)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{filteredItems.length}</p>
              <p className="text-sm text-gray-600">Items Out</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{categories.length}</p>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-700">
                {[...new Set(filteredItems.map(item => item.projectName).filter(Boolean))].length}
              </p>
              <p className="text-sm text-gray-600">Active Projects</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckedOut;
