import { config } from "@/src/constants/config";
import { isCircleColliding } from "@/src/engine/collision";
import { useGameLoop } from "@/src/engine/useGameLoop";
import { Canvas, Rect } from "@shopify/react-native-skia";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { runOnJS } from "react-native-reanimated";
import Balloon from "./Balloon";
import Bullet from "./Bullet";
import Gun from "./Gun";

type GameCanvasProps = {
  onScore: (points: number) => void;
};

type BalloonModel = {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
};

type BulletModel = {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
};

type SceneState = {
  balloons: BalloonModel[];
  bullets: BulletModel[];
};

type CanvasSize = {
  width: number;
  height: number;
};

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const chooseColor = () =>
  config.BALLOON_COLORS[
    Math.floor(Math.random() * config.BALLOON_COLORS.length)
  ];

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random()}`;

export default function GameCanvas({ onScore }: GameCanvasProps) {
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 });
  const [scene, setScene] = useState<SceneState>({ balloons: [], bullets: [] });
  const [gunAngle, setGunAngle] = useState(-Math.PI / 2);
  const spawnTimer = useRef(0);

  const { width, height } = size;
  const gunX = width / 2;
  const gunY = height - config.GUN_BASE_OFFSET;

  const createBalloon = useCallback((): BalloonModel | null => {
    if (width <= 0 || height <= 0) {
      return null;
    }

    const radius = randomBetween(
      config.BALLOON_RADIUS_MIN,
      config.BALLOON_RADIUS_MAX,
    );

    return {
      id: createId("balloon"),
      x: randomBetween(radius, width - radius),
      y: height + radius,
      radius,
      speed: randomBetween(config.BALLOON_SPEED_MIN, config.BALLOON_SPEED_MAX),
      color: chooseColor(),
    };
  }, [height, width]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;
    setSize((current) => {
      if (current.width === nextWidth && current.height === nextHeight) {
        return current;
      }

      return { width: nextWidth, height: nextHeight };
    });
  }, []);

  const shootBullet = useCallback(
    (targetX: number, targetY: number) => {
      if (width <= 0 || height <= 0) {
        return;
      }

      const angle = Math.atan2(targetY - gunY, targetX - gunX);
      setGunAngle(angle);

      const bullet: BulletModel = {
        id: createId("bullet"),
        x: gunX,
        y: gunY - config.GUN_HEIGHT * 0.55,
        radius: config.BULLET_RADIUS,
        dx: Math.cos(angle) * config.BULLET_SPEED,
        dy: Math.sin(angle) * config.BULLET_SPEED,
      };

      setScene((current) => ({
        ...current,
        bullets: [...current.bullets, bullet],
      }));
    },
    [gunX, gunY, height, width],
  );

  const updateScene = useCallback(
    (dt: number) => {
      if (width <= 0 || height <= 0) {
        return;
      }

      spawnTimer.current += dt;
      const shouldSpawn = spawnTimer.current >= config.BALLOON_SPAWN_INTERVAL;
      if (shouldSpawn) {
        spawnTimer.current -= config.BALLOON_SPAWN_INTERVAL;
      }

      setScene((current) => {
        const movedBalloons = current.balloons
          .map((balloon) => ({
            ...balloon,
            y: balloon.y - balloon.speed * dt,
          }))
          .filter((balloon) => balloon.y + balloon.radius > 0);

        const movedBullets = current.bullets
          .map((bullet) => ({
            ...bullet,
            x: bullet.x + bullet.dx * dt,
            y: bullet.y + bullet.dy * dt,
          }))
          .filter(
            (bullet) =>
              bullet.x >= -bullet.radius &&
              bullet.x <= width + bullet.radius &&
              bullet.y >= -bullet.radius &&
              bullet.y <= height + bullet.radius,
          );

        const poppedBalloonIds = new Set<string>();
        const spentBulletIds = new Set<string>();

        for (const balloon of movedBalloons) {
          for (const bullet of movedBullets) {
            if (
              poppedBalloonIds.has(balloon.id) ||
              spentBulletIds.has(bullet.id)
            ) {
              continue;
            }

            if (
              isCircleColliding(
                balloon.x,
                balloon.y,
                balloon.radius,
                bullet.x,
                bullet.y,
                bullet.radius,
              )
            ) {
              poppedBalloonIds.add(balloon.id);
              spentBulletIds.add(bullet.id);
            }
          }
        }

        if (poppedBalloonIds.size > 0) {
          onScore(poppedBalloonIds.size);
        }

        const nextScene: SceneState = {
          balloons: movedBalloons.filter(
            (balloon) => !poppedBalloonIds.has(balloon.id),
          ),
          bullets: movedBullets.filter(
            (bullet) => !spentBulletIds.has(bullet.id),
          ),
        };

        if (shouldSpawn && nextScene.balloons.length < config.MAX_BALLOONS) {
          const balloon = createBalloon();
          if (balloon) {
            nextScene.balloons = [...nextScene.balloons, balloon];
          }
        }

        return nextScene;
      });
    },
    [createBalloon, height, onScore, width],
  );

  useGameLoop(updateScene);

  const tapGesture = useMemo(
    () =>
      Gesture.Tap().onStart((event) => {
        runOnJS(shootBullet)(event.x, event.y);
      }),
    [shootBullet],
  );

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <GestureDetector gesture={tapGesture}>
        <View style={styles.canvasContainer}>
          <Canvas style={styles.canvas}>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              color={config.BACKGROUND_COLOR}
            />
            {scene.balloons.map((balloon) => (
              <Balloon
                key={balloon.id}
                x={balloon.x}
                y={balloon.y}
                radius={balloon.radius}
                color={balloon.color}
              />
            ))}
            {scene.bullets.map((bullet) => (
              <Bullet
                key={bullet.id}
                x={bullet.x}
                y={bullet.y}
                radius={bullet.radius}
              />
            ))}
            {width > 0 && height > 0 ? (
              <Gun x={gunX} y={gunY} angle={gunAngle} />
            ) : null}
          </Canvas>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});
