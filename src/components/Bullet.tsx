import { Circle, Group } from "@shopify/react-native-skia";

type BulletProps = {
  x: number;
  y: number;
  radius: number;
  color: string;
};

export default function Bullet({ x, y, radius, color }: BulletProps) {
  return (
    <Group>
      <Circle cx={x} cy={y} r={radius + 2} color="#082D54" />
      <Circle cx={x} cy={y} r={radius} color={color} />
    </Group>
  );
}
