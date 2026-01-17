import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/colors';
import { BottomModal } from '../../components/common/BottomModal';
import { Toast } from '../../components/common/Toast';
import { fetchTransactions } from '../../lib/api';

type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
  const navigation = useNavigation<NavigationProp>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const availableBalance = 487.50;
  const momoNumber = '0501234567';

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await fetchTransactions();
      // @ts-ignore - mismatch in type string literal
      setAllTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

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
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > availableBalance) {
      Alert.alert('Error', `Insufficient balance. Available: GH₵ ${availableBalance.toFixed(2)}`);
      return;
    }

    if (amount < 10) {
      Alert.alert('Error', 'Minimum withdrawal amount is GH₵ 10.00');
      return;
    }

    if (amount > 5000) {
      Alert.alert('Error', 'Maximum withdrawal amount is GH₵ 5,000.00 per transaction');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setShowWithdrawModal(false);
      setShowSuccess(true);
      setWithdrawAmount('');

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 2000);
  };

  const setQuickAmount = (amount: number) => {
    setWithdrawAmount(amount.toString());
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const iconName =
      item.type === 'earning'
        ? 'arrow-down'
        : item.type === 'bonus'
          ? 'gift'
          : 'arrow-up';

    const iconColor =
      item.type === 'earning'
        ? colors.primary
        : item.type === 'bonus'
          ? colors.amber[600]
          : colors.blue[600];

    const bgColor =
      item.type === 'earning'
        ? colors.primaryLight
        : item.type === 'bonus'
          ? colors.amber[100]
          : colors.blue[100];

    return (
      <View style={styles.transactionItem}>
        <View style={[styles.transactionIcon, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName as any} size={20} color={iconColor} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.date)} • {item.time}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.amount > 0 ? colors.primary : colors.blue[600] },
          ]}
        >
          {item.amount > 0 ? '+' : ''}GH₵ {Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.homeButton}
          >
            <Ionicons name="home-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            GH₵ {availableBalance.toFixed(2)}
          </Text>
          <TouchableOpacity
            onPress={() => setShowWithdrawModal(true)}
            style={styles.withdrawButton}
            activeOpacity={0.8}
          >
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <Text style={styles.withdrawButtonText}>Withdraw to Mobile Money</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>GH₵ 285</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.amber[500] }]}>GH₵ 35</Text>
            <Text style={styles.statLabel}>Bonuses</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'week', 'month'] as FilterType[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsCard}>
          <Text style={styles.transactionsTitle}>Transaction History</Text>
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.transactionSeparator} />}
          />
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <BottomModal
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Withdraw Funds</Text>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Withdraw to</Text>
            <View style={styles.momoCard}>
              <View style={styles.momoIcon}>
                <Ionicons name="phone-portrait-outline" size={20} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.momoProvider}>MTN Mobile Money</Text>
                <Text style={styles.momoNumber}>{momoNumber}</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Amount (GH₵)</Text>
            <TextInput
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.amountInput}
            />
            <Text style={styles.availableText}>
              Available: GH₵ {availableBalance.toFixed(2)}
            </Text>
          </View>

          <View style={styles.quickAmounts}>
            {[50, 100, 200, 300].map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => setQuickAmount(amount)}
                style={styles.quickAmountButton}
                activeOpacity={0.7}
              >
                <Text style={styles.quickAmountText}>{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleWithdraw}
            disabled={isProcessing}
            style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.confirmButtonText}>Processing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.confirmButtonText}>Confirm Withdrawal</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.modalNote}>
            Minimum withdrawal: GH₵ 10.00 • Processing time: Instant
          </Text>
        </View>
      </BottomModal>

      {/* Success Toast */}
      <Toast
        visible={showSuccess}
        message="Withdrawal Successful!"
        subtitle="Funds sent to your Mobile Money"
        type="success"
        onHide={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLighter,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  homeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  withdrawButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  withdrawButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  transactionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionSeparator: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginBottom: 12,
  },
  modalContent: {
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 24,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  momoCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  momoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  momoProvider: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  momoNumber: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  amountInput: {
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  availableText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalNote: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
});







