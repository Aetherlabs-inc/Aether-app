import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { Platform, Alert } from 'react-native';

/**
 * Check if NFC is supported on the device
 */
export async function isNfcSupported(): Promise<boolean> {
  try {
    return await NfcManager.isSupported();
  } catch (error) {
    console.error('Error checking NFC support:', error);
    return false;
  }
}

/**
 * Check if NFC is enabled on the device
 */
export async function isNfcEnabled(): Promise<boolean> {
  try {
    return await NfcManager.isEnabled();
  } catch (error) {
    console.error('Error checking NFC enabled:', error);
    return false;
  }
}

/**
 * Start NFC manager
 */
export async function startNfc(): Promise<void> {
  try {
    await NfcManager.start();
  } catch (error) {
    console.error('Error starting NFC:', error);
    throw new Error('Failed to start NFC. Please make sure NFC is enabled in your device settings.');
  }
}

/**
 * Stop NFC manager
 */
export async function stopNfc(): Promise<void> {
  try {
    await NfcManager.cancelTechnologyRequest().catch(() => 0);
  } catch (error) {
    console.error('Error stopping NFC:', error);
  }
}

/**
 * Read NFC tag UID
 * Returns the UID as a string
 */
export async function readNfcTag(): Promise<string> {
  let tech: any = null;
  
  try {
    // Request NFC technology
    await NfcManager.requestTechnology(NfcTech.Ndef);
    
    // Get the tag
    const tag = await NfcManager.getTag();
    
    if (!tag) {
      throw new Error('No tag found');
    }

    // Extract UID from tag
    // The UID format varies by platform
    let uid: string = '';
    
    if (Platform.OS === 'ios') {
      // iOS: UID is in tag.id
      uid = tag.id || '';
    } else {
      // Android: UID is in tag.id as a byte array, convert to hex string
      if (Array.isArray(tag.id)) {
        uid = tag.id.map((byte: number) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
      } else if (typeof tag.id === 'string') {
        uid = tag.id.toUpperCase();
      }
    }

    if (!uid) {
      throw new Error('Could not extract UID from tag');
    }

    return uid;
  } catch (error: any) {
    console.error('Error reading NFC tag:', error);
    
    if (error.message?.includes('cancelled') || error.message?.includes('User')) {
      throw new Error('NFC scan cancelled');
    }
    
    throw new Error(error.message || 'Failed to read NFC tag. Please try again.');
  } finally {
    // Clean up
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Request NFC permissions and check availability
 */
export async function requestNfcPermission(): Promise<boolean> {
  try {
    const supported = await isNfcSupported();
    if (!supported) {
      Alert.alert(
        'NFC Not Supported',
        'Your device does not support NFC functionality.'
      );
      return false;
    }

    const enabled = await isNfcEnabled();
    if (!enabled) {
      Alert.alert(
        'NFC Disabled',
        'Please enable NFC in your device settings to scan tags.',
        [
          { text: 'OK', style: 'default' },
        ]
      );
      return false;
    }

    await startNfc();
    return true;
  } catch (error: any) {
    Alert.alert(
      'NFC Error',
      error.message || 'Failed to initialize NFC. Please check your device settings.'
    );
    return false;
  }
}

