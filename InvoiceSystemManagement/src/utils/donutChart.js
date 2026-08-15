import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const SEGMENT_GAP = 6;

const DonutChart = ({
  size = 160,
  strokeWidth = 18,
  segments = [],
  centerValue,
  centerLabel,
  currency = '$',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, seg) => sum + (Number(seg.value) || 0), 0) || 1;

  let cumulativeRaw = 0;
  const arcs = segments.map((seg, index) => {
    const fraction = (Number(seg.value) || 0) / total;
    const rawDash = fraction * circumference;
    const dash = Math.max(rawDash - SEGMENT_GAP, 0);
    const arc = {
      key: index,
      color: seg.color,
      dash,
      gap: circumference - dash,
      offset: -cumulativeRaw,
    };
    cumulativeRaw += rawDash;
    return arc;
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Rotamos -90deg para que el anillo empiece arriba (12 en punto) en
          vez de a la derecha (3 en punto), que es donde arranca por defecto
          un <Circle> de SVG. */}
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {arcs.map((arc) => (
          <Circle
            key={arc.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={arc.offset}
            strokeLinecap="round"
            fill="transparent"
          />
        ))}
      </Svg>

      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text
          className="text-slate-900 font-black"
          style={{ fontSize: size * 0.12 }}
          numberOfLines={1}
        >
          {currency} {Number(centerValue || 0).toFixed(2)}
        </Text>
        {centerLabel ? (
          <Text
            className="text-slate-500"
            style={{ fontSize: Math.max(size * 0.1, 10), marginTop: 2 }}
          >
            {centerLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default DonutChart;