import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { getArtworkById, getPublicArtworkById, getNFCTagByArtworkId } from '@/lib/artworks';
import { getCertificateByArtworkId } from '@/lib/certificates';
import { Artwork, NFCTag, Certificate } from '@/types';

export default function AuthenticityCertificateScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [nfcTag, setNfcTag] = useState<NFCTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id || typeof id !== 'string') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Try public first, then authenticated
      let artworkData = await getPublicArtworkById(id);
      if (!artworkData) {
        artworkData = await getArtworkById(id);
      }

      setArtwork(artworkData);

      if (artworkData) {
        const [certData, tagData] = await Promise.all([
          getCertificateByArtworkId(id),
          getNFCTagByArtworkId(id),
        ]);
        setCertificate(certData);
        setNfcTag(tagData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!artwork) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>Artwork not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.textOnPrimary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Certificate Header with Shiny Background */}
        <View style={[styles.certificateHeaderGradient, {
          backgroundColor: '#1a1a3e',
        }]}>
          <View style={styles.certificateHeader}>
            {/* AetherLabs Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            {/* Seal with Shiny Background */}
            <View style={[styles.sealGradient, {
              backgroundColor: '#f5f5f5',
            }]}>
              <View style={[styles.sealContainer, { borderColor: theme.colors.primary }]}>
                <Ionicons name="shield-checkmark" size={40} color={theme.colors.primary} />
              </View>
            </View>
            
            <Text style={[styles.certificateTitle, { color: '#ffffff' }]}>
              CERTIFICATE OF AUTHENTICITY
            </Text>
            <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <Text style={[styles.brandText, { color: 'rgba(255,255,255,0.8)' }]}>
              AETHERLABS
            </Text>
          </View>
        </View>

        {/* Artwork Image */}
        {artwork.image_url && !imageError && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: artwork.image_url }}
              style={styles.artworkImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          </View>
        )}

        {/* Certificate Body with Shiny Background */}
        <View style={[styles.certificateBodyGradient, {
          backgroundColor: '#fafafa',
        }]}>
          <View style={[styles.certificateBody, {
            backgroundColor: 'transparent',
            borderColor: theme.colors.border,
            ...theme.shadows.base,
          }]}>
          {/* Artwork Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              ARTWORK INFORMATION
            </Text>
            <View style={[styles.sectionDivider, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.artworkInfo}>
              <Text style={[styles.artworkTitle, { color: theme.colors.text }]}>
                {artwork.title}
              </Text>
              <Text style={[styles.artworkArtist, { color: theme.colors.textSecondary }]}>
                by {artwork.artist}
              </Text>
            </View>
          </View>

          {/* Technical Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              TECHNICAL DETAILS
            </Text>
            <View style={[styles.sectionDivider, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Year of Creation:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {artwork.year}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Medium:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {artwork.medium}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Dimensions:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {artwork.dimensions}
                </Text>
              </View>
            </View>
          </View>

          {/* Authentication */}
          {certificate && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                AUTHENTICATION
              </Text>
              <View style={[styles.sectionDivider, { backgroundColor: theme.colors.border }]} />
              
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Certificate ID:
                  </Text>
                  <Text style={[styles.detailValue, styles.monospace, { color: theme.colors.primary }]}>
                    {certificate.certificate_id}
                  </Text>
                </View>
                {certificate.blockchain_hash && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                      Blockchain Hash:
                    </Text>
                    <Text style={[styles.detailValue, styles.monospace, { color: theme.colors.text }]} numberOfLines={1}>
                      {certificate.blockchain_hash}
                    </Text>
                  </View>
                )}
                {nfcTag && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                      NFC Tag UID:
                    </Text>
                    <Text style={[styles.detailValue, styles.monospace, { color: theme.colors.primary }]}>
                      {nfcTag.nfc_uid}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Status */}
          <View style={styles.statusSection}>
            {artwork.status === 'verified' ? (
              <View style={[styles.verifiedBadge, {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderColor: theme.colors.success,
              }]}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <Text style={[styles.verifiedText, { color: theme.colors.success }]}>
                  VERIFIED AUTHENTIC
                </Text>
              </View>
            ) : (
              <View style={[styles.verifiedBadge, {
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                borderColor: theme.colors.warning,
              }]}>
                <Ionicons name="time-outline" size={20} color={theme.colors.warning} />
                <Text style={[styles.verifiedText, { color: theme.colors.warning }]}>
                  PENDING VERIFICATION
                </Text>
              </View>
            )}
          </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            This certificate verifies the authenticity of the artwork listed above.
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            Scan the NFC tag or QR code to verify this certificate.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  certificateHeaderGradient: {
    width: '100%',
    paddingTop: 40,
    paddingBottom: 32,
    marginBottom: 24,
  },
  certificateHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 60,
    height: 60,
  },
  sealGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sealContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  brandText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  divider: {
    width: 80,
    height: 2,
  },
  imageContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  artworkImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  certificateBodyGradient: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  certificateBody: {
    borderRadius: 16,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  sectionDivider: {
    width: '100%',
    height: 1,
    marginBottom: 16,
  },
  artworkInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  artworkTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  artworkArtist: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
    fontFamily: 'monospace',
  },
  detailsList: {
    gap: 12,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'monospace',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  monospace: {
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  statusSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    gap: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'monospace',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

