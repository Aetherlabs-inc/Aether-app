import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function NewArtworkIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(artworks)/new/step1-basic');
  }, []);

  return null;
}

