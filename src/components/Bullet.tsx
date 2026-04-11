import { Circle, Group } from "@shopify/react-native-skia";

type BulletProps = {
  x: number;
  y: number;
  radius: number;
};

export default function Bullet({ x, y, radius }: BulletProps) {
  return (
    <Group>
      <Circle cx={x} cy={y} r={radius + 2} color="#082D54" />
      <Circle cx={x} cy={y} r={radius} color="#FFFFFF" />
    </Group>
  );
}
