import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

type Device = 'mobile' | 'desktop';

let cachedDevice: Device | null = null;

const getDevice = (mediaQuery: MediaQueryList): Device =>
  mediaQuery.matches ? 'mobile' : 'desktop';

const useDeviceDetect = (): Device | null => {
  const [device, setDevice] = useState<Device | null>(cachedDevice);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const updateDevice = () => {
      const nextDevice = getDevice(mediaQuery);
      cachedDevice = nextDevice;
      setDevice(nextDevice);
    };

    updateDevice();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateDevice);
    } else {
      mediaQuery.addListener(updateDevice);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateDevice);
      } else {
        mediaQuery.removeListener(updateDevice);
      }
    };
  }, []);

  return device;
};

export default useDeviceDetect;
