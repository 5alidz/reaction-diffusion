// credit -> https://usehooks.com/useLocalStorage/

import { useState, useEffect, useRef } from 'react';

export default function useLocalStorage<T>(key: string, defaultValue: T): [T, (newValue: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  const defaultValueRef = useRef(defaultValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      const parsedItem = typeof item == 'string' ? JSON.parse(item) : defaultValueRef.current;
      setStoredValue(parsedItem);
    } catch (e) {
      console.log('cannot read item from localStorage, fallback on default value: ', e);
    }
  }, [key]);

  const setValue = (newValue: T): void => {
    try {
      setStoredValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (e) {
      console.log('cannot store value in localStorage: ', e);
    }
  };

  return [storedValue, setValue];
}
