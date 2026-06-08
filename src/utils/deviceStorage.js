const DEVICES_KEY = "devices";

/** localStorage'dan güncel cihaz listesini okur (tek kaynak). */
export function loadDevices() {
  try {
    const saved = localStorage.getItem(DEVICES_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDevices(devices) {
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
}
