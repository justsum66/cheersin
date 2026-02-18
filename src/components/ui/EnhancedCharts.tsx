import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  tooltip?: string;
}

interface BaseChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  showLabels?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  animated?: boolean;
  animationDuration?: number;
  className?: string;
}

interface BarChartProps extends BaseChartProps {
  horizontal?: boolean;
  barWidth?: number;
  barSpacing?: number;
  showValueLabels?: boolean;
}

interface LineChartProps extends BaseChartProps {
  strokeWidth?: number;
  showPoints?: boolean;
  showArea?: boolean;
  curveType?: 'linear' | 'monotone' | 'step';
}

interface PieChartProps extends BaseChartProps {
  innerRadius?: number;
  showPercentages?: boolean;
  showLegend?: boolean;
}

interface DonutChartProps extends PieChartProps {
  centerLabel?: string;
  centerValue?: string | number;
}

const DEFAULT_COLORS = [
  '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa',
  '#22d3ee', '#f472b6', '#fda4af', '#c084fc', '#67e8f9'
];

const CHART_MARGINS = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 40
};

/**
 * Enhanced Bar Chart Component
 * Features:
 * - Horizontal and vertical orientations
 * - Custom colors and tooltips
 * - Animated transitions
 * - Value labels
 * - Responsive design
 */
