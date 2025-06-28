import React, { useRef, useState } from "react";
import styles from "./App.module.scss"

type materialName = 'wood' | 'stone' | 'iron' | 'detail' | 'electicity' | 'science';

// Каждый объект в массиве может содержать любые ключи из materialName, значения — number
type Price = Array<Partial<Record<materialName, number>>>;
type Coords = {x: number, y: number};

interface house {
  id: string,
  emoji: string,
  unlockPrice: number,
  profit: number,
  price: Price,
  coords: Coords,
}

interface HousesRendererProps {
  items: house[];
}

function HousesRenderer({ items }: HousesRendererProps) {
  // Состояние для позиции контейнера
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  // Для хранения стартовой точки касания и позиции
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Обработчик начала тача
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY };
    lastPosRef.current = { ...position };
  };

  // Обработчик движения
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startRef.current.x;
    const dy = touch.clientY - startRef.current.y;
    setPosition({
      x: lastPosRef.current.x + dx,
      y: lastPosRef.current.y + dy,
    });
  };

  // Обработчик окончания тача
  const handleTouchEnd = () => {
    startRef.current = null;
  };

  return (
    <div
      className={styles.houses_container}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: "none", // Отключаем скролл браузера при drag
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Рендерим дома */}
      {items.map((house) => (
        <div key={house.id} className={styles.house_container}>
          <div className={styles.house_emoji}>{house.emoji}</div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const houses: house[] = [
    {
      id: '1',
      emoji: '🏠',
      unlockPrice: 100,
      profit: 10,
      price: [{wood: 10, stone: 10}],
      coords: {x: 0, y: 0},
    },
  ]

  return (
    <div className={styles.main_container}>
      <HousesRenderer items={houses} />
    </div>
  )
}

export default App
