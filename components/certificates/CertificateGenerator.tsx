import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Card } from '@/components/ui/Card';
import { createCertificate } from '@/lib/certificates';
import { Certificate } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface CertificateGeneratorProps {
  artworkId: string;
  onCertificateGenerated?: (certificate: Certificate) => void;
  existingCertificate?: Certificate | null;
}

export function CertificateGenerator({
  artworkId,
  onCertificateGenerated,
  existingCertificate,
}: CertificateGeneratorProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(existingCertificate || null);

  const handleGenerate = async () => {
    if (!artworkId) {
      Alert.alert('Error', 'Artwork ID is required');
      return;
    }

    setLoading(true);
    try {
      // ============================================
      // DEV MODE: Supabase insertion disabled
      // ============================================
      console.log('🚧 DEV MODE: Skipping certificate creation in Supabase');
      console.log('Artwork ID:', artworkId);
      
      // Mock certificate for dev mode
      const mockCertificate: Certificate = {
        id: `mock-cert-${Date.now()}`,
        artwork_id: artworkId,
        certificate_id: `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=mock-cert-${Date.now()}`,
        blockchain_hash: `0x${Math.random().toString(16).substring(2)}`,
        generated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setCertificate(mockCertificate);
      onCertificateGenerated?.(mockCertificate);
      Alert.alert('Success', 'Certificate generated successfully! (Dev Mode)');
      
      /* ========== ORIGINAL CODE (DISABLED) ==========
      const newCertificate = await createCertificate(artworkId, {
        generateQR: true,
        generateBlockchainHash: true,
      });
      
      setCertificate(newCertificate);
      onCertificateGenerated?.(newCertificate);
      Alert.alert('Success', 'Certificate generated successfully!');
      ========== END OF DISABLED CODE ========== */
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      Alert.alert('Error', error.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  if (certificate) {
    return (
      <Card>
        <View style={styles.certificateContainer}>
          <View
            style={[
              styles.successIcon,
              {
                backgroundColor: theme.colors.success + '20',
                borderRadius: theme.borderRadius.full,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={48}
              color={theme.colors.success}
            />
          </View>
          
          <Text
            style={[
              styles.certificateTitle,
              {
                fontSize: theme.typography.heading2.fontSize,
                fontWeight: theme.typography.heading2.fontWeight,
                color: theme.colors.text,
                marginTop: theme.spacing.base,
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            Certificate Generated
          </Text>
          
          <Text
            style={[
              styles.certificateId,
              {
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.textSecondary,
                fontFamily: 'monospace',
                marginBottom: theme.spacing.base,
              },
            ]}
          >
            {certificate.certificate_id}
          </Text>

          {certificate.qr_code_url && (
            <View style={styles.qrContainer}>
              <Text
                style={[
                  styles.qrLabel,
                  {
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
              >
                QR Code
              </Text>
              {/* QR Code would be displayed here - using a placeholder for now */}
              <View
                style={[
                  styles.qrPlaceholder,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderRadius: theme.borderRadius.base,
                  },
                ]}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={120}
                  color={theme.colors.textTertiary}
                />
                <Text
                  style={[
                    styles.qrPlaceholderText,
                    {
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textTertiary,
                      marginTop: theme.spacing.sm,
                    },
                  ]}
                >
                  QR Code Available
                </Text>
              </View>
            </View>
          )}

          {certificate.blockchain_hash && (
            <View
              style={[
                styles.hashContainer,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  borderRadius: theme.borderRadius.base,
                  padding: theme.spacing.base,
                  marginTop: theme.spacing.base,
                },
              ]}
            >
              <Text
                style={[
                  styles.hashLabel,
                  {
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                    marginBottom: theme.spacing.xs,
                  },
                ]}
              >
                Blockchain Hash
              </Text>
              <Text
                style={[
                  styles.hashValue,
                  {
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text,
                    fontFamily: 'monospace',
                  },
                ]}
                numberOfLines={2}
              >
                {certificate.blockchain_hash}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.generatedAt,
              {
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textTertiary,
                marginTop: theme.spacing.base,
              },
            ]}
          >
            Generated: {new Date(certificate.generated_at || '').toLocaleDateString()}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.borderRadius.full,
            },
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={48}
            color={theme.colors.primary}
          />
        </View>

        <Text
          style={[
            styles.title,
            {
              fontSize: theme.typography.heading2.fontSize,
              fontWeight: theme.typography.heading2.fontWeight,
              color: theme.colors.text,
              marginTop: theme.spacing.base,
              marginBottom: theme.spacing.sm,
            },
          ]}
        >
          Generate Certificate
        </Text>

        <Text
          style={[
            styles.description,
            {
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing['2xl'],
              textAlign: 'center',
              lineHeight: theme.typography.lineHeight.relaxed,
            },
          ]}
        >
          Create a digital certificate of authenticity for this artwork. The certificate will
          include a unique ID, QR code, and blockchain hash for verification.
        </Text>

        <PrimaryButton
          title={loading ? 'Generating...' : 'Generate Certificate'}
          onPress={handleGenerate}
          loading={loading}
          disabled={loading}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  certificateContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  successIcon: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificateTitle: {
    textAlign: 'center',
  },
  certificateId: {
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  qrLabel: {
    textAlign: 'center',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholderText: {
    textAlign: 'center',
  },
  hashContainer: {
    width: '100%',
  },
  hashLabel: {
    fontWeight: '600',
  },
  hashValue: {
    textAlign: 'left',
  },
  generatedAt: {
    textAlign: 'center',
  },
});