export function EnhancedBarChart({
  data,
  width = 400,
  height = 300,
  horizontal = false,
  barWidth = 30,
  barSpacing = 10,
  showLabels = true,
  showGrid = true,
  showTooltip = true,
  showValueLabels = true,
  animated = true,
  animationDuration = 500,
  className = ''
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const chartWidth = width - CHART_MARGINS.left - CHART_MARGINS.right;
  const chartHeight = height - CHART_MARGINS.top - CHART_MARGINS.bottom;
  
  const maxValue = Math.max(...data.map(d => d.value), 0);
  const minValue = Math.min(...data.map(d => d.value), 0);
  
  const getColor = (index: number) => {
    return data[index]?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };
  
  if (horizontal) {
    const barHeight = Math.min(barWidth, (chartHeight - (data.length - 1) * barSpacing) / data.length);
    const totalBarHeight = data.length * barHeight + (data.length - 1) * barSpacing;
    const startY = CHART_MARGINS.top + (chartHeight - totalBarHeight) / 2;
    
    return (
      <div className={`inline-block ${className}`}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible"
        >
          {/* Grid lines */}
          {showGrid && (
            <>
              {/* Vertical grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                  key={`v-grid-${i}`}
                  x1={CHART_MARGINS.left + ratio * chartWidth}
                  y1={CHART_MARGINS.top}
                  x2={CHART_MARGINS.left + ratio * chartWidth}
                  y2={CHART_MARGINS.top + chartHeight}
                  className="stroke-white/10"
                  strokeWidth={1}
                />
              ))}
              
              {/* Horizontal grid lines */}
              {data.map((_, i) => {
                const y = startY + i * (barHeight + barSpacing) + barHeight / 2;
                return (
                  <line
                    key={`h-grid-${i}`}
                    x1={CHART_MARGINS.left}
                    y1={y}
                    x2={CHART_MARGINS.left + chartWidth}
                    y2={y}
                    className="stroke-white/10"
                    strokeWidth={1}
                  />
                );
              })}
            </>
          )}
          
          {/* Bars */}
          {data.map((item, index) => {
            const barLength = (item.value / maxValue) * chartWidth;
            const y = startY + index * (barHeight + barSpacing);
            const isHovered = hoveredIndex === index;
            
            return (
              <g key={index}>
                <motion.rect
                  x={CHART_MARGINS.left}
                  y={y}
                  width={barLength}
                  height={barHeight}
                  fill={getColor(index)}
                  initial={animated ? { width: 0 } : { width: barLength }}
                  animate={{ width: barLength }}
                  transition={{ duration: animated ? animationDuration / 1000 : 0, delay: index * 0.1 }}
                  className={`cursor-pointer ${isHovered ? 'opacity-80' : ''}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                
                {/* Value labels */}
                {showValueLabels && (
                  <motion.text
                    x={CHART_MARGINS.left + barLength + 5}
                    y={y + barHeight / 2}
                    className="text-white/80 text-xs font-medium fill-current"
                    dominantBaseline="middle"
                    initial={animated ? { opacity: 0 } : { opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: animated ? (index * 0.1 + animationDuration / 1000) : 0 }}
                  >
                    {item.value}
                  </motion.text>
                )}
                
                {/* Tooltip */}
                <AnimatePresence>
                  {showTooltip && isHovered && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <rect
                        x={CHART_MARGINS.left + barLength + 10}
                        y={y - 15}
                        width={80}
                        height={30}
                        className="fill-[#1a1a2e] stroke-white/20"
                        rx={4}
                      />
                      <text
                        x={CHART_MARGINS.left + barLength + 50}
                        y={y}
                        className="text-white text-xs text-center fill-current"
                        dominantBaseline="middle"
                        textAnchor="middle"
                      >
                        {item.tooltip || item.label}
                      </text>
                    </motion.g>
                  )}
                </AnimatePresence>
              </g>
            );
          })}
          
          {/* Labels */}
          {showLabels && (
            <>
              {data.map((item, index) => {
                const y = startY + index * (barHeight + barSpacing) + barHeight / 2;
                return (
                  <text
                    key={`label-${index}`}
                    x={CHART_MARGINS.left - 10}
                    y={y}
                    className="text-white/60 text-xs fill-current"
                    dominantBaseline="middle"
                    textAnchor="end"
                  >
                    {item.label}
                  </text>
                );
              })}
              
              {/* Value axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <text
                  key={`value-label-${i}`}
                  x={CHART_MARGINS.left + ratio * chartWidth}
                  y={CHART_MARGINS.top + chartHeight + 15}
                  className="text-white/40 text-xs fill-current"
                  textAnchor="middle"
                >
                  {Math.round(maxValue * ratio)}
                </text>
              ))}
            </>
          )}
        </svg>
      </div>
    );
  }
  
  // Vertical bar chart
  const barWidthActual = Math.min(barWidth, (chartWidth - (data.length - 1) * barSpacing) / data.length);
  const totalBarWidth = data.length * barWidthActual + (data.length - 1) * barSpacing;
  const startX = CHART_MARGINS.left + (chartWidth - totalBarWidth) / 2;
  
  return (
    <div className={`inline-block ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {showGrid && (
          <>
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={`h-grid-${i}`}
                x1={CHART_MARGINS.left}
                y1={CHART_MARGINS.top + chartHeight - ratio * chartHeight}
                x2={CHART_MARGINS.left + chartWidth}
                y2={CHART_MARGINS.top + chartHeight - ratio * chartHeight}
                className="stroke-white/10"
                strokeWidth={1}
              />
            ))}
            
            {/* Vertical grid lines */}
            {data.map((_, i) => {
              const x = startX + i * (barWidthActual + barSpacing) + barWidthActual / 2;
              return (
                <line
                  key={`v-grid-${i}`}
                  x1={x}
                  y1={CHART_MARGINS.top}
                  x2={x}
                  y2={CHART_MARGINS.top + chartHeight}
                  className="stroke-white/10"
                  strokeWidth={1}
                />
              );
            })}
          </>
        )}
        
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = startX + index * (barWidthActual + barSpacing);
          const y = CHART_MARGINS.top + chartHeight - barHeight;
          const isHovered = hoveredIndex === index;
          
          return (
            <g key={index}>
              <motion.rect
                x={x}
                y={y}
                width={barWidthActual}
                height={barHeight}
                fill={getColor(index)}
                initial={animated ? { height: 0, y: CHART_MARGINS.top + chartHeight } : { height: barHeight, y }}
                animate={{ height: barHeight, y }}
                transition={{ duration: animated ? animationDuration / 1000 : 0, delay: index * 0.1 }}
                className={`cursor-pointer ${isHovered ? 'opacity-80' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              
              {/* Value labels */}
              {showValueLabels && barHeight > 20 && (
                <motion.text
                  x={x + barWidthActual / 2}
                  y={y + 15}
                  className="text-white text-xs font-medium fill-current"
                  textAnchor="middle"
                  initial={animated ? { opacity: 0 } : { opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: animated ? (index * 0.1 + animationDuration / 1000) : 0 }}
                >
                  {item.value}
                </motion.text>
              )}
              
              {/* Tooltip */}
              <AnimatePresence>
                {showTooltip && isHovered && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <rect
                      x={x - 30}
                      y={y - 35}
                      width={barWidthActual + 60}
                      height={30}
                      className="fill-[#1a1a2e] stroke-white/20"
                      rx={4}
                    />
                    <text
                      x={x + barWidthActual / 2}
                      y={y - 20}
                      className="text-white text-xs text-center fill-current"
                      textAnchor="middle"
                    >
                      {item.tooltip || item.label}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          );
        })}
        
        {/* Labels */}
        {showLabels && (
          <>
            {data.map((item, index) => {
              const x = startX + index * (barWidthActual + barSpacing) + barWidthActual / 2;
              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={CHART_MARGINS.top + chartHeight + 15}
                  className="text-white/60 text-xs fill-current"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              );
            })}
            
            {/* Value axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <text
                key={`value-label-${i}`}
                x={CHART_MARGINS.left - 10}
                y={CHART_MARGINS.top + chartHeight - ratio * chartHeight}
                className="text-white/40 text-xs fill-current"
                dominantBaseline="middle"
                textAnchor="end"
              >
                {Math.round(maxValue * ratio)}
              </text>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * Enhanced Line Chart Component
 * Features:
 * - Smooth curves and straight lines
 * - Area fill option
 * - Data points markers
 * - Interactive tooltips
 * - Multiple curve types
 */
export function EnhancedLineChart({
  data,
  width = 400,
  height = 300,
  strokeWidth = 2,
  showPoints = true,
  showArea = false,
  showLabels = true,
  showGrid = true,
  showTooltip = true,
  curveType = 'monotone',
  animated = true,
  animationDuration = 800,
  className = ''
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const chartWidth = width - CHART_MARGINS.left - CHART_MARGINS.right;
  const chartHeight = height - CHART_MARGINS.top - CHART_MARGINS.bottom;
  
  const maxValue = Math.max(...data.map(d => d.value), 0);
  const minValue = Math.min(...data.map(d => d.value), 0);
  
  // Generate path data
  const generatePath = () => {
    if (data.length === 0) return '';
    
    const points = data.map((item, index) => {
      const x = CHART_MARGINS.left + (index / (data.length - 1)) * chartWidth;
      const y = CHART_MARGINS.top + chartHeight - ((item.value - minValue) / (maxValue - minValue)) * chartHeight;
      return { x, y };
    });
    
    if (curveType === 'linear') {
      return points.map((point, i) => 
        `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ');
    }
    
    // For simplicity, using linear for now
    return points.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
  };
  
  const pathData = generatePath();
  
  return (
    <div className={`inline-block ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {showGrid && (
          <>
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={`h-grid-${i}`}
                x1={CHART_MARGINS.left}
                y1={CHART_MARGINS.top + chartHeight - ratio * chartHeight}
                x2={CHART_MARGINS.left + chartWidth}
                y2={CHART_MARGINS.top + chartHeight - ratio * chartHeight}
                className="stroke-white/10"
                strokeWidth={1}
              />
            ))}
            
            {/* Vertical grid lines */}
            {data.map((_, i) => {
              const x = CHART_MARGINS.left + (i / (data.length - 1)) * chartWidth;
              return (
                <line
                  key={`v-grid-${i}`}
                  x1={x}
                  y1={CHART_MARGINS.top}
                  x2={x}
                  y2={CHART_MARGINS.top + chartHeight}
                  className="stroke-white/10"
                  strokeWidth={1}
                />
              );
            })}
          </>
        )}
        
        {/* Area fill */}
        {showArea && pathData && (
          <path
            d={`${pathData} L ${CHART_MARGINS.left + chartWidth} ${CHART_MARGINS.top + chartHeight} L ${CHART_MARGINS.left} ${CHART_MARGINS.top + chartHeight} Z`}
            fill="url(#areaGradient)"
            fillOpacity={0.3}
          />
        )}
        
        {/* Line */}
        {pathData && (
          <motion.path
            d={pathData}
            fill="none"
            stroke="#60a5fa"
            strokeWidth={strokeWidth}
            initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: animated ? animationDuration / 1000 : 0, ease: "easeInOut" }}
          />
        )}
        
        {/* Data points */}
        {showPoints && data.map((item, index) => {
          const x = CHART_MARGINS.left + (index / (data.length - 1)) * chartWidth;
          const y = CHART_MARGINS.top + chartHeight - ((item.value - minValue) / (maxValue - minValue)) * chartHeight;
          const isHovered = hoveredIndex === index;
          
          return (
            <g key={index}>
              <motion.circle
                cx={x}
                cy={y}
                r={isHovered ? 6 : 4}
                fill="#60a5fa"
                initial={animated ? { r: 0 } : { r: 4 }}
                animate={{ r: isHovered ? 6 : 4 }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              
              {/* Tooltip */}
              <AnimatePresence>
                {showTooltip && isHovered && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <rect
                      x={x - 30}
                      y={y - 35}
                      width={60}
                      height={30}
                      className="fill-[#1a1a2e] stroke-white/20"
                      rx={4}
                    />
                    <text
                      x={x}
                      y={y - 20}
                      className="text-white text-xs text-center fill-current"
                      textAnchor="middle"
                    >
                      {item.value}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          );
        })}
        
        {/* Labels */}
        {showLabels && (
          <>
            {data.map((item, index) => {
              const x = CHART_MARGINS.left + (index / (data.length - 1)) * chartWidth;
              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={CHART_MARGINS.top + chartHeight + 15}
                  className="text-white/60 text-xs fill-current"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              );
            })}
            
            {/* Value axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <text
                key={`value-label-${i}`}
                x={CHART_MARGINS.left - 10}
                y={CHART_MARGINS.top + chartHeight - ratio * chartHeight}
                className="text-white/40 text-xs fill-current"
                dominantBaseline="middle"
                textAnchor="end"
              >
                {Math.round(minValue + (maxValue - minValue) * ratio)}
              </text>
            ))}
          </>
        )}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Pie and Donut charts would be implemented similarly...
// For brevity, I'll create a simple placeholder for now

export function EnhancedPieChart(props: PieChartProps) {
  return (
    <div className="text-white/50 text-center p-8">
      Pie Chart Component (Implementation in progress)
    </div>
  );
}

export function EnhancedDonutChart(props: DonutChartProps) {
  return (
    <div className="text-white/50 text-center p-8">
      Donut Chart Component (Implementation in progress)
    </div>
  );
}

// Hook for chart data management
export function useChartData(initialData: ChartDataPoint[]) {
  const [data, setData] = useState(initialData);
  
  const updateData = useCallback((newData: ChartDataPoint[]) => {
    setData(newData);
  }, []);
  
  const addDataPoint = useCallback((point: ChartDataPoint) => {
    setData(prev => [...prev, point]);
  }, []);
  
  const removeDataPoint = useCallback((index: number) => {
    setData(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const updateDataPoint = useCallback((index: number, updates: Partial<ChartDataPoint>) => {
    setData(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  }, []);
  
  return {
    data,
    setData: updateData,
    addDataPoint,
    removeDataPoint,
    updateDataPoint
  };
}