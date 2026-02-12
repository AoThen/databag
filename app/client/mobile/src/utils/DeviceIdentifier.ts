import { getUniqueId } from 'react-native-device-info';
import { LocalStore } from '../LocalStore';

const DEVICE_ID_KEY = 'device_id';
const SETTINGS_DB = 'device_v001.db';

export class DeviceIdentifier {
  private static instance: DeviceIdentifier | null = null;
  private localStore: LocalStore | null = null;
  private cachedId: string | null = null;

  private constructor() {
    this.localStore = new LocalStore();
  }

  static getInstance(): DeviceIdentifier {
    if (DeviceIdentifier.instance === null) {
      DeviceIdentifier.instance = new DeviceIdentifier();
    }
    return DeviceIdentifier.instance;
  }

  async initialize(): Promise<void> {
    if (this.localStore) {
      await this.localStore.open(SETTINGS_DB);
    }
  }

  async getDeviceId(): Promise<string> {
    if (this.cachedId) {
      return this.cachedId;
    }

    try {
      // Try to get stored device ID first
      if (this.localStore) {
        const storedId = await this.localStore.get(DEVICE_ID_KEY, '');
        if (storedId && storedId.length > 0) {
          this.cachedId = storedId;
          return storedId;
        }
      }

      // Generate new device ID using react-native-device-info
      const newId = await getUniqueId();

      // Store for future use
      if (this.localStore && newId) {
        await this.localStore.set(DEVICE_ID_KEY, newId);
      }

      this.cachedId = newId;
      return newId;
    } catch (err) {
      // Fallback: generate a simple UUID-like ID
      const fallbackId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('[DeviceIdentifier] Failed to get device ID, using fallback:', err);
      return fallbackId;
    }
  }

  async clearDeviceId(): Promise<void> {
    if (this.localStore) {
      await this.localStore.set(DEVICE_ID_KEY, '');
    }
    this.cachedId = null;
  }

  static async shutdown(): Promise<void> {
    if (DeviceIdentifier.instance?.localStore) {
      DeviceIdentifier.instance.localStore = null;
      DeviceIdentifier.instance = null;
    }
  }
}

export async function getDeviceId(): Promise<string> {
  const instance = DeviceIdentifier.getInstance();
  await instance.initialize();
  return instance.getDeviceId();
}
