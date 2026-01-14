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
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/colors';
import { Toast } from '../../components/common/Toast';

type RootStackParamList = {
  MainTabs: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

type TabType = 'contact' | 'faq';

export default function SupportPage() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('contact');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    issue: 'payment',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I accept a pickup request?',
      answer:
        "When you receive a new pickup request, you'll see a notification with trip details. Review the information and tap 'Accept' within 15 seconds to confirm the trip.",
    },
    {
      question: 'How long does it take to receive my earnings?',
      answer:
        'Withdrawals to Mobile Money are processed instantly. You can withdraw your available balance anytime from the Earnings page.',
    },
    {
      question: 'What should I do if the customer is not available?',
      answer:
        "Try calling or messaging the customer through the app. If they don't respond after 10 minutes, contact support and we'll help resolve the issue.",
    },
    {
      question: 'How is my fare calculated?',
      answer:
        'Fares are calculated based on distance, waste type, and current demand. You\'ll see the estimated fare before accepting any trip.',
    },
    {
      question: 'Can I cancel a trip after accepting?',
      answer:
        'Trip cancellations should be avoided as they affect your rating. If you must cancel due to an emergency, contact support immediately.',
    },
    {
      question: 'How do I update my vehicle information?',
      answer:
        'Go to your Profile, tap on Verification Status, and you can update your tricycle registration and insurance documents.',
    },
    {
      question: 'What are the peak hours for bonuses?',
      answer:
        'Peak hours are typically 7-9 AM and 5-7 PM on weekdays. Complete trips during these times to earn bonus payments.',
    },
    {
      question: 'How do I improve my rating?',
      answer:
        'Maintain professionalism, arrive on time, handle waste carefully, and communicate clearly with customers. High ratings lead to more trip requests.',
    },
  ];

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.name.trim().length < 2) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }

    if (formData.phone.trim().length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (formData.description.trim().length < 10) {
      Alert.alert('Error', 'Please provide more details (at least 10 characters)');
      return;
    }

    if (formData.description.length > 500) {
      Alert.alert('Error', 'Description must be 500 characters or less');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'https://readdy.ai/api/form/d4iau6qjg2jl50j1sbsg',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            name: formData.name,
            phone: formData.phone,
            issue: formData.issue,
            description: formData.description,
          } as any).toString(),
        }
      );

      if (response.ok) {
        setShowSuccess(true);
        setFormData({
          name: '',
          phone: '',
          issue: 'payment',
          description: '',
        });

        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        Alert.alert('Error', 'Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      Alert.alert('Error', 'An error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Contact */}
        <LinearGradient
          colors={['#ef4444', '#dc2626']}
          style={styles.emergencyCard}
        >
          <View style={styles.emergencyHeader}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="call" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.emergencyLabel}>Emergency Hotline</Text>
              <Text style={styles.emergencyNumber}>+233 50 123 4567</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:+233501234567')}
            style={styles.emergencyButton}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={18} color="#ef4444" />
            <Text style={styles.emergencyButtonText}>Call Now</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('contact')}
            style={[
              styles.tabButton,
              activeTab === 'contact' && styles.tabButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'contact' && styles.tabButtonTextActive,
              ]}
            >
              Contact Support
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('faq')}
            style={[
              styles.tabButton,
              activeTab === 'faq' && styles.tabButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'faq' && styles.tabButtonTextActive,
              ]}
            >
              FAQs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Form */}
        {activeTab === 'contact' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Report an Issue</Text>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your Name *</Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="Enter your full name"
                  style={styles.input}
                  placeholderTextColor={colors.text.light}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  placeholder="0501234567"
                  keyboardType="phone-pad"
                  style={styles.input}
                  placeholderTextColor={colors.text.light}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Issue Type *</Text>
                <View style={styles.select}>
                  <Text style={styles.selectText}>
                    {formData.issue === 'payment'
                      ? 'Payment Issue'
                      : formData.issue === 'trip'
                      ? 'Trip Problem'
                      : formData.issue === 'customer'
                      ? 'Customer Issue'
                      : formData.issue === 'app'
                      ? 'App Technical Issue'
                      : formData.issue === 'account'
                      ? 'Account Problem'
                      : 'Other'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Description * (Max 500 characters)
                </Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="Please describe your issue in detail..."
                  multiline
                  numberOfLines={5}
                  maxLength={500}
                  style={[styles.input, styles.textArea]}
                  placeholderTextColor={colors.text.light}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {formData.description.length}/500 characters
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.submitButtonText}>Submitting...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#ffffff" />
                    <Text style={styles.submitButtonText}>Submit Report</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* FAQs */}
        {activeTab === 'faq' && (
          <View style={styles.faqsContainer}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  onPress={() => toggleFaq(index)}
                  style={styles.faqHeader}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion} numberOfLines={2}>
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={
                      expandedFaq === index
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={20}
                    color={colors.text.light}
                  />
                </TouchableOpacity>
                {expandedFaq === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Other Ways to Reach Us</Text>
          <View style={styles.contactInfo}>
            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:support@borlawura.com')}
              style={styles.contactItem}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIcon, { backgroundColor: colors.blue[100] }]}>
                <Ionicons name="mail-outline" size={20} color={colors.blue[600]} />
              </View>
              <View>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>support@borlawura.com</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://wa.me/233501234567')}
              style={styles.contactItem}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="logo-whatsapp" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.contactLabel}>WhatsApp</Text>
                <Text style={styles.contactValue}>+233 50 123 4567</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.hoursCard}>
          <View style={styles.hoursIcon}>
            <Ionicons name="time-outline" size={18} color={colors.blue[600]} />
          </View>
          <View style={styles.hoursContent}>
            <Text style={styles.hoursTitle}>Support Hours</Text>
            <Text style={styles.hoursText}>
              Monday - Sunday: 6:00 AM - 10:00 PM
            </Text>
            <Text style={styles.hoursText}>
              Emergency hotline available 24/7
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Success Toast */}
      <Toast
        visible={showSuccess}
        message="Report Submitted!"
        subtitle="We'll get back to you soon"
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
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  emergencyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  emergencyNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emergencyButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emergencyButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
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
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  input: {
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  select: {
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  submitButton: {
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
    paddingRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  hoursCard: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[100],
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  hoursIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.blue[100],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  hoursContent: {
    flex: 1,
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  hoursText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
});







