import { config } from "@/src/constants/config";
import { Group, Rect } from "@shopify/react-native-skia";

type GunProps = {
  x: number;
  y: number;
  angle: number;
};

export default function Gun({ x, y, angle }: GunProps) {
  const bodyWidth = config.GUN_WIDTH;
  const bodyHeight = config.GUN_HEIGHT * 0.72;
  const barrelWidth = 10;
  const barrelHeight = config.GUN_HEIGHT * 0.58;
  const bodyLeft = x - bodyWidth / 2;
  const bodyTop = y - bodyHeight;
  const barrelLeft = x - barrelWidth / 2;
  const barrelTop = bodyTop - barrelHeight + 10;
  const rotation = angle + Math.PI / 2;

  return (
    <Group
      transform={[
        { translateX: x },
        { translateY: y },
        { rotate: rotation },
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
