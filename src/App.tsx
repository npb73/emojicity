import React, { useEffect, useRef, useState } from "react";
import styles from "./App.module.scss"
import { throttle } from 'lodash';

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
  triggered: boolean,
}

interface HousesRendererProps {
  items: house[];
  position: { x: number; y: number };
}

function HousesRenderer({ items, position }: HousesRendererProps) {
  return (
    <div
      className={styles.houses_container}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: "none", // Отключаем скролл браузера при drag
      }}
    >
      {/* Рендерим дома */}
      {items.map((house) => (
        <div 
          key={house.id} 
          className={styles.house_container}
          style={{
            transform: `translate(${house.coords.x}px, ${house.coords.y}px)`,
          }}
        >
          <div className={styles.house_emoji}>{house.emoji}</div>
        </div>
      ))}
    </div>
  );
}

// Добавляем типизацию для window.Telegram
declare global {
  interface Window {
    Telegram?: any;
  }
}

function App() {
  // Состояние для домов (чтобы можно было менять triggered)
  const [houses, setHouses] = useState<house[]>([
    {
      id: 'tent',
      emoji: '⛺️',
      unlockPrice: 100,
      profit: 10,
      price: [{wood: 10, stone: 10}],
      coords: {x: 0, y: 0},
      triggered: false,
    },
  ]);

  // Счёт
  const [score, setScore] = useState(0);

  // Радиус поиска (можно менять)
  const radius = window.innerHeight * 0.1;

  // Вся логика поиска и начисления баллов
  const handleHousesInCircle = (houses: house[], position: { x: number; y: number }, radius: number) => {
    const housesInCircle = houses.filter(h => {
      const dx = h.coords.x - position.x;
      const dy = h.coords.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });

    setHouses(prev =>
      prev.map(h => {
        if (housesInCircle.includes(h) && !h.triggered) {
          setScore(s => s + 1);

          // Таптик для Telegram Mini Apps по официальной документации
          if (
            typeof window !== 'undefined' &&
            window.Telegram &&
            window.Telegram.WebApp &&
            window.Telegram.WebApp.HapticFeedback &&
            typeof window.Telegram.WebApp.HapticFeedback.impactOccurred === 'function'
          ) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
          }

          return { ...h, triggered: true };
        }
        if (!housesInCircle.includes(h) && h.triggered) {
          // Если дом вне круга и был triggered — сбрасываем
          return { ...h, triggered: false };
        }
        return h;
      })
    );

    console.log(housesInCircle);
  };

  // Троттлим всю функцию
  const throttledHandleHousesInCircle = useRef(
    throttle(handleHousesInCircle, 100)
  ).current;

  useEffect(() => {
    console.log(score);
  }, [score]);

  // Состояние для позиции всей сцены
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
    const newPosition = {
      x: lastPosRef.current.x + dx,
      y: lastPosRef.current.y + dy,
    };
    setPosition(newPosition);

    // Вся логика теперь троттлится
    throttledHandleHousesInCircle(houses, newPosition, radius);
  };

  // Обработчик окончания тача
  const handleTouchEnd = () => {
    startRef.current = null;
  };

  return (
    <div
      className={styles.main_container}
      style={{ touchAction: "none" }} // Отключаем скролл браузера при drag
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <HousesRenderer items={houses} position={position} />
      <div className={styles.main_cursor}></div>
    </div>
  );
}

export default App
