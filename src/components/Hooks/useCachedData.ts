import { useState, useEffect } from "react";

export function useCachedData<T>(data: T | undefined): T | null {
  const [cachedData, setCachedData] = useState<T | null>(null);

  useEffect(() => {
    if (data) {
      setCachedData(data);
    }
  }, [data]);

  return cachedData;
}
