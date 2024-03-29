import { useState, useEffect } from 'react';

const hasWindow = typeof window !== 'undefined';

type WindowDimention = { height: number; width: number };

function getWindowDimensions(): WindowDimention {
  const width = hasWindow ? window.innerWidth : null;
  const height = hasWindow ? window.innerHeight : null;
  return {
    width,
    height
  };
}

export default function useWindowDimensions(): WindowDimention {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
