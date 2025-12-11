import React, { useEffect, useState, useRef } from 'react';
import './RouletteWheel.css';

const rouletteNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const getNumberColor = (num: number): 'red' | 'black' | 'green' => {
  if (num === 0) return 'green';
  return redNumbers.includes(num) ? 'red' : 'black';
};

interface RouletteWheelProps {
  spinning: boolean;
  result: number | null;
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({ spinning, result }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spinning && result !== null) {
      const resultIndex = rouletteNumbers.indexOf(result);
      
      const segmentAngle = 360 / rouletteNumbers.length;
      
      const targetAngle = -(resultIndex * segmentAngle) + (segmentAngle / 2);
      
      const extraRotations = 5 + Math.random() * 2;
      const totalRotation = 360 * extraRotations + targetAngle;
      
      setRotation(totalRotation);
    }
  }, [spinning, result]);

  const segmentAngle = 360 / rouletteNumbers.length;

  return (
    <div className="roulette-wheel-container">
      <div className="wheel-outer-ring">
        <div className="wheel-pointer"></div>
        <div 
          ref={wheelRef}
          className={`wheel-inner ${spinning ? 'spinning' : ''}`}
          style={{
            transform: `rotate(${-rotation}deg)`
          }}
        >
          <div className="wheel-center">
            <div className="wheel-center-logo">
              <span className="logo-text">SPIN</span>
            </div>
          </div>
          
          {rouletteNumbers.map((num, index) => {
            const angle = index * segmentAngle;
            const color = getNumberColor(num);
            
            return (
              <div
                key={index}
                className={`wheel-segment ${color}`}
                style={{
                  transform: `rotate(${angle}deg)`
                }}
              >
                <div className="segment-number">
                  {num}
                </div>
              </div>
            );
          })}
        </div>
        
        {spinning && (
          <div 
            ref={ballRef}
            className="wheel-ball spinning"
            style={{
              transform: `rotate(${rotation * 1.15}deg)`
            }}
          >
            <div className="ball"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouletteWheel;
