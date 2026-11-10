import FloatingPet from '@/components/pet/FloatingPet';
import FullscreenPet from '@/components/pet/FullscreenPet';
import { usePet } from '@/lib/PetContext';

export default function PetModes() {
  const { mode } = usePet();
  if (mode === 'float') return <FloatingPet />;
  if (mode === 'full') return <FullscreenPet />;
  return null;
}