import { Circle } from "@shopify/react-native-skia";

type BulletProps = {
  x: number;
  y: number;
  radius: number;
};

export default function Bullet({ x, y, radius }: BulletProps) {
  return <Circle cx={x} cy={y} r={radius} color="#FFFFFF" />;
}
