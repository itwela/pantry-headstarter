'use client'

import React, { createContext, useState, useContext } from 'react';

interface PantryContextType {
  name?: string;
  isVisible: boolean;
  currentId?: string
  currentItem?: string
  currentQuantity?: number
  setName?: (value: string) => void;
  setCurrentId?: (value: string) => void
  setIsVisible: (value: boolean) => void;
  setCurrentItem?: (value: string) => void
  setCurrentQuantity?: (value: number) => void
}

const PantryContext = createContext<PantryContextType | null>(null);

export const PantryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [name, setName] = useState<string>('Itwela');
  const [isVisible, setIsVisible] = useState(false);
  const [currentId, setCurrentId ] = useState('');
  const [currentItem, setCurrentItem ] = useState('');
  const [currentQuantity, setCurrentQuantity ] = useState(0);

  return (
    <PantryContext.Provider value={{
      name,
      isVisible,
      currentId,
      currentItem,
      currentQuantity,
      setName,
      setCurrentId,
      setIsVisible,
      setCurrentItem,
      setCurrentQuantity
    }}>
      {children}
    </PantryContext.Provider>
  );
};

export const usePantry = () => {
  const context = useContext(PantryContext);
  if (!context) throw new Error('usePantry must be used within a PantryProvider');
  return context;
};
