import { FormData } from "../types";

interface Slide2ChallengeProps {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
  error?: string;
}

export const CHALLENGE_OPTIONS = [
  {
    header: "Results",
    description: "I don't see results despite my efforts",
  },
  {
    header: "Technique",
    description: "I don't know how to train with proper technique",
  },
  {
    header: "Motivation / Discipline",
    description: "I lose motivation and discipline when I don't see fast results",
  },
];

export default function Slide2Challenge({
  data,
  updateData,
  error,
}: Slide2ChallengeProps) {
  return (
    <div id="slide2-container" className="space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-[1.15] mb-2 sm:mb-3 text-text-primary">
          Identify your biggest <span className="italic font-serif text-[#8c1f2f]">challenge</span>
        </h1>
        <p className="text-text-secondary text-sm sm:text-base font-light max-w-lg leading-relaxed">
          Reflect on your previous workouts, nutrition, and habits. Where do you feel you struggle or lose focus the most?
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <span className="text-sm font-sans text-text-primary block leading-relaxed font-light">
          What has been your biggest challenge in training, where do you feel you struggle the most? <span className="text-[#8c1f2f] font-bold">*</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" role="radiogroup" aria-label="Najveći izazov">
          {CHALLENGE_OPTIONS.map((opt) => {
            const isSelected = data.izazov === opt.header;
            return (
              <div
                key={opt.header}
                role="radio"
                aria-checked={isSelected}
                onClick={() => updateData({ izazov: opt.header })}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border interactive-card flex flex-col justify-start h-full select-none cursor-pointer transform hover:-translate-y-[2px] active:translate-y-0 transition-all ${
                  isSelected
                    ? "bg-[#8c1f2f]/[0.08] border-[#8c1f2f] text-text-primary shadow-[0_0_30px_rgba(140,31,47,0.1)]"
                    : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary"
                }`}
              >
                <div className="flex flex-col items-start w-full text-left">
                  <span className={`text-sm sm:text-base font-semibold tracking-wide mb-1 ${isSelected ? "text-text-primary" : "text-text-primary/95"}`}>
                    {opt.header}
                  </span>
                  <span className="text-xs sm:text-sm text-text-secondary font-light leading-relaxed">
                    {opt.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <span className="text-xs text-red-500 font-sans font-light tracking-wide mt-1 block">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
