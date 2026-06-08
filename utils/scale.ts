import { Dimensions, PixelRatio } from "react-native";

const BASE_WIDTH = 393;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const scale = SCREEN_WIDTH / BASE_WIDTH;

export function s(size: number): number {
  return Math.round(size * scale);
}

export function fs(size: number): number {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}