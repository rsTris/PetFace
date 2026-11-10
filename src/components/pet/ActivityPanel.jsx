import CodePanel from '@/components/pet/CodePanel';
import SingPanel from '@/components/pet/SingPanel';
import { usePet } from '@/lib/PetContext';

export default function ActivityPanel() {
  const { activity, progress, nextTrack, stopActivity } = usePet();
  if (!activity) return null;
  if (activity.type === 'code') return <CodePanel progress={progress} />;
  if (activity.type === 'sing') {
    return <SingPanel track={activity.track} onNext={nextTrack} onStop={stopActivity} />;
  }
  return null;
}