import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  Animated as RNAnimated,
} from 'react-native';
import { vw, vh } from '@dwwp/utils/dimensions';

interface AutoScrollCarouselProps {
  children: React.ReactNode;
  autoScrollInterval?: number; // ms between scrolls (default: 5000)
  pauseDuration?: number; // ms to pause after user interaction (default: 30000)
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  snapToInterval?: number;
  decelerationRate?: 'fast' | 'normal';
  showsHorizontalScrollIndicator?: boolean;
}

const AutoScrollCarousel: React.FC<AutoScrollCarouselProps> = ({
  children,
  autoScrollInterval = 5000,
  pauseDuration = 30000,
  onScroll,
  snapToInterval,
  decelerationRate = 'fast',
  showsHorizontalScrollIndicator = false,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true); // Start as true
  const [contentWidth, setContentWidth] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const autoScrollTimerRef =useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  // Start auto-scroll from first load
  useEffect(() => {
    if (contentWidth === 0) return;

    // Start auto-scrolling immediately
    setIsAutoScrolling(true);

    const startAutoScroll = () => {
      autoScrollTimerRef.current = setTimeout(() => {
        if (scrollViewRef.current) {
          const nextOffset = currentOffset + vw(300); // Assuming card width + gap
          
          scrollViewRef.current.scrollTo({
            x: nextOffset > contentWidth - vw(320) ? 0 : nextOffset,
            animated: true,
          });
        }
        startAutoScroll();
      }, autoScrollInterval);
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
    };
  }, [currentOffset, contentWidth, autoScrollInterval]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      setCurrentOffset(contentOffset.x);
      onScroll?.(event);
    },
    [onScroll]
  );

  const handleUserInteraction = useCallback(() => {
    // Pause auto-scroll
    setIsAutoScrolling(false);

    // Clear existing pause timer
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

    // Resume after pause duration
    pauseTimerRef.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, pauseDuration);
  }, [pauseDuration]);

  const handleScrollBeginDrag = () => {
    handleUserInteraction();
  };

  const handleMomentumScrollEnd = () => {
    // Optional: add a small delay before resuming
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 100);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onContentSizeChange={(width) => setContentWidth(width)}
        snapToInterval={snapToInterval}
        decelerationRate={decelerationRate}
        contentContainerStyle={styles.contentContainer}
      >
        {children}
      </ScrollView>

      {/* Optional: Pause indicator */}
      {!isAutoScrolling && (
        <View style={styles.pauseIndicator}>
          <View style={styles.pauseDot} />
        </View>
      )}
    </View>
  );
};

export default AutoScrollCarousel;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  contentContainer: {
    paddingHorizontal: vw(16),
    gap: vw(12),
  },
  pauseIndicator: {
    position: 'absolute',
    bottom: vh(8),
    right: vw(20),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: vw(10),
    paddingVertical: vh(6),
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(6),
  },
  pauseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FCD34D',
  },
});