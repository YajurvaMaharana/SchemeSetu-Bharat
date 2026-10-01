/**
 * DigiLocker Configuration Module
 * Controls adapter mode: 'simulated' (default) vs 'live' (OAuth 2.0 PKCE via API Setu)
 */

export type DigiLockerMode = 'simulated' | 'live';

// Single config flag: default is 'simulated'
// Can be toggled via environment variable VITE_DIGILOCKER_MODE or at runtime
const envMode = (
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_DIGILOCKER_MODE
    ? import.meta.env.VITE_DIGILOCKER_MODE
    : 'simulated'
).toLowerCase();

let currentMode: DigiLockerMode = envMode === 'live' ? 'live' : 'simulated';

export const DIGILOCKER_MODE: DigiLockerMode = currentMode;

export function getDigiLockerMode(): DigiLockerMode {
  return currentMode;
}

export function setDigiLockerMode(mode: DigiLockerMode): void {
  currentMode = mode;
}

export function isSimulatedMode(): boolean {
  return currentMode === 'simulated';
}

export function isLiveMode(): boolean {
  return currentMode === 'live';
}

/**
 * UI Badge Label helper according to requirement:
 * "The UI must show the label 'Simulated' when in simulated mode and 'Connected to DigiLocker' only when live."
 */
export function getDigiLockerBadgeLabel(customSimulatedSuffix = ''): string {
  if (isLiveMode()) {
    return 'Connected to DigiLocker';
  }
  return customSimulatedSuffix ? `Simulated ${customSimulatedSuffix}` : 'Simulated';
}
