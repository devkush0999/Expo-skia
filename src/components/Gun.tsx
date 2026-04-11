import { Group, Rect } from "@shopify/react-native-skia";

type GunProps = {
  x: number;
  y: number;
  angle: number;
};

export default function Gun({ x, y, angle }: GunProps) {
  const bodyWidth = 28;
  const bodyHeight = 40;
  const barrelWidth = 12;
  const barrelHeight = 26;
  const bodyLeft = x - bodyWidth / 2;
  const bodyTop = y - bodyHeight;
  const barrelLeft = x - barrelWidth / 2;
  const barrelTop = bodyTop - barrelHeight + 8;

  return (
    <Group
      transform={[
        { translateX: x },
        { translateY: y },
        { rotate: angle },
        { translateX: -x },
        { translateY: -y },
      ]}
    >
      <Rect
        x={bodyLeft}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        color="#2D2D2D"
      />
      <Rect
        x={barrelLeft}
        y={barrelTop}
        width={barrelWidth}
        height={barrelHeight}
        color="#121212"
      />
    </Group>
  );
}
