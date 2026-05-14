import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { Portal } from '@gorhom/portal'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import colors from '@dwwp/utils/colors'
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { sendAIChatMessage } from '../analyticsActions'
import {
  selectChatHistory,
  selectChatLoading,
  selectChatError,
  selectIsChatOpen,
  selectCurrentPrediction,
  closeChat,
  clearChatHistory,
  selectPredictionIsLoading,
} from '../analyticsSlice'
import { getSuggestedQuestions } from '../engine/Wateraiservice'
import type { ChatMessage } from '../engine/Wateraiservice'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// ─── Component ────────────────────────────────────────────────────────────────

const AIChatSheet: React.FC = () => {
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
  const isOpen = useAppSelector(selectIsChatOpen)
  const chatHistory = useAppSelector(selectChatHistory)
  const isLoading = useAppSelector(selectChatLoading)
  const chatError = useAppSelector(selectChatError)
  const prediction = useAppSelector(selectCurrentPrediction)
  const isPredictionLoading = useAppSelector(selectPredictionIsLoading)

  const bottomSheetRef = useRef<BottomSheet>(null)
  const flatListRef = useRef<FlatList>(null)
  const [inputText, setInputText] = useState('')

  const snapPoints = useMemo(() => ['70%', '92%'], [])

  // Suggested questions based on prediction
  const suggestedQuestions = useMemo(() => {
    if (!prediction) return []
    return getSuggestedQuestions(prediction)
  }, [prediction])

  // Open/close sheet based on Redux state 
  useEffect(() => {
    console.log('[AIChatSheet] isOpen:', isOpen, '| ref ready:', !!bottomSheetRef.current)

    if (isOpen) {
      if (bottomSheetRef.current) {
        console.log('[AIChatSheet] Snapping to 0')
        bottomSheetRef.current.snapToIndex(0)
      } else {
        // If Portal delays ref attachment, try again shortly
        setTimeout(() => {
          console.log('[AIChatSheet] delayed snap, ref ready:', !!bottomSheetRef.current)
          bottomSheetRef.current?.snapToIndex(0)
        }, 150)
      }
    } else {
      console.log('[AIChatSheet] Closing sheet')
      bottomSheetRef.current?.close()
    }
  }, [isOpen])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatHistory.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [chatHistory.length])

  const handleSend = useCallback(
    (message?: string) => {
      const text = (message ?? inputText).trim()
      if (!text || isLoading || isPredictionLoading) return

      dispatch(sendAIChatMessage(text))
      setInputText('')
    },
    [inputText, isLoading, isPredictionLoading, dispatch]
  )

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1 && isOpen) {
        dispatch(closeChat())
      }
    },
    [dispatch, isOpen]
  )

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    []
  )

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isUser = item.role === 'user'
      return (
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          {!isUser && (
            <View style={styles.aiAvatarRow}>
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>✨</Text>
              </View>
              <Text style={styles.aiLabel}>DWWP AI</Text>
            </View>
          )}
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText,
            ]}
          >
            {item.content}
          </Text>
        </View>
      )
    },
    []
  )

  return (
    <Portal name="safe">
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustPan"
      >
        <BottomSheetView style={{ flex: 1 }}>
          <View
            style={styles.container}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerIcon}>💬</Text>
                <View>
                  <Text style={styles.headerTitle}>DWWP AI Chat</Text>
                  <Text style={styles.headerSub}>Ask anything about your usage</Text>
                </View>
              </View>
              <View style={styles.headerActions}>
                {chatHistory.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => dispatch(clearChatHistory())}
                  >
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => dispatch(closeChat())}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Messages */}
            <FlatList
              ref={flatListRef}
              data={chatHistory}
              renderItem={renderMessage}
              keyExtractor={(_, i) => `msg-${i}`}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                isPredictionLoading ? (
                  <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: vh(12) }} />
                    <Text style={styles.emptyTitle}>
                      Initializing DWWP AI...
                    </Text>
                    <Text style={styles.emptyBody}>
                      Please wait while we gather your water usage insights and prepare your assistant.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🤖</Text>
                    <Text style={styles.emptyTitle}>
                      Hi! I'm your DWWP AI assistant
                    </Text>
                    <Text style={styles.emptyBody}>
                      I can answer questions about your water usage, give tips to save
                      water, and explain your predictions. Try a question below!
                    </Text>
                  </View>
                )
              }
              ListFooterComponent={
                <>
                  {isLoading && (
                    <View style={[styles.messageBubble, styles.aiBubble]}>
                      <View style={styles.aiAvatarRow}>
                        <View style={styles.aiAvatar}>
                          <Text style={styles.aiAvatarText}>✨</Text>
                        </View>
                        <Text style={styles.aiLabel}>DWWP AI</Text>
                      </View>
                      <View style={styles.typingRow}>
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                        />
                        <Text style={styles.typingText}>Thinking...</Text>
                      </View>
                    </View>
                  )}
                  {chatError && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>⚠️ {chatError}</Text>
                    </View>
                  )}
                </>
              }
            />

            {/* Suggested Questions — show only when chat is empty */}
            {chatHistory.length === 0 && suggestedQuestions.length > 0 && (
              <View style={styles.suggestionsWrap}>
                {suggestedQuestions.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionChip}
                    onPress={() => handleSend(q)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Input */}
            <View style={styles.inputRow}>
              <BottomSheetTextInput
                style={[styles.input, { marginBottom: insets.bottom }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder={isPredictionLoading ? "Initializing AI..." : "Ask about your water usage..."}
                placeholderTextColor={colors.placeholderText}
                multiline
                maxLength={500}
                editable={!isLoading && !isPredictionLoading}
                onSubmitEditing={() => handleSend()}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading || isPredictionLoading) && styles.sendButtonDisabled,
                ]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isLoading || isPredictionLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.sendIcon}>↑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  )
}

