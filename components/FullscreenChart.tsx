'use client'

import { useState, useEffect } from 'react';
import TradingViewWidget from '@/components/TradingViewWidget';

type FullscreenChartProps = {
  scriptUrl: string;
  config: Record<string, unknown>;
  height: number;
  title?: string;
};

export default function FullscreenChart({ scriptUrl, config, height, title }: FullscreenChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenHeight, setFullscreenHeight] = useState(800);

  useEffect(() => {
    if (isFullscreen) {
      setFullscreenHeight(window.innerHeight - 100);
    }
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 z-10 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
        >
          ⛶ Fullscreen
        </button>
        <TradingViewWidget scriptUrl={scriptUrl} config={config} height={height} />
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
          <div className="flex justify-end p-4">
            <button
              onClick={toggleFullscreen}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              ✕ Close Fullscreen
            </button>
          </div>
          <div className="flex-1 px-4 pb-4">
            <TradingViewWidget 
              scriptUrl={scriptUrl} 
              config={{...config, width: '100%', height: fullscreenHeight}} 
              height={fullscreenHeight} 
            />
          </div>
        </div>
      )}
    </>
  );
}
