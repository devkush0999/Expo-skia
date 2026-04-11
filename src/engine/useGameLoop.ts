import { useEffect } from "react";
import type { FrameInfo } from "react-native-reanimated";
import {
  runOnJS,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

export function useGameLoop(onTick: (dt: number) => void) {
  const previousTimestamp = useSharedValue(0);

  const frameCallback = useFrameCallback((frameInfo: FrameInfo) => {
    "worklet";

    if (previousTimestamp.value === 0) {
      previousTimestamp.value = frameInfo.timestamp;
      return;
    }

    const dt = (frameInfo.timestamp - previousTimestamp.value) / 1000;
    previousTimestamp.value = frameInfo.timestamp;
    runOnJS(onTick)(dt);
  }, true);

  useEffect(() => {
    frameCallback.setActive(true);
    return () => frameCallback.setActive(false);
  }, [frameCallback]);
}
