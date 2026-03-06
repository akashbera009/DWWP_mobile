// import { useSafeAreaColor } from './SafeAreaColorContext';
import colors from '@dwwp/utils/colors';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  ignoreTop?: boolean; // optional override
};

const SafeAreaContainer = ({ children, ignoreTop: ignoreTopProp }: Props) => {
//   const { color, ignoreTop: ignoreTopFromCtx } = useSafeAreaColor();

  const ignoreTop = false
    // typeof ignoreTopProp === 'boolean' ? ignoreTopProp : ignoreTopFromCtx;
//    ignoreTopProp

  const edges: readonly Edge[] = (() => {
    if (ignoreTop) {
      return []; // ignore top safe area
    }

    if (Platform.OS === 'android') {
      return ['top', 'bottom'];
    }
    return ['top'];
  })();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.primary }]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaContainer;