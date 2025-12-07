import React, { useEffect, useRef, memo } from 'react';

interface Props {
  symbol: string;
  theme?: 'dark' | 'light';
}

const TradingChart: React.FC<Props> = memo(({ symbol, theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing script to prevent duplicates on re-render
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    // Basic symbol normalization if needed, though Dashboard handles most
    const cleanSymbol = symbol || "OANDA:XAUUSD";

    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": cleanSymbol,
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "hide_side_toolbar": false,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });

    containerRef.current.appendChild(script);
  }, [symbol, theme]);

  return (
    <div className="tradingview-widget-container w-full h-full bg-black" ref={containerRef}>
      <div className="tradingview-widget-container__widget w-full h-full"></div>
    </div>
  );
});

export default TradingChart;