import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function SupportPage() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) {
      Alert.alert('Error', 'Please provide a subject and message.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user?.id,
        subject,
        message,
        status: 'open',
      });
      if (error) throw error;
      Alert.alert('Success', 'Your support ticket has been submitted.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not submit ticket.');
    } catch (error: any) {
      console.error('Supabase Catch Error:', error);
      Alert.alert('Error', `An error occurred: ${error?.message || 'Please try again.'}`);

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Emergency Call Box */}
        <View style={styles.emergencyContainer}>
          <View style={styles.emergencyLeft}>
             <View style={styles.emergencyIconWrapper}>
                <Ionicons name="warning" size={24} color="#EF4444" />
             </View>
             <View>
                <Text style={styles.emergencyTitle}>Emergency Hotline</Text>
                <Text style={styles.emergencySub}>Available 24/7 for critical issues</Text>
             </View>
          </View>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => Linking.openURL('tel:0502209940')}
          >
             <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        </View>

        {/* Segmented Controls (Tabs) */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
             style={[styles.segment, activeTab === 'contact' && styles.segmentActive]}
             onPress={() => setActiveTab('contact')}
          >
             <Text style={[styles.segmentText, activeTab === 'contact' && styles.segmentTextActive]}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity 
             style={[styles.segment, activeTab === 'faq' && styles.segmentActive]}
             onPress={() => setActiveTab('faq')}
          >
             <Text style={[styles.segmentText, activeTab === 'faq' && styles.segmentTextActive]}>FAQs</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'contact' && (
          <View style={styles.tabContent}>
             <Text style={styles.sectionHeader}>SEND US A MESSAGE</Text>
             <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                   <Text style={styles.inputLabel}>Full Name</Text>
                   <TextInput style={styles.inputField} placeholder="Kofi Mensah" value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
                </View>
                <View style={styles.inputGroup}>
                   <Text style={styles.inputLabel}>Phone Number</Text>
                   <TextInput style={styles.inputField} placeholder="050 123 4567" keyboardType="phone-pad" value={formData.phone} onChangeText={t => setFormData({...formData, phone: t})} />
                </View>
                <View style={styles.inputGroup}>
                   <Text style={styles.inputLabel}>Issue Category</Text>
                   <TouchableOpacity 
                      style={styles.selectField} 
                      onPress={() => setShowCategoryModal(true)}
                      activeOpacity={0.7}
                   >
                      <Text style={styles.selectText}>
                        {issueCategories.find(c => c.id === formData.issue)?.label || 'Select Category'}
                      </Text>
                      <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
                   </TouchableOpacity>
                </View>
                <View style={styles.inputGroup}>
                   <Text style={styles.inputLabel}>Description</Text>
                   <TextInput 
                     style={[styles.inputField, styles.textArea]} 
                     placeholder="Please describe your issue in detail..." 
                     multiline 
                     numberOfLines={4}
                     value={formData.description} 
                     onChangeText={t => setFormData({...formData, description: t})}
                     textAlignVertical="top" 
                   />
                </View>
                <TouchableOpacity 
                  style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Ticket</Text>
                  )}
                </TouchableOpacity>
             </View>

             <Text style={styles.sectionHeader}>DIRECT CHANNELS</Text>
             <View style={styles.channelsCard}>
                <TouchableOpacity style={styles.channelRow} onPress={() => Linking.openURL('mailto:borlawuraapp@gmail.com')}>
                   <View style={styles.channelIconBox}><Ionicons name="mail" size={20} color={colors.primary} /></View>
                   <Text style={styles.channelText}>borlawuraapp@gmail.com</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.channelRow} onPress={() => Linking.openURL('https://wa.me/233502209940')}>
                   <View style={[styles.channelIconBox, {backgroundColor: '#D1FAE5'}]}><Ionicons name="logo-whatsapp" size={20} color="#059669" /></View>
                   <Text style={styles.channelText}>0502209940</Text>
                </TouchableOpacity>
             </View>
          </View>
        )}

        {activeTab === 'faq' && (
          <View style={styles.tabContent}>
             <Text style={styles.sectionHeader}>FREQUENTLY ASKED QUESTIONS</Text>
             <View style={styles.faqWrapper}>
                {faqs.map((faq, index) => (
                  <View key={index} style={styles.faqItem}>
                    <TouchableOpacity 
                       style={styles.faqQuestionRow} 
                       onPress={() => toggleFaq(index)}
                       activeOpacity={0.7}
                    >
                       <Text style={styles.faqQuestion}>{faq.question}</Text>
                       <Ionicons name={expandedFaq === index ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    {expandedFaq === index && (
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    )}
                  </View>
                ))}
             </View>
          </View>
        )}

      </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal visible={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
        <Text style={styles.modalTitle}>Select Issue Category</Text>
        <View style={styles.categoryList}>
          {issueCategories.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryOption, 
                formData.issue === cat.id && styles.categoryOptionActive
              ]}
              onPress={() => {
                setFormData({ ...formData, issue: cat.id });
                setShowCategoryModal(false);
              }}
            >
              <Text style={[
                styles.categoryOptionText,
                formData.issue === cat.id && styles.categoryOptionTextActive
              ]}>
                {cat.label}
              </Text>
              {formData.issue === cat.id && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={() => setShowCategoryModal(false)}>
          <Text style={styles.submitBtnText}>Close</Text>
        </TouchableOpacity>
      </Modal>
      <Toast visible={showSuccess} message="Report Submitted!" subtitle="We will be in touch shortly." type="success" onHide={() => setShowSuccess(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emergencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
  },
  emergencySub: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  callButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#111827',
  },
  tabContent: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 12,
    marginLeft: 8,
    letterSpacing: 0.8,
  },
  formCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 4,
  },
  inputField: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 15,
    color: '#111827',
  },
  selectField: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  channelsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  channelIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  faqWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 16,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    paddingRight: 16,
  },
  faqAnswer: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryList: {
    gap: 12,
    marginBottom: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  categoryOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20', // subtle tint
  },
  categoryOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
  },
  categoryOptionTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  }
});