export default AIChatSheet

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheetBackground: {
    backgroundColor: '#FAFBFC',
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
  },
  handleIndicator: {
    backgroundColor: colors.border,
    width: normalize(36),
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: vw(16),
    paddingTop: vh(4),
    paddingBottom: vh(10),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  headerIcon: {
    fontSize: normalize(24),
  },
  headerTitle: {
    fontFamily: fonts.Bold,
    fontSize: normalize(16),
    color: '#111',
  },
  headerSub: {
    fontFamily: fonts.Regular,
    fontSize: normalize(11),
    color: colors.neutralBodyText,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  clearButton: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
    borderRadius: normalize(6),
    backgroundColor: 'rgba(231,76,60,0.08)',
  },
  clearButtonText: {
    fontFamily: fonts.SemiBold,
    fontSize: normalize(11),
    color: colors.error,
  },
  closeButton: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: normalize(14),
    color: '#666',
    fontFamily: fonts.Bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Messages
  messagesList: {
    paddingHorizontal: vw(16),
    paddingVertical: vh(12),
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: normalize(14),
    padding: normalize(12),
    marginBottom: normalize(10),
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: normalize(4),
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: normalize(4),
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: normalize(13),
    lineHeight: normalize(19),
  },
  userText: {
    fontFamily: fonts.Regular,
    color: '#FFFFFF',
  },
  aiText: {
    fontFamily: fonts.Regular,
    color: '#222',
  },
  aiAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(6),
  },
  aiAvatar: {
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(11),
    backgroundColor: 'rgba(43,101,104,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiAvatarText: {
    fontSize: normalize(12),
  },
  aiLabel: {
    fontFamily: fonts.SemiBold,
    fontSize: normalize(10),
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  typingText: {
    fontFamily: fonts.Regular,
    fontSize: normalize(12),
    color: colors.neutralBodyText,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: vh(40),
    paddingHorizontal: vw(20),
  },
  emptyIcon: {
    fontSize: normalize(40),
    marginBottom: vh(12),
  },
  emptyTitle: {
    fontFamily: fonts.Bold,
    fontSize: normalize(16),
    color: '#111',
    marginBottom: normalize(6),
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fonts.Regular,
    fontSize: normalize(13),
    color: colors.neutralBodyText,
    textAlign: 'center',
    lineHeight: normalize(19),
  },

  // Suggestions
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: vw(16),
    gap: normalize(8),
    paddingBottom: vh(10),
  },
  suggestionChip: {
    backgroundColor: 'rgba(43,101,104,0.08)',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(8),
    borderWidth: 1,
    borderColor: 'rgba(43,101,104,0.15)',
  },
  suggestionText: {
    fontFamily: fonts.Regular,
    fontSize: normalize(12),
    color: colors.primary,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: vw(12),
    paddingVertical: vh(8),
    gap: normalize(8),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontFamily: fonts.Regular,
    fontSize: normalize(14),
    color: '#111',
    backgroundColor: colors.inputBackground,
    borderRadius: normalize(20),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    maxHeight: normalize(80),
  },
  sendButton: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
    opacity: 0.5,
  },
  sendIcon: {
    fontFamily: fonts.Bold,
    fontSize: normalize(18),
    color: '#FFFFFF',
  },

  // Error
  errorBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(231,76,60,0.06)',
    borderRadius: normalize(10),
    padding: normalize(10),
    marginBottom: normalize(8),
  },
  errorText: {
    fontFamily: fonts.Regular,
    fontSize: normalize(12),
    color: colors.error,
  },
})
