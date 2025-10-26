import { useState, useEffect } from 'react';
import { itemService } from '../services';
import { FiPackage, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await itemService.getDashboardStats();
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Items',
      value: stats?.totalItems || 0,
      icon: FiPackage,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Items Inside',
      value: stats?.insideItems || 0,
      icon: FiCheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Items Outside',
      value: stats?.outsideItems || 0,
      icon: FiXCircle,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      title: 'Recent Activity',
      value: stats?.recentTransactions?.length || 0,
      icon: FiTrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of workshop inventory</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="p-6">
          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTransactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {transaction.itemName || transaction.item?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction.userName || transaction.user?.name} •{' '}
                      {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      transaction.action === 'CheckIn'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {transaction.action === 'CheckIn' ? 'Checked In' : 'Checked Out'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No recent transactions</p>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {stats?.categoryStats && stats.categoryStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Items by Category</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {stats.categoryStats.map((cat, index) => (
                <div key={index} className="p-4 text-center border border-gray-200 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">{cat.count}</p>
                  <p className="mt-1 text-sm text-gray-600">{cat._id || 'General'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
