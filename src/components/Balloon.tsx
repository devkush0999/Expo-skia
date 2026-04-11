import { Circle } from "@shopify/react-native-skia";

type BalloonProps = {
  x: number;
  y: number;
  radius: number;
  color: string;
};

export default function Balloon({ x, y, radius, color }: BalloonProps) {
  return <Circle cx={x} cy={y} r={radius} color={color} />;
}
