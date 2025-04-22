import React from 'react';

interface AssetRowPageProps {
  file: string;
}

export const AssetRowPage: React.FC<AssetRowPageProps> = ({ file }) => {
  return (
    <div>
      <h1>Asset Details - {file}</h1>
    </div>
  );
}; 