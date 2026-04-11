import { config } from "@/src/constants/config";
import { isCircleColliding } from "@/src/engine/collision";
import { useGameLoop } from "@/src/engine/useGameLoop";
import { Canvas, Rect } from "@shopify/react-native-skia";
import React, { useCallback, useRef, useState } from "react";
import { GestureResponderEvent, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
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

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);
const chooseColor = () =>
  config.BALLOON_COLORS[
    Math.floor(Math.random() * config.BALLOON_COLORS.length)
  ];

export default function GameCanvas({ onScore }: GameCanvasProps) {
  const { width, height } = useWindowDimensions();
  const [scene, setScene] = useState<SceneState>({ balloons: [], bullets: [] });
  const spawnTimer = useRef(0);
  const [gunAngle, setGunAngle] = useState(-Math.PI / 2);

  const gunX = width / 2;
  const gunY = height - config.GUN_BASE_OFFSET;

  const spawnBalloon = useCallback(() => {
    if (!width || !height) {
      return;
    }

    const radius = randomBetween(
      config.BALLOON_RADIUS_MIN,
      config.BALLOON_RADIUS_MAX,
    );
    const x = randomBetween(radius, width - radius);
    const y = height + radius;
    const speed = randomBetween(
      config.BALLOON_SPEED_MIN,
      config.BALLOON_SPEED_MAX,
    );

    const balloon: BalloonModel = {
      id: `balloon-${Date.now()}-${Math.random()}`,
      x,
      y,
      radius,
      speed,
      color: chooseColor(),
    };

    setScene((prev) => ({ ...prev, balloons: [...prev.balloons, balloon] }));
  }, [height, width]);

  const shootBullet = useCallback(
    (targetX: number, targetY: number) => {
      if (!width || !height) {
        return;
      }

      const angle = Math.atan2(targetY - gunY, targetX - gunX);
      setGunAngle(angle);

      const bullet: BulletModel = {
        id: `bullet-${Date.now()}-${Math.random()}`,
        x: gunX,
        y: gunY - config.GUN_HEIGHT * 0.25,
        radius: config.BULLET_RADIUS,
        dx: Math.cos(angle) * config.BULLET_SPEED,
        dy: Math.sin(angle) * config.BULLET_SPEED,
      };

      setScene((prev) => ({ ...prev, bullets: [...prev.bullets, bullet] }));
    },
    [gunX, gunY, height, width],
  );

  const updateScene = useCallback(
    (dt: number) => {
      if (!width || !height) {
        return;
      }

      spawnTimer.current += dt;
      const shouldSpawn = spawnTimer.current >= config.BALLOON_SPAWN_INTERVAL;
      if (shouldSpawn) {
        spawnTimer.current -= config.BALLOON_SPAWN_INTERVAL;
      }

      setScene((prev) => {
        const movedBalloons = prev.balloons
          .map((balloon) => ({
            ...balloon,
            y: balloon.y - balloon.speed * dt,
          }))
          .filter((balloon) => balloon.y + balloon.radius > 0);

        const movedBullets = prev.bullets
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

        const hitBalloonIds = new Set<string>();
        const hitBulletIds = new Set<string>();

        for (const balloon of movedBalloons) {
          for (const bullet of movedBullets) {
            if (
              !hitBalloonIds.has(balloon.id) &&
              !hitBulletIds.has(bullet.id) &&
              isCircleColliding(
                balloon.x,
                balloon.y,
                balloon.radius,
                bullet.x,
                bullet.y,
                bullet.radius,
              )
            ) {
              hitBalloonIds.add(balloon.id);
              hitBulletIds.add(bullet.id);
            }
          }
        }

        const filteredBalloons = movedBalloons.filter(
          (balloon) => !hitBalloonIds.has(balloon.id),
        );
        const filteredBullets = movedBullets.filter(
          (bullet) => !hitBulletIds.has(bullet.id),
        );

        if (hitBalloonIds.size > 0) {
          onScore(hitBalloonIds.size);
        }

        const updatedScene: SceneState = {
          balloons: filteredBalloons,
          bullets: filteredBullets,
        };

        if (shouldSpawn && updatedScene.balloons.length < config.MAX_BALLOONS) {
          const radius = randomBetween(
            config.BALLOON_RADIUS_MIN,
            config.BALLOON_RADIUS_MAX,
          );
          const x = randomBetween(radius, width - radius);
          const y = height + radius;
          const speed = randomBetween(
            config.BALLOON_SPEED_MIN,
            config.BALLOON_SPEED_MAX,
          );

          updatedScene.balloons = [
            ...updatedScene.balloons,
            {
              id: `balloon-${Date.now()}-${Math.random()}`,
              x,
              y,
              radius,
              speed,
              color: chooseColor(),
            },
          ];
        }

        return updatedScene;
      });
    },
    [height, onScore, width],
  );

  useGameLoop(updateScene);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      shootBullet(locationX, locationY);
    },
    [shootBullet],
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.canvasContainer} onPress={handlePress}>
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
          <Gun x={gunX} y={gunY} angle={gunAngle} />
        </Canvas>
      </Pressable>
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
