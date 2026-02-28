
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import {
  Canvas,
  Path,
  LinearGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const FREQUENCY = 2;
const STEP = 2;

export const Profile = () => {
  const amplitude = useSharedValue(20);
  const verticalOffset = useSharedValue(height * 0.4);
  const phase = useSharedValue(0);

  // Drive animation
  React.useEffect(() => {
    const id = setInterval(() => {
      phase.value += 0.04;
    }, 16);
    return () => clearInterval(id);
  }, []);

  // SVG PATH GENERATOR (WORKLET SAFE)
  const animatedPath = useDerivedValue(() => {
    "worklet";

    let d = `M 0 ${verticalOffset.value}`;

    for (let x = 0; x <= width; x += STEP) {
      const angle =
        (x / width) * Math.PI * FREQUENCY + phase.value;
      const y =
        amplitude.value * Math.sin(angle) +
        verticalOffset.value;
      d += ` L ${x} ${y}`;
    }

    d += ` L ${width} ${height}`;
    d += ` L 0 ${height} Z`;

    return d;
  });

  const gradientStart = useDerivedValue(() =>
    vec(0, verticalOffset.value)
  );

  const gradientEnd = useDerivedValue(() =>
    vec(0, verticalOffset.value + 400)
  );

  return (
    <View style={styles.container}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Path path={animatedPath} style="fill">
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={["#4facfe", "#00f2fe"]}
          />
        </Path>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});