import { useEffect, useRef } from 'react';

export function useDocumentEvent<T extends keyof DocumentEventMap>(
  type: T,
  callback: (this: Document, e: DocumentEventMap[T]) => void
) {
  const handler = useRef(callback);

  useEffect(() => {
    handler.current = callback;
  });

  useEffect(() => {
    function internalHandler(this: Document, e: DocumentEventMap[T]) {
      handler.current.call(this, e);
    }
    document.addEventListener(type, internalHandler);
    return () => {
      document.removeEventListener(type, internalHandler);
    };
  }, [type]);
}

export function useWindowEvent<T extends keyof WindowEventMap>(
  type: T,
  callback: (this: Window, e: WindowEventMap[T]) => void
) {
  const handler = useRef(callback);

  useEffect(() => {
    handler.current = callback;
  });

  useEffect(() => {
    function internalHandler(this: Window, e: WindowEventMap[T]) {
      handler.current.call(this, e);
    }
    window.addEventListener(type, internalHandler);
    return () => {
      window.removeEventListener(type, internalHandler);
    };
  }, [type]);
}
