import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/feature/BottomNav';

type FilterType = 'all' | 'week' | 'month';

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'bonus';
  amount: number;
  description: string;
  date: string;
  time: string;
  status: 'completed' | 'pending';
}

export default function EarningsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const availableBalance = 487.50;
  const momoNumber = '0501234567';

  const allTransactions: Transaction[] = [
    {
      id: '1',
      type: 'earning',
      amount: 25.00,
      description: 'Trip to Osu Oxford Street',
      date: '2024-01-15',
      time: '09:30 AM',
      status: 'completed'
    },
    {
      id: '2',
      type: 'earning',
      amount: 32.50,
      description: 'Trip to East Legon',
      date: '2024-01-15',
      time: '11:45 AM',
      status: 'completed'
    },
    {
      id: '3',
      type: 'bonus',
      amount: 15.00,
      description: 'Peak hour bonus',
      date: '2024-01-15',
      time: '02:00 PM',
      status: 'completed'
    },
    {
      id: '4',
      type: 'earning',
      amount: 28.00,
      description: 'Trip to Labone',
      date: '2024-01-15',
      time: '02:15 PM',
      status: 'completed'
    },
    {
      id: '5',
      type: 'withdrawal',
      amount: -200.00,
      description: 'Withdrawal to MTN Mobile Money',
      date: '2024-01-14',
      time: '06:30 PM',
      status: 'completed'
    },
    {
      id: '6',
      type: 'earning',
      amount: 30.00,
      description: 'Trip to Airport Residential',
      date: '2024-01-14',
      time: '10:20 AM',
      status: 'completed'
    },
    {
      id: '7',
      type: 'bonus',
      amount: 20.00,
      description: 'Weekly performance bonus',
      date: '2024-01-14',
      time: '11:59 PM',
      status: 'completed'
    },
    {
      id: '8',
      type: 'earning',
      amount: 35.00,
      description: 'Trip to Cantonments',
      date: '2024-01-14',
      time: '03:45 PM',
      status: 'completed'
    }
  ];

  const filterTransactions = () => {
    const today = new Date();
    let filtered = allTransactions;

    if (activeFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(tx => new Date(tx.date) >= weekAgo);
    } else if (activeFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(tx => new Date(tx.date) >= monthAgo);
    }

    return filtered;
  };

  const filteredTransactions = filterTransactions();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!withdrawAmount || withdrawAmount.trim() === '') {
      alert('Please enter an amount');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > availableBalance) {
      alert(`Insufficient balance. Available: GH₵ ${availableBalance.toFixed(2)}`);
      return;
    }

    if (amount < 10) {
      alert('Minimum withdrawal amount is GH₵ 10.00');
      return;
    }

    if (amount > 5000) {
      alert('Maximum withdrawal amount is GH₵ 5,000.00 per transaction');
      return;
    }

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowWithdrawModal(false);
      setShowSuccess(true);
      setWithdrawAmount('');

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 2000);
  };

  const setQuickAmount = (amount: number) => {
    setWithdrawAmount(amount.toString());
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24">
        {/* Header */}
        <div className="bg-emerald-600 text-white px-4 py-4 fixed top-0 w-full z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg">Earnings</h1>
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center"
            >
              <i className="ri-home-5-line text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-20 px-4">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-6 mb-4 text-white mt-4">
            <p className="text-sm text-emerald-100 mb-2">Available Balance</p>
            <p className="text-4xl font-bold mb-4">GH₵ {availableBalance.toFixed(2)}</p>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full bg-white text-emerald-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <i className="ri-bank-card-line text-xl"></i>
              Withdraw to Mobile Money
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">GH₵ 285</p>
              <p className="text-xs text-gray-500 mt-1">This Week</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">24</p>
              <p className="text-xs text-gray-500 mt-1">Trips</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">GH₵ 35</p>
              <p className="text-xs text-gray-500 mt-1">Bonuses</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md p-1 mb-4 grid grid-cols-3 gap-1">
            {(['all', 'week', 'month'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600'
                }`}
              >
                {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-2xl shadow-md p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Transaction History</h3>
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'earning' ? 'bg-emerald-100' :
                    transaction.type === 'bonus' ? 'bg-amber-100' :
                    'bg-blue-100'
                  }`}>
                    <i className={`text-xl ${
                      transaction.type === 'earning' ? 'ri-arrow-down-line text-emerald-600' :
                      transaction.type === 'bonus' ? 'ri-gift-line text-amber-600' :
                      'ri-arrow-up-line text-blue-600'
                    }`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(transaction.date)} • {transaction.time}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      transaction.amount > 0 ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}GH₵ {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
            <div className="bg-white rounded-t-3xl w-full max-w-md animate-slide-up">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Withdraw Funds</h2>
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
                  >
                    <i className="ri-close-line text-xl text-gray-600"></i>
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Withdraw to</p>
                  <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                      <i className="ri-smartphone-line text-white text-xl"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">MTN Mobile Money</p>
                      <p className="text-sm text-gray-600">{momoNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm text-gray-600 mb-2 block">Amount (GH₵)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold text-gray-800 focus:outline-none focus:border-emerald-600"
                  />
                  <p className="text-xs text-gray-500 mt-2">Available: GH₵ {availableBalance.toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[50, 100, 200, 300].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setQuickAmount(amount)}
                      className="bg-gray-100 rounded-lg py-2 text-sm font-medium text-gray-700 active:scale-95 transition-transform"
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-xl"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="ri-check-line text-xl"></i>
                      Confirm Withdrawal
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  Minimum withdrawal: GH₵ 10.00 • Processing time: Instant
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-20 left-4 right-4 z-50 animate-slide-down">
            <div className="bg-emerald-600 text-white rounded-xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="ri-checkbox-circle-fill text-2xl"></i>
              </div>
              <div>
                <p className="font-semibold">Withdrawal Successful!</p>
                <p className="text-sm text-emerald-100">Funds sent to your Mobile Money</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
