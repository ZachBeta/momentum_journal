import React from 'react';

interface ThreePanelLayoutProps {
  leftPanel: React.ReactNode;
  mainPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export default function ThreePanelLayout({
  leftPanel,
  mainPanel,
  rightPanel,
}: ThreePanelLayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r border-gray-200">{leftPanel}</div>
      <div className="flex-1">{mainPanel}</div>
      <div className="w-80 border-l border-gray-200">{rightPanel}</div>
    </div>
  );
}
