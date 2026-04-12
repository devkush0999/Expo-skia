import { config } from "@/src/constants/config";
import type { LevelConfig } from "@/src/constants/levels";
import { isCircleColliding } from "@/src/engine/collision";
import { useGameLoop } from "@/src/engine/useGameLoop";
import { Canvas, Rect } from "@shopify/react-native-skia";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { runOnJS } from "react-native-reanimated";
import Balloon from "./Balloon";
import Bullet from "./Bullet";
import Gun from "./Gun";
import PopEffect from "./PopEffect";

type GameCanvasProps = {
  isGameOver: boolean;
  isPaused: boolean;
  levelConfig: LevelConfig;
  onLevelComplete: () => void;
  onMiss: (misses: number) => void;
  onPop: () => void;
  onScore: (points: number) => void;
  onSpawnedChange: (spawned: number) => void;
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
  color: string;
};

type SceneState = {
  balloons: BalloonModel[];
  bullets: BulletModel[];
  pops: PopEffectModel[];
};

type PopEffectModel = {
  id: string;
  age: number;
  color: string;
  radius: number;
  x: number;
  y: number;
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

const initialScene: SceneState = {
  balloons: [],
  bullets: [],
  pops: [],
};

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random()}`;

export default function GameCanvas({
  isGameOver,
  isPaused,
  levelConfig,
  onLevelComplete,
  onMiss,
  onPop,
  onScore,
  onSpawnedChange,
}: GameCanvasProps) {
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 });
  const [scene, setScene] = useState<SceneState>(initialScene);
  const [gunAngle, setGunAngle] = useState(-Math.PI / 2);
  const [selectedBulletIndex, setSelectedBulletIndex] = useState(0);
  const sceneRef = useRef<SceneState>(initialScene);
  const spawnTimer = useRef(0);
  const spawnedCount = useRef(0);
  const levelComplete = useRef(false);

  const { width, height } = size;
  const gunX = width / 2;
  const gunY = height - config.GUN_BASE_OFFSET;
  const selectedBulletColor = config.BULLET_COLORS[selectedBulletIndex];
  const leftBulletColor =
    config.BULLET_COLORS[
      (selectedBulletIndex - 1 + config.BULLET_COLORS.length) %
        config.BULLET_COLORS.length
    ];
  const rightBulletColor =
    config.BULLET_COLORS[
      (selectedBulletIndex + 1) % config.BULLET_COLORS.length
    ];

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
      y: -radius,
      radius,
      speed: randomBetween(
        levelConfig.balloonSpeedMin,
        levelConfig.balloonSpeedMax,
      ),
      color: chooseColor(),
    };
  }, [height, levelConfig.balloonSpeedMax, levelConfig.balloonSpeedMin, width]);

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
      if (isGameOver || isPaused || width <= 0 || height <= 0) {
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
        color: selectedBulletColor,
      };

      const nextScene = {
        ...sceneRef.current,
        bullets: [...sceneRef.current.bullets, bullet],
      };
      sceneRef.current = nextScene;
      setScene(nextScene);
    },
    [gunX, gunY, height, isGameOver, isPaused, selectedBulletColor, width],
  );

  const updateScene = useCallback(
    (dt: number) => {
      if (isGameOver || isPaused || width <= 0 || height <= 0) {
        return;
      }

      spawnTimer.current += dt;
      const canSpawn = spawnedCount.current < levelConfig.totalBalloons;
      const shouldSpawn =
        canSpawn && spawnTimer.current >= levelConfig.spawnInterval;
      if (shouldSpawn) {
        spawnTimer.current -= levelConfig.spawnInterval;
      }

      const current = sceneRef.current;
      const movedBalloons = current.balloons.map((balloon) => ({
        ...balloon,
        y: balloon.y + balloon.speed * dt,
      }));
      const missedCount = movedBalloons.filter(
        (balloon) => balloon.y - balloon.radius >= height,
      ).length;
      const activeBalloons = movedBalloons.filter(
        (balloon) => balloon.y - balloon.radius < height,
      );

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

      for (const balloon of activeBalloons) {
        for (const bullet of movedBullets) {
          if (
            poppedBalloonIds.has(balloon.id) ||
            spentBulletIds.has(bullet.id)
          ) {
            continue;
          }

          if (
            balloon.color === bullet.color &&
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

      const nextScene: SceneState = {
        balloons: activeBalloons.filter(
          (balloon) => !poppedBalloonIds.has(balloon.id),
        ),
        bullets: movedBullets.filter(
          (bullet) => !spentBulletIds.has(bullet.id),
        ),
        pops: [
          ...current.pops
            .map((pop) => ({ ...pop, age: pop.age + dt }))
            .filter((pop) => pop.age < config.POP_EFFECT_DURATION),
          ...activeBalloons
            .filter((balloon) => poppedBalloonIds.has(balloon.id))
            .map((balloon) => ({
              id: createId("pop"),
              age: 0,
              color: balloon.color,
              radius: balloon.radius,
              x: balloon.x,
              y: balloon.y,
            })),
        ],
      };
      let spawnedChanged = false;

      if (shouldSpawn && nextScene.balloons.length < levelConfig.maxBalloons) {
        const balloon = createBalloon();
        if (balloon) {
          nextScene.balloons = [...nextScene.balloons, balloon];
          spawnedCount.current += 1;
          spawnedChanged = true;
        }
      }

      const spawned = spawnedCount.current;
      const didLevelComplete =
        spawned >= levelConfig.totalBalloons &&
        nextScene.balloons.length === 0 &&
        !levelComplete.current;

      if (didLevelComplete) {
        levelComplete.current = true;
      }

      sceneRef.current = nextScene;
      setScene(nextScene);

      if (missedCount > 0) {
        onMiss(missedCount);
      }

      if (poppedBalloonIds.size > 0) {
        onPop();
        onScore(poppedBalloonIds.size);
      }

      if (spawnedChanged) {
        onSpawnedChange(spawned);
      }

      if (didLevelComplete) {
        onLevelComplete();
      }
    },
    [
      createBalloon,
      height,
      isGameOver,
      isPaused,
      levelConfig.maxBalloons,
      levelConfig.spawnInterval,
      levelConfig.totalBalloons,
      onLevelComplete,
      onMiss,
      onPop,
      onScore,
      onSpawnedChange,
      width,
    ],
  );

  useGameLoop(updateScene);

  const tapGesture = useMemo(
    () =>
      Gesture.Tap().onStart((event) => {
        runOnJS(shootBullet)(event.x, event.y);
      }),
    [shootBullet],
  );

  const choosePreviousColor = useCallback(() => {
    setSelectedBulletIndex(
      (current) =>
        (current - 1 + config.BULLET_COLORS.length) %
        config.BULLET_COLORS.length,
    );
  }, []);

  const chooseNextColor = useCallback(() => {
    setSelectedBulletIndex(
      (current) => (current + 1) % config.BULLET_COLORS.length,
    );
  }, []);

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
                color={bullet.color}
              />
            ))}
            {scene.pops.map((pop) => (
              <PopEffect
                key={pop.id}
                color={pop.color}
                progress={pop.age / config.POP_EFFECT_DURATION}
                radius={pop.radius}
                x={pop.x}
                y={pop.y}
              />
            ))}
            {width > 0 && height > 0 ? (
              <Gun
                bulletColor={selectedBulletColor}
                x={gunX}
                y={gunY}
                angle={gunAngle}
              />
            ) : null}
          </Canvas>
        </View>
      </GestureDetector>
      <View style={styles.colorPicker}>
        <Pressable
          onPress={choosePreviousColor}
          style={[styles.colorButton, { backgroundColor: leftBulletColor }]}
        />
        <Pressable
          onPress={chooseNextColor}
          style={[styles.colorButton, { backgroundColor: rightBulletColor }]}
        />
      </View>
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
  colorPicker: {
    alignItems: "center",
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    left: "50%",
    position: "absolute",
    transform: [{ translateX: -120 }],
    width: 240,
  },
  colorButton: {
    alignItems: "center",
    borderColor: "rgba(8,45,84,0.35)",
    borderRadius: 8,
    borderWidth: 2,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
});
