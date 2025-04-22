import React from 'react';

interface NamedChunkGroupRowPageProps {
  file: string;
}

export const NamedChunkGroupRowPage: React.FC<NamedChunkGroupRowPageProps> = ({ file }) => {
  return (
    <div>
      <h1>Named Chunk Group Details - {file}</h1>
    </div>
  );
}; 