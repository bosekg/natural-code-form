import { FormData } from "../types";

interface Slide4TimingProps {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
}

const TIMING_OPTIONS = [
  { value: "Immediately, as soon as we align", tag: "Immediately", description: "I am ready to put in the effort and start right away without delay." },
  { value: "Within a Week", tag: "Soon", description: "I have time to organize my remaining obligations and will start shortly." },
];

export default function Slide4Timing({
  data,
  updateData,
}: Slide4TimingProps) {
  return (
    <div id="slide4-container" className="space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-[1.15] mb-2 sm:mb-3 text-text-primary">
          When would you like to <span className="italic font-serif text-[#8c1f2f]">get started</span>?
        </h1>
        <p className="text-text-secondary text-sm sm:text-base font-light max-w-lg leading-relaxed">
          Last step. Tell us how important it is for you to start solving this challenge and make progress.
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <span className="text-sm font-sans text-text-primary block leading-relaxed font-light">
          If this were the right fit, when would you like to start working together? <span className="text-[#8c1f2f] font-bold">*</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" role="radiogroup" aria-label="Kada želiš krenuti">
          {TIMING_OPTIONS.map((opt) => {
            const isSelected = data.vrijeme === opt.value;
            return (
              <button
                key={opt.value}
                id={`timing-option-${opt.value.replace(/\W/g, "")}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => updateData({ vrijeme: opt.value })}
                className={`w-full text-left p-5 rounded-2xl border interactive-card text-base flex flex-col justify-between h-full select-none cursor-pointer transform hover:-translate-y-[2px] active:translate-y-0 transition-all ${
                  isSelected
                    ? "bg-[#8c1f2f]/[0.08] border-[#8c1f2f] text-[#8c1f2f] shadow-[0_0_30px_rgba(140,31,47,0.1)]"
                    : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary"
                }`}
              >
                <div className="flex justify-between items-start w-full mb-3">
                  <div className="flex flex-col">
                    <span className={`text-[9px] sm:text-[10px] uppercase tracking-widest font-sans font-light mb-1 ${isSelected ? "text-[#8c1f2f]" : "text-text-secondary"}`}>
                      {opt.tag}
                    </span>
                    <span className="text-base sm:text-lg font-light tracking-tight text-text-primary">
                      {opt.value}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "border-[#8c1f2f] bg-[#8c1f2f]/20" : "border-white/10"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 bg-[#8c1f2f] rounded-full" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-light mt-auto">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
