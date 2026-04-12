import { Circle, Group } from "@shopify/react-native-skia";

type PopEffectProps = {
  color: string;
  progress: number;
  radius: number;
  x: number;
  y: number;
};

const sparks = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 0.72, y: 0.72 },
  { x: -0.72, y: 0.72 },
  { x: 0.72, y: -0.72 },
  { x: -0.72, y: -0.72 },
];

export default function PopEffect({
  color,
  progress,
  radius,
  x,
  y,
}: PopEffectProps) {
  const ringRadius = radius * (0.75 + progress * 1.1);
  const sparkDistance = radius * (0.45 + progress * 1.25);
  const sparkRadius = Math.max(1.5, radius * (0.18 - progress * 0.1));

  return (
    <Group>
      <Circle cx={x} cy={y} r={ringRadius} color="#FFFFFF" />
      <Circle cx={x} cy={y} r={ringRadius * 0.82} color={color} />
      <Circle cx={x} cy={y} r={ringRadius * 0.58} color="#FFFFFF" />
      {sparks.map((spark, index) => (
        <Circle
          key={index}
          cx={x + spark.x * sparkDistance}
          cy={y + spark.y * sparkDistance}
          r={sparkRadius}
          color={color}
        />
      ))}
    </Group>
  );
}
