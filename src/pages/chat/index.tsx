import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../utils/colors';

type RootStackParamList = {
  Chat: { trip: any };
};

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatPage() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<ChatRouteProp>();
  const { trip } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Fallback customer ID if not directly on trip
  const customerId = trip?.user_id || trip?.userId || trip?.customer_id;

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${trip?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${trip?.id}`,
        },
        (payload) => {
          setMessages((prev) => {
             // check if we already have this message to avoid duplicates
             if (prev.find(m => m.id === payload.new.id)) return prev;
             return [...prev, payload.new];
          });
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trip?.id]);

  const fetchMessages = async () => {
    if (!trip?.id) return;
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', trip.id)
        .order('created_at', { ascending: true });

      if (error) {
        // If the table doesn't exist, this will log a 42P01 error.
        console.warn('Could not fetch messages. Ensure chat_messages table exists.', error.message);
      } else if (data) {
        setMessages(data);
      }
    } catch (e) {
      console.warn('Fetch messages error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id || !trip?.id) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const newMessage = {
        order_id: trip.id,
        sender_id: user.id,
        receiver_id: customerId,
        sender_type: 'rider',
        message: textToSend,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([newMessage]);

      if (error) {
        console.error('Send message error:', error);
        alert('Failed to send message.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === user?.id;
    
    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperOther]}>
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeOther]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{trip?.customer_name || 'Customer'}</Text>
          <Text style={styles.headerSubtitle}>Order #{trip?.id?.substring(0, 4)?.toUpperCase() || 'CHAT'}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No messages yet.</Text>
            <Text style={styles.emptySubtext}>Send a message to contact the customer.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id?.toString() || item.created_at}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Type a message..."
            placeholderTextColor={colors.gray[400]}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Ionicons name="send" size={20} color={!inputText.trim() ? colors.gray[400] : "#fff"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.gray[500],
  },
  keyboardAvoid: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[500],
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[400],
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  messageWrapperMe: {
    justifyContent: 'flex-end',
  },
  messageWrapperOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageBubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTextOther: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimeOther: {
    color: colors.gray[500],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: '#000',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: -2,
  },
  sendButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
});
