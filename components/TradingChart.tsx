import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode, IChartApi, ISeriesApi } from 'lightweight-charts';
import { TradeSignal } from '../types';

interface Props {
  symbol: string;
  signal?: TradeSignal | null;
  theme?: 'dark' | 'light';
}

const TradingChart: React.FC<Props> = ({ symbol, signal, theme = 'dark' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#666',
      },
      grid: {
        vertLines: { color: '#111' },
        horzLines: { color: '#111' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#333',
      },
      timeScale: {
        borderColor: '#333',
        timeVisible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    chartRef.current = chart;

    // 2. Create Series
    const series = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    seriesRef.current = series;

    // 3. Generate Initial Data
    // If we have a signal, we center price around signal.entry. 
    // If not, we use a default price (e.g., Gold price ~2000)
    const startPrice = signal ? signal.entry : 2030.50;
    const initialData = generateInitialData(startPrice);
    series.setData(initialData);

    // 4. Draw Signal Lines if Signal Exists
    if (signal) {
      // ENTRY
      series.createPriceLine({
        price: signal.entry,
        color: '#ffffff',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'ENTRY',
      });

      // STOP LOSS
      series.createPriceLine({
        price: signal.sl,
        color: '#ef4444',
        lineWidth: 2,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: `SL (-${signal.slPips}p)`,
      });

      // TP 1
      series.createPriceLine({
        price: signal.tp1,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: 0, 
        axisLabelVisible: true,
        title: 'TP 1',
      });

      // TP 2
      series.createPriceLine({
        price: signal.tp2,
        color: '#10b981',
        lineWidth: 1,
        lineStyle: 2, 
        axisLabelVisible: true,
        title: 'TP 2',
      });
    }

    // 5. Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    // 6. Simulate Live Feed
    const intervalId = setInterval(() => {
        const lastCandle = initialData[initialData.length - 1];
        const lastTime = lastCandle.time as number;
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Only add new candle every minute in "simulation time", or update current
        // For visual effect, we'll update the 'close' of the last candle to simulate ticking
        const volatility = 0.5;
        const change = (Math.random() - 0.5) * volatility;
        const newClose = lastCandle.close + change;
        
        // Bias towards TP if signal exists
        let bias = 0;
        if (signal) {
            const distToTp = signal.tp1 - lastCandle.close;
            bias = distToTp * 0.05; // 5% pull towards TP
        }
        
        const biasedClose = newClose + (bias * Math.random());

        const updatedCandle = {
            ...lastCandle,
            close: biasedClose,
            high: Math.max(lastCandle.high, biasedClose),
            low: Math.min(lastCandle.low, biasedClose),
        };

        series.update(updatedCandle);
    }, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(intervalId);
      chart.remove();
    };
  }, [symbol, signal]);

  // Helper to generate realistic candle data
  function generateInitialData(startPrice: number) {
    let price = startPrice;
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    // Generate 100 candles going back in time
    for (let i = 100; i > 0; i--) {
        const time = now - (i * 900); // 15 min candles
        const volatility = startPrice * 0.001; // 0.1% volatility
        const change = (Math.random() - 0.5) * volatility * 2;
        const close = price + change;
        const high = Math.max(price, close) + Math.random() * volatility;
        const low = Math.min(price, close) - Math.random() * volatility;
        
        data.push({
            time,
            open: price,
            high,
            low,
            close,
        });
        price = close;
    }
    // Adjust last candle to match startPrice exactly for smooth transition
    data[data.length - 1].close = startPrice;
    
    return data;
  }

  return (
    <div className="w-full h-full relative group">
        <div ref={chartContainerRef} className="w-full h-full" />
        
        {/* Watermark */}
        <div className="absolute top-4 left-4 pointer-events-none opacity-20">
            <h3 className="text-4xl font-black text-gray-500">{symbol.split(':')[1] || symbol}</h3>
        </div>

        {/* Live Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-green-500 border border-green-900">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            LIVE FEED
        </div>
    </div>
  );
};

export default TradingChart;