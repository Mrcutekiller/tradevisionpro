import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, ISeriesApi, IChartApi } from 'lightweight-charts';
import { TradeSignal } from '../types';

interface Props {
  data: { time: number; value: number }[];
  signal: TradeSignal | null;
}

const TradingChart: React.FC<Props> = ({ data, signal }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const toolTipRef = useRef<HTMLDivElement>(null);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b7280',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: {
        vertLines: { color: 'rgba(55, 65, 81, 0.2)' },
        horzLines: { color: 'rgba(55, 65, 81, 0.2)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(55, 65, 81, 0.5)',
      },
      timeScale: {
        borderColor: 'rgba(55, 65, 81, 0.5)',
        timeVisible: true,
        secondsVisible: true,
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
        vertLine: {
            color: '#00bcd4',
            width: 1,
            style: 3,
            labelBackgroundColor: '#00bcd4',
        },
        horzLine: {
            color: '#00bcd4',
            width: 1,
            style: 3,
            labelBackgroundColor: '#00bcd4',
        },
      }
    });

    const series = chart.addAreaSeries({
      topColor: 'rgba(0, 188, 212, 0.4)',
      bottomColor: 'rgba(0, 188, 212, 0.0)',
      lineColor: '#00bcd4',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Tooltip Logic
    chart.subscribeCrosshairMove((param) => {
      const container = chartContainerRef.current;
      const tooltip = toolTipRef.current;
      if (!container || !tooltip || !seriesRef.current) return;

      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        tooltip.style.display = 'none';
        return;
      }

      tooltip.style.display = 'block';
      
      const price = param.seriesData.get(seriesRef.current) as any;
      const priceValue = price?.value || 0;
      
      // Formatting
      const dateStr = new Date((param.time as number) * 1000).toLocaleTimeString();
      const priceStr = priceValue.toFixed(2);

      let signalInfo = '';
      if (signal) {
         signalInfo = `
            <div class="mt-2 pt-2 border-t border-gray-700">
               <div class="flex items-center gap-1 text-[10px] text-cyber-400 font-bold uppercase tracking-wider">
                  Signal Active: ${signal.pair}
               </div>
               <div class="text-[9px] text-gray-500">TP1: ${signal.tp1} • SL: ${signal.sl}</div>
            </div>
         `;
      }

      tooltip.innerHTML = `
        <div class="font-mono text-xs">
           <div class="text-gray-400 mb-1">${dateStr}</div>
           <div class="text-white font-bold text-sm">$${priceStr}</div>
           ${signalInfo}
        </div>
      `;

      // Positioning
      const toolTipWidth = 140; 
      const toolTipHeight = 100; // Approx max height
      const margin = 15;

      let left = param.point.x + margin;
      if (left > container.clientWidth - toolTipWidth) {
        left = param.point.x - margin - toolTipWidth;
      }

      let top = param.point.y + margin;
      if (top > container.clientHeight - toolTipHeight) {
        top = param.point.y - toolTipHeight - margin;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [signal]); // Re-bind if signal changes to update tooltip content logic

  // Update Data
  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(data);
      if (data.length > 0) {
          // Keep the chart scrolled to the right
          chartRef.current?.timeScale().scrollToPosition(0, false);
      }
    }
  }, [data]);

  // Update Signal Lines (Entry/SL/TP)
  useEffect(() => {
    if (!seriesRef.current || !signal) return;

    const series = seriesRef.current;
    
    // Entry Line
    series.createPriceLine({
        price: signal.entry,
        color: '#ffffff',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'ENTRY',
    });

    // TP1
    series.createPriceLine({
        price: signal.tp1,
        color: '#4ade80', // green-400
        lineWidth: 1,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: 'TP 1',
    });

    // TP2
    series.createPriceLine({
        price: signal.tp2,
        color: '#22c55e', // green-500
        lineWidth: 1,
        lineStyle: 2, 
        axisLabelVisible: true,
        title: 'TP 2',
    });

    // SL
    series.createPriceLine({
        price: signal.sl,
        color: '#ef4444', // red-500
        lineWidth: 1,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'STOP',
    });

    // Fit Scale
    chartRef.current?.timeScale().fitContent();

  }, [signal]);

  return (
    <div className="w-full h-full relative group">
        <div ref={chartContainerRef} className="w-full h-full" />
        {/* Custom Tooltip Element */}
        <div 
           ref={toolTipRef} 
           className="absolute z-20 hidden pointer-events-none bg-black/90 backdrop-blur-md border border-cyber-500/30 rounded-lg p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-opacity duration-75"
        />
        
        {signal && (
             <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h4 className="text-3xl font-black text-white/10 group-hover:text-white/20 transition-colors uppercase tracking-tighter">
                    {signal.pair}
                </h4>
             </div>
        )}
    </div>
  );
};

export default TradingChart;