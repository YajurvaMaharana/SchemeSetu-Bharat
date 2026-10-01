import { DIGILOCKER_MODE, DigiLockerMode, getDigiLockerMode } from './config';
import { LiveProvider } from './liveProvider';
import { SimulatedProvider } from './simulatedProvider';
import { DigiLockerProvider } from './types';

let cachedSimulatedProvider: SimulatedProvider | null = null;
let cachedLiveProvider: LiveProvider | null = null;

export function getDigiLockerProvider(mode?: DigiLockerMode): DigiLockerProvider {
  const activeMode = mode || getDigiLockerMode();

  if (activeMode === 'live') {
    if (!cachedLiveProvider) {
      cachedLiveProvider = new LiveProvider();
    }
    return cachedLiveProvider;
  }

  if (!cachedSimulatedProvider) {
    cachedSimulatedProvider = new SimulatedProvider();
  }
  return cachedSimulatedProvider;
}
