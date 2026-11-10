import OledFace from '@/components/pet/OledFace';
import PetTopBar from '@/components/pet/PetTopBar';
import PetIdent from '@/components/pet/PetIdent';
import PetStats from '@/components/pet/PetStats';
import ActionBar from '@/components/pet/ActionBar';
import ActivityPanel from '@/components/pet/ActivityPanel';
import SpeechBubble from '@/components/pet/SpeechBubble';
import DialogueBar from '@/components/pet/DialogueBar';
import { usePet } from '@/lib/PetContext';

const HINTS = {
  feed: 'eating on his own · tap feed again to stop',
  play: 'playing on his own · tap play again to stop',
  rest: 'recharging on his own · tap rest again to stop',
  code: 'coding on his own · tap code again to stop',
  sing: 'singing his heart out · tap sing again to stop',
};

export default function PetHome() {
  const { pet, expression, idle, speaking, caption, bursts, petFace, activity } = usePet();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060A] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[-16%] h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(0,225,255,0.13), transparent 68%)' }}
        />
        <div
          className="absolute bottom-[-24%] left-1/2 h-[520px] w-[760px] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(58,86,255,0.12), transparent 70%)' }}
        />
      </div>

      <PetTopBar />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-20 pt-8 sm:pt-10">
        <div className="relative w-[min(74vw,330px)]">
          <div aria-hidden className="absolute inset-x-10 -bottom-6 h-12 rounded-full bg-cyan-400/20 blur-2xl" />
          <OledFace
            expression={expression}
            idle={idle}
            speaking={speaking}
            onPet={petFace}
            bursts={bursts}
          />
        </div>

        <PetIdent />

        <div className="mt-4 w-full max-w-xl">
          <SpeechBubble caption={caption} speaking={speaking} />
        </div>

        <div className="mt-4 w-full max-w-xl">
          <PetStats pet={pet} />
        </div>

        <div className="mt-6 w-full max-w-xl">
          <ActionBar />
        </div>

        <div className="mt-5 w-full max-w-xl">
          <ActivityPanel />
        </div>

        <div className="mt-6 w-full max-w-xl">
          <DialogueBar />
        </div>

        <p className="mt-7 text-center font-mono text-[9px] uppercase leading-relaxed tracking-[0.24em] text-white/20">
          {activity ? HINTS[activity.type] : 'tap the face to show some love · he follows your cursor'}
        </p>
      </main>
    </div>
  );
}