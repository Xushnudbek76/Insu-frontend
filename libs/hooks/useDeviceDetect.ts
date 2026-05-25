import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 768px)";

const useDeviceDetect = (): "mobile" | "desktop" => {
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const updateDevice = () => {
      setDevice(mediaQuery.matches ? "mobile" : "desktop");
    };

    updateDevice();
    mediaQuery.addEventListener("change", updateDevice);

    return () => {
      mediaQuery.removeEventListener("change", updateDevice);
    };
  }, []);

  return device;
};

export default useDeviceDetect;
