import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui/Screen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useNewArtworkStore } from '@/store/useNewArtworkStore';
import { linkNfcTag } from '@/lib/artworks';
import { createCertificate } from '@/lib/certificates';
import { requestNfcPermission, readNfcTag, stopNfc, isNfcSupported } from '@/lib/nfc';

export default function Step2NfcScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);

  const {
    artworkId,
    generateCertificate,
    certificateId,
    setGenerateCertificate,
    setCertificateId,
  } = useNewArtworkStore();

  // Check NFC support on mount
  useEffect(() => {
    checkNfcSupport();
    
    // Cleanup on unmount
    return () => {
      stopNfc().catch(() => 0);
    };
  }, []);

  const checkNfcSupport = async () => {
    try {
      const supported = await isNfcSupported();
      setNfcSupported(supported);
    } catch (error) {
      console.error('Error checking NFC support:', error);
      setNfcSupported(false);
    }
  };

  // Generate certificate if user wants it
  const handleCertificateToggle = async (value: boolean) => {
    setGenerateCertificate(value);

    if (value && !certificateId && artworkId) {
      // Generate certificate immediately
      setGeneratingCertificate(true);
      try {
        // ============================================
        // DEV MODE: Supabase insertion disabled
        // ============================================
        console.log('🚧 DEV MODE: Skipping certificate creation in Supabase');
        console.log('Artwork ID:', artworkId);
        
        // Mock certificate for dev mode
        const mockCertificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        setCertificateId(mockCertificateId);
        console.log('Mock Certificate ID:', mockCertificateId);
        
        /* ========== ORIGINAL CODE (DISABLED) ==========
        const certificate = await createCertificate(artworkId, {
          generateQR: true,
          generateBlockchainHash: true,
        });
        setCertificateId(certificate.id);
        ========== END OF DISABLED CODE ========== */
      } catch (error: any) {
        console.error('Error generating certificate:', error);
        Alert.alert('Error', 'Failed to generate certificate. You can still continue.');
        setGenerateCertificate(false);
      } finally {
        setGeneratingCertificate(false);
      }
    } else if (!value) {
      setCertificateId(null);
    }
  };

  const handleLinkTag = async () => {
    if (!artworkId) {
      Alert.alert('Error', 'Artwork ID not found. Please go back and try again.');
      return;
    }

    // Check NFC support
    if (nfcSupported === false) {
      Alert.alert(
        'NFC Not Supported',
        'Your device does not support NFC functionality. You can still continue without linking an NFC tag.',
        [{ text: 'OK' }]
      );
      return;
    }

    setScanning(true);
    try {
      // Request NFC permission and check if enabled
      const hasPermission = await requestNfcPermission();
      if (!hasPermission) {
        setScanning(false);
        return;
      }

      // Show scanning instruction
      Alert.alert(
        'NFC Scanning',
        'Hold your NFC tag near the back of your device. Keep it steady until the scan completes.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: async () => {
              await stopNfc();
              setScanning(false);
            },
          },
          {
            text: 'Start Scan',
            onPress: async () => {
              try {
                // Read NFC tag
                const nfcUID = await readNfcTag();
                console.log('NFC Tag UID:', nfcUID);
                await handleNfcScan(nfcUID);
              } catch (error: any) {
                await stopNfc();
                if (error.message?.includes('cancelled')) {
                  setScanning(false);
                  return;
                }
                Alert.alert('Scan Error', error.message || 'Failed to read NFC tag. Please try again.');
                setScanning(false);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error starting NFC scan:', error);
      Alert.alert('Error', error.message || 'Failed to start NFC scanning. Please try again.');
      await stopNfc();
      setScanning(false);
    }
  };

  const handleNfcScan = async (nfcUID: string) => {
    if (!artworkId) {
      Alert.alert('Error', 'Artwork ID not found');
      await stopNfc();
      setScanning(false);
      return;
    }

    try {
      await stopNfc();
      
      // ============================================
      // DEV MODE: Supabase insertion disabled
      // ============================================
      console.log('✅ NFC Tag Scanned Successfully!');
      console.log('NFC UID:', nfcUID);
      console.log('Artwork ID:', artworkId);
      if (certificateId) {
        console.log('Certificate ID (will be linked to NFC):', certificateId);
      }
      
      // Simulate success and navigate
      const successMessage = certificateId
        ? `NFC tag linked successfully!\n\nTag UID: ${nfcUID}\nCertificate: ${certificateId}\n\n(Dev Mode - Not saved to database)`
        : `NFC tag linked successfully!\n\nTag UID: ${nfcUID}\n\n(Dev Mode - Not saved to database)`;
      
      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            setScanning(false);
            router.push('/(artworks)/new/step3-context');
          },
        },
      ]);
      
      /* ========== ORIGINAL CODE (DISABLED) ==========
      await linkNfcTag(artworkId, nfcUID);
      
      // If certificate exists, link it to the NFC tag
      // (This would typically be done via a junction table or updating NFC tag with certificate_id)
      if (certificateId) {
        // Update NFC tag with certificate reference
        // This depends on your schema - you might need to add certificate_id to nfc_tags table
        console.log('Linking certificate to NFC tag:', certificateId);
      }
      
      Alert.alert('Success', `NFC tag linked successfully!\n\nTag UID: ${nfcUID}`, [
        {
          text: 'OK',
          onPress: () => {
            setScanning(false);
            router.push('/(artworks)/new/step3-context');
          },
        },
      ]);
      ========== END OF DISABLED CODE ========== */
    } catch (error: any) {
      console.error('Error linking NFC tag:', error);
      await stopNfc();
      Alert.alert('Error', error.message || 'Failed to link NFC tag');
      setScanning(false);
    }
  };

  const handleSkip = () => {
    router.push('/(artworks)/new/step3-context');
  };

  return (
    <Screen edges={['top']}>
      <View
        style={[
          styles.container,
          {
            paddingHorizontal: theme.spacing.screenPaddingHorizontal,
            paddingTop: theme.spacing['2xl'],
            paddingBottom: theme.spacing['2xl'],
          },
        ]}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                fontSize: theme.typography.heading1.fontSize,
                fontWeight: theme.typography.heading1.fontWeight,
                color: theme.colors.text,
                marginBottom: theme.spacing.base,
              },
            ]}
          >
            Certificate & NFC
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing['2xl'],
              },
            ]}
          >
            Step 2 of 3
          </Text>
        </View>

        <View style={styles.content}>
          {/* Certificate Generation Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.card,
                padding: theme.spacing.base,
                marginBottom: theme.spacing['2xl'],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={32}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.sectionContent}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      fontSize: theme.typography.heading2.fontSize,
                      fontWeight: theme.typography.heading2.fontWeight,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.xs,
                    },
                  ]}
                >
                  Generate Certificate
                </Text>
                <Text
                  style={[
                    styles.sectionDescription,
                    {
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                      marginBottom: theme.spacing.base,
                    },
                  ]}
                >
                  Create a digital certificate of authenticity with QR code and blockchain hash.
                </Text>
              </View>
              <Switch
                value={generateCertificate}
                onValueChange={handleCertificateToggle}
                disabled={generatingCertificate}
                trackColor={{
                  false: theme.colors.surfaceMuted,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.surface}
              />
            </View>
            {generatingCertificate && (
              <View style={styles.generatingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.generatingText,
                    {
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                      marginLeft: theme.spacing.sm,
                    },
                  ]}
                >
                  Generating certificate...
                </Text>
              </View>
            )}
            {certificateId && (
              <View
                style={[
                  styles.certificateInfo,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderRadius: theme.borderRadius.base,
                    padding: theme.spacing.sm,
                    marginTop: theme.spacing.base,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={theme.colors.success}
                  style={{ marginRight: theme.spacing.xs }}
                />
                <Text
                  style={[
                    styles.certificateIdText,
                    {
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.text,
                      fontFamily: 'monospace',
                    },
                  ]}
                >
                  {certificateId}
                </Text>
              </View>
            )}
          </View>

          {/* NFC Tag Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.card,
                padding: theme.spacing.base,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  borderRadius: theme.borderRadius.full,
                  width: 100,
                  height: 100,
                  marginBottom: theme.spacing.base,
                  alignSelf: 'center',
                },
              ]}
            >
              <Ionicons
                name="nfc-outline"
                size={56}
                color={theme.colors.primary}
              />
            </View>

            <Text
              style={[
                styles.question,
                {
                  fontSize: theme.typography.heading2.fontSize,
                  fontWeight: theme.typography.heading2.fontWeight,
                  color: theme.colors.text,
                  marginBottom: theme.spacing.sm,
                  textAlign: 'center',
                },
              ]}
            >
              Link NFC Tag
            </Text>

            <Text
              style={[
                styles.description,
                {
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.textSecondary,
                  marginBottom: theme.spacing.base,
                  textAlign: 'center',
                  lineHeight: theme.typography.lineHeight.relaxed,
                },
              ]}
            >
              {certificateId
                ? 'Link an NFC tag to your artwork. The certificate will be automatically associated with the tag.'
                : 'Link an NFC tag to verify and authenticate your artwork using near-field communication.'}
            </Text>

            {nfcSupported === false && (
              <View
                style={[
                  styles.note,
                  {
                    backgroundColor: theme.colors.errorBackground || theme.colors.surfaceMuted,
                    borderRadius: theme.borderRadius.base,
                    padding: theme.spacing.sm,
                    marginTop: theme.spacing.base,
                  },
                ]}
              >
                <Ionicons
                  name="warning-outline"
                  size={16}
                  color={theme.colors.error}
                  style={{ marginRight: theme.spacing.xs }}
                />
                <Text
                  style={[
                    styles.noteText,
                    {
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.error,
                      flex: 1,
                    },
                  ]}
                >
                  NFC is not supported on this device. You can skip this step.
                </Text>
              </View>
            )}
            {nfcSupported === true && Platform.OS === 'ios' && (
              <View
                style={[
                  styles.note,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderRadius: theme.borderRadius.base,
                    padding: theme.spacing.sm,
                    marginTop: theme.spacing.base,
                  },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={theme.colors.textSecondary}
                  style={{ marginRight: theme.spacing.xs }}
                />
                <Text
                  style={[
                    styles.noteText,
                    {
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textSecondary,
                      flex: 1,
                    },
                  ]}
                >
                  Make sure NFC is enabled in your device settings.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={scanning ? 'Scanning...' : nfcSupported === false ? 'NFC Not Available' : 'Link Tag Now'}
            onPress={handleLinkTag}
            loading={scanning}
            disabled={scanning || loading || generatingCertificate || nfcSupported === false}
            style={{ marginBottom: theme.spacing.base }}
          />
          <PrimaryButton
            title="Skip for Later"
            onPress={handleSkip}
            variant="outline"
            disabled={scanning || loading || generatingCertificate}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionIconContainer: {
    marginRight: 12,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionDescription: {
    marginBottom: 8,
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  generatingText: {
    marginLeft: 8,
  },
  certificateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  certificateIdText: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteText: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
  },
});
