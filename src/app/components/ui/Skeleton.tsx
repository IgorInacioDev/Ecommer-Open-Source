import React from 'react';
import { cn } from '@/app/utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div 
      className={cn('animate-pulse bg-gray-200 rounded', className)}
      aria-label="Carregando..."
    />
  );
};

export default Skeleton;