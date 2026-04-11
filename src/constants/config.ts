import { Dimensions } from "react-native";

const window = Dimensions.get("window");

export const config = {
  CANVAS_WIDTH: window.width,
  CANVAS_HEIGHT: window.height,
  BACKGROUND_COLOR: "#87CEEB",
  BALLOON_COLORS: ["#FF4D6D", "#4DABF7", "#5CDB95", "#FFD43B", "#C084FC"],
  BALLOON_RADIUS_MIN: 22,
  BALLOON_RADIUS_MAX: 32,
  BALLOON_SPEED_MIN: 55,
  BALLOON_SPEED_MAX: 135,
  BALLOON_SPAWN_INTERVAL: 0.7,
  MAX_BALLOONS: 12,
  BULLET_RADIUS: 6,
  BULLET_SPEED: 760,
  GUN_WIDTH: 26,
  GUN_HEIGHT: 48,
  GUN_BASE_OFFSET: 30,
};
