import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Modal, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Artwork, NFCTag } from '@/types';
import { getArtworkById, getPublicArtworkById, getNFCTagByArtworkId, deleteArtwork, unlinkNfcTag } from '@/lib/artworks';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ArtworkDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const theme = useTheme();
    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [nfcTag, setNfcTag] = useState<NFCTag | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [fullScreenImageVisible, setFullScreenImageVisible] = useState(false);

    useEffect(() => {
        loadArtwork();
    }, [id, user]);

    // Reset image loading state when artwork changes
    useEffect(() => {
        if (artwork) {
            setImageError(false);
            setImageLoading(true);
        }
    }, [artwork?.id, artwork?.image_url]);

    // Timeout for image loading (8 seconds)
    useEffect(() => {
        if (artwork?.image_url && !imageError && imageLoading) {
            const timeout = setTimeout(() => {
                console.warn('Image loading timeout for:', artwork.image_url);
                setImageLoading(false);
                // Don't set error immediately, just stop showing loading
                // The image might still load, just slowly
            }, 8000); // 8 second timeout

            return () => clearTimeout(timeout);
        }
    }, [artwork?.image_url, imageError, imageLoading]);

    const loadArtwork = async () => {
        if (!id || typeof id !== 'string' || id === 'new') {
            // Redirect to new artwork screen if id is "new"
            if (id === 'new') {
                router.replace('/artworks/new');
            }
            return;
        }
        setLoading(true);
        setImageError(false);
        setImageLoading(true);
        try {
            // Try to get artwork - use public function first, fallback to authenticated
            let artworkData = await getPublicArtworkById(id);

            // If public fetch fails and user is authenticated, try authenticated fetch
            if (!artworkData && user) {
                artworkData = await getArtworkById(id);
            }

            setArtwork(artworkData);

            if (artworkData) {
                console.log('Artwork loaded:', artworkData.title);
                console.log('Image URL:', artworkData.image_url);
                // Only fetch NFC tag if user is authenticated (NFC tags might be private)
                if (user) {
                    const tagData = await getNFCTagByArtworkId(id);
                    setNfcTag(tagData);
                }
            }
        } catch (error) {
            console.error('Error loading artwork:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Artwork',
            'Are you sure you want to delete this artwork? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!artwork?.id) return;
                        setDeleting(true);
                        try {
                            await deleteArtwork(artwork.id);
                            Alert.alert('Success', 'Artwork deleted successfully', [
                                {
                                    text: 'OK',
                                    onPress: () => router.replace('/(tabs)/artworks'),
                                },
                            ]);
                        } catch (error: any) {
                            console.error('Error deleting artwork:', error);
                            Alert.alert('Error', error.message || 'Failed to delete artwork');
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = () => {
        if (artwork?.id) {
            router.push(`/artworks/${artwork.id}/edit`);
        }
    };

    const handleUnlinkNfc = () => {
        if (!artwork?.id) return;
        Alert.alert(
            'Unlink NFC Tag',
            'Are you sure you want to unlink this NFC tag from the artwork?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Unlink',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await unlinkNfcTag(artwork.id);
                            setNfcTag(null);
                            Alert.alert('Success', 'NFC tag unlinked successfully');
                        } catch (error: any) {
                            console.error('Error unlinking NFC tag:', error);
                            Alert.alert('Error', error.message || 'Failed to unlink NFC tag');
                        }
                    },
                },
            ]
        );
    };

    const isOwner = artwork && user && artwork.user_id === user.id;

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
                    <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textTertiary} />
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
            >
                {/* Header */}
                <View style={[styles.header, {
                    backgroundColor: theme.colors.surface,
                    borderBottomColor: theme.colors.border,
                }]}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.backButton, {
                            backgroundColor: theme.colors.surfaceMuted,
                        }]}
                    >
                        <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        Artwork Details
                    </Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Hero Image */}
                <View style={styles.imageWrapper}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            if (artwork.image_url && !imageError) {
                                setFullScreenImageVisible(true);
                            }
                        }}
                        disabled={!artwork.image_url || imageError}
                    >
                        <View style={[styles.heroImageContainer, { backgroundColor: theme.colors.surfaceMuted }]}>
                            {artwork.image_url && !imageError ? (
                                <>
                                    {imageLoading && (
                                        <View style={[styles.imageLoadingContainer, { backgroundColor: theme.colors.surfaceMuted }]}>
                                            <ActivityIndicator size="large" color={theme.colors.primary} />
                                            <Text style={[styles.imageLoadingText, { color: theme.colors.textSecondary }]}>
                                                Loading image...
                                            </Text>
                                        </View>
                                    )}
                                    <Image
                                        source={{ uri: artwork.image_url }}
                                        style={styles.heroImageContent}
                                        resizeMode="cover"
                                        onLoadStart={() => {
                                            setImageLoading(true);
                                            setImageError(false);
                                        }}
                                        onLoad={() => {
                                            setImageLoading(false);
                                            setImageError(false);
                                        }}
                                        onLoadEnd={() => {
                                            setImageLoading(false);
                                        }}
                                        onError={(error) => {
                                            console.error('Error loading image:', artwork.image_url, error);
                                            setImageError(true);
                                            setImageLoading(false);
                                        }}
                                    />
                                    {!imageLoading && (
                                        <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                                            <View style={[styles.imageOverlayBadge, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                                                <Ionicons name="expand-outline" size={18} color={theme.colors.text} />
                                                <Text style={[styles.imageOverlayText, { color: theme.colors.text }]}>
                                                    Tap to view full screen
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={styles.imagePlaceholderContainer}>
                                    <View style={[styles.placeholderIconContainer, { backgroundColor: theme.colors.surface }]}>
                                        <Ionicons name="image-outline" size={64} color={theme.colors.textTertiary} />
                                    </View>
                                    <Text style={[styles.imagePlaceholderText, { color: theme.colors.textSecondary }]}>
                                        No Image Available
                                    </Text>
                                    <Text style={[styles.imagePlaceholderSubtext, { color: theme.colors.textTertiary }]}>
                                        This artwork doesn&apos;t have an image
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Full Screen Image Modal */}
                <Modal
                    visible={fullScreenImageVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setFullScreenImageVisible(false)}
                    statusBarTranslucent
                >
                    <View style={[styles.fullScreenModal, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
                        <StatusBar hidden />
                        <SafeAreaView style={styles.fullScreenModalContent} edges={['top']}>
                            <TouchableOpacity
                                style={[styles.fullScreenCloseButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                                onPress={() => setFullScreenImageVisible(false)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={28} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.fullScreenImageContainer}>
                                {artwork.image_url && (
                                    <Image
                                        source={{ uri: artwork.image_url }}
                                        style={styles.fullScreenImage}
                                        resizeMode="contain"
                                    />
                                )}
                            </View>
                            <View style={[styles.fullScreenFooter, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                                <Text style={styles.fullScreenTitle}>{artwork.title}</Text>
                                <Text style={styles.fullScreenArtist}>{artwork.artist}</Text>
                            </View>
                        </SafeAreaView>
                    </View>
                </Modal>

                {/* Content */}
                <View style={styles.content}>
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <View style={[styles.statusBadge, {
                            backgroundColor: artwork.status === 'verified'
                                ? 'rgba(76, 175, 80, 0.1)'
                                : 'rgba(255, 152, 0, 0.1)',
                        }]}>
                            {artwork.status === 'verified' ? (
                                <>
                                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                                    <Text style={[styles.statusText, { color: theme.colors.success }]}>
                                        Verified
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="time-outline" size={16} color={theme.colors.warning} />
                                    <Text style={[styles.statusText, { color: theme.colors.warning }]}>
                                        Unverified
                                    </Text>
                                </>
                            )}
                        </View>
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            {artwork.title}
                        </Text>
                        <Text style={[styles.artist, { color: theme.colors.textSecondary }]}>
                            By {artwork.artist}
                        </Text>
                    </View>

                    {/* Metadata Card */}
                    <View style={[styles.metadataCard, {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        ...theme.shadows.base,
                    }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Details
                        </Text>
                        <View style={styles.metadata}>
                            <View style={[styles.metadataRow, { borderBottomColor: theme.colors.border }]}>
                                <View style={styles.metadataItem}>
                                    <Ionicons name="calendar-outline" size={18} color={theme.colors.textTertiary} />
                                    <Text style={[styles.metadataLabel, { color: theme.colors.textSecondary }]}>
                                        Year
                                    </Text>
                                </View>
                                <Text style={[styles.metadataValue, { color: theme.colors.text }]}>
                                    {artwork.year}
                                </Text>
                            </View>
                            <View style={[styles.metadataRow, { borderBottomColor: theme.colors.border }]}>
                                <View style={styles.metadataItem}>
                                    <Ionicons name="brush-outline" size={18} color={theme.colors.textTertiary} />
                                    <Text style={[styles.metadataLabel, { color: theme.colors.textSecondary }]}>
                                        Medium
                                    </Text>
                                </View>
                                <Text style={[styles.metadataValue, { color: theme.colors.text }]}>
                                    {artwork.medium}
                                </Text>
                            </View>
                            <View style={[styles.metadataRow, { borderBottomColor: theme.colors.border }]}>
                                <View style={styles.metadataItem}>
                                    <Ionicons name="resize-outline" size={18} color={theme.colors.textTertiary} />
                                    <Text style={[styles.metadataLabel, { color: theme.colors.textSecondary }]}>
                                        Dimensions
                                    </Text>
                                </View>
                                <Text style={[styles.metadataValue, { color: theme.colors.text }]}>
                                    {artwork.dimensions}
                                </Text>
                            </View>
                            {nfcTag && (
                                <View style={styles.metadataRow}>
                                    <View style={styles.metadataItem}>
                                        <Ionicons name="radio-outline" size={18} color={theme.colors.textTertiary} />
                                        <View style={styles.nfcTagContainer}>
                                            <Text style={[styles.metadataLabel, { color: theme.colors.textSecondary }]}>
                                                NFC Tag
                                            </Text>
                                            <Text style={[styles.nfcTagValue, { color: theme.colors.primary }]}>
                                                {nfcTag.nfc_uid}
                                            </Text>
                                        </View>
                                    </View>
                                    {isOwner && (
                                        <TouchableOpacity
                                            onPress={handleUnlinkNfc}
                                            style={[styles.unlinkButton, {
                                                backgroundColor: theme.colors.errorBackground,
                                            }]}
                                        >
                                            <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Public Actions */}
                    <View style={styles.actionsSection}>
                        <TouchableOpacity
                            style={[styles.actionButton, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                                ...theme.shadows.sm,
                            }]}
                            onPress={() => router.push(`/artworks/${artwork.id}/authenticity`)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <Ionicons name="document-text" size={22} color={theme.colors.primary} />
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                                    View Certificate
                                </Text>
                                <Text style={[styles.actionButtonSubtext, { color: theme.colors.textTertiary }]}>
                                    Digital certificate of authenticity
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                                ...theme.shadows.sm,
                            }]}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.info + '15' }]}>
                                <Ionicons name="share-outline" size={22} color={theme.colors.info} />
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                                    Share Artwork
                                </Text>
                                <Text style={[styles.actionButtonSubtext, { color: theme.colors.textTertiary }]}>
                                    Share with others
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    {/* Owner Actions */}
                    {isOwner && (
                        <View style={styles.ownerSection}>
                            <View style={styles.ownerHeader}>
                                <View style={[styles.ownerDividerLine, { backgroundColor: theme.colors.border }]} />
                                <Text style={[styles.ownerLabel, { color: theme.colors.textSecondary }]}>
                                    Owner Controls
                                </Text>
                                <View style={[styles.ownerDividerLine, { backgroundColor: theme.colors.border }]} />
                            </View>
                            <View style={styles.ownerActions}>
                                <TouchableOpacity
                                    style={[styles.ownerActionButton, {
                                        backgroundColor: theme.colors.primary,
                                        ...theme.shadows.base,
                                    }]}
                                    onPress={handleEdit}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="create-outline" size={22} color={theme.colors.textOnPrimary} />
                                    <Text style={[styles.ownerActionButtonText, { color: theme.colors.textOnPrimary }]}>
                                        Edit Artwork
                                    </Text>
                                </TouchableOpacity>
                                {!nfcTag && (
                                    <TouchableOpacity
                                        style={[styles.ownerActionButton, styles.secondaryActionButton, {
                                            backgroundColor: theme.colors.surface,
                                            borderColor: theme.colors.border,
                                            ...theme.shadows.sm,
                                        }]}
                                        onPress={() => router.push(`/artworks/link-nfc?id=${artwork.id}`)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="radio-outline" size={22} color={theme.colors.primary} />
                                        <Text style={[styles.ownerActionButtonText, { color: theme.colors.text }]}>
                                            Link NFC Tag
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.ownerActionButton, styles.deleteActionButton, {
                                        backgroundColor: theme.colors.error,
                                        ...theme.shadows.base,
                                    }]}
                                    onPress={handleDelete}
                                    disabled={deleting}
                                    activeOpacity={0.8}
                                >
                                    {deleting ? (
                                        <ActivityIndicator size="small" color={theme.colors.textOnPrimary} />
                                    ) : (
                                        <>
                                            <Ionicons name="trash-outline" size={22} color={theme.colors.textOnPrimary} />
                                            <Text style={[styles.ownerActionButtonText, { color: theme.colors.textOnPrimary }]}>
                                                Delete Artwork
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
    },
    placeholder: {
        width: 36,
    },
    imageWrapper: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },
    heroImageContainer: {
        width: '100%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 16,
    },
    heroImageContent: {
        width: '100%',
        height: '100%',
    },
    imageLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        zIndex: 1,
    },
    imageLoadingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        zIndex: 2,
    },
    imageOverlayBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    imageOverlayText: {
        fontSize: 12,
        fontWeight: '600',
    },
    imagePlaceholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 40,
    },
    placeholderIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        fontSize: 16,
        fontWeight: '600',
    },
    imagePlaceholderSubtext: {
        fontSize: 13,
        fontWeight: '400',
        textAlign: 'center',
    },
    fullScreenModal: {
        flex: 1,
    },
    fullScreenModalContent: {
        flex: 1,
    },
    fullScreenCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    fullScreenImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    fullScreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    fullScreenFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
    },
    fullScreenTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    fullScreenArtist: {
        fontSize: 16,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.8)',
    },
    content: {
        padding: 20,
        gap: 24,
    },
    titleSection: {
        gap: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 38,
        letterSpacing: -0.5,
    },
    artist: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 4,
    },
    metadataCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    metadata: {
        gap: 0,
    },
    metadataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    metadataLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    metadataValue: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
    },
    nfcTagContainer: {
        flex: 1,
    },
    nfcTagValue: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
        fontFamily: 'monospace',
    },
    unlinkButton: {
        padding: 6,
        borderRadius: 12,
    },
    actionsSection: {
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        gap: 12,
    },
    actionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTextContainer: {
        flex: 1,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    actionButtonSubtext: {
        fontSize: 13,
        fontWeight: '400',
    },
    ownerSection: {
        marginTop: 8,
        gap: 16,
    },
    ownerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ownerDividerLine: {
        flex: 1,
        height: 1,
    },
    ownerLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    ownerActions: {
        gap: 12,
    },
    ownerActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        padding: 16,
        gap: 10,
    },
    secondaryActionButton: {
        borderWidth: 1,
    },
    deleteActionButton: {
        marginTop: 4,
    },
    ownerActionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
