import { FormData } from "../types";

interface Slide3InvestmentProps {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
}

const INVESTMENT_OPTIONS = [
  { value: "$100" },
  { value: "$150-200" },
  { value: "$250+" },
];

export default function Slide3Investment({
  data,
  updateData,
}: Slide3InvestmentProps) {
  return (
    <div id="slide3-container" className="space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-[1.15] mb-2 sm:mb-3 text-text-primary">
          How much are you willing to <span className="italic font-serif text-[#8c1f2f]">invest</span> monthly?
        </h1>
        <p className="text-text-secondary text-sm sm:text-base font-light max-w-lg leading-relaxed">
          An investment in your work system and mentorship is a direct investment in your transformation and yourself.
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <span className="text-sm font-sans text-text-primary block leading-relaxed font-light">
          Knowing that this challenge can be solved with the right coach and system, how much would you be willing to invest monthly in it? <span className="text-[#8c1f2f] font-bold">*</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" role="radiogroup" aria-label="Mjesečna investicija">
          {INVESTMENT_OPTIONS.map((opt) => {
            const isSelected = data.investicija === opt.value;
            return (
              <button
                key={opt.value}
                id={`investment-option-${opt.value.replace(/\W/g, "")}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => updateData({ investicija: opt.value })}
                className={`w-full text-left p-5 rounded-2xl border interactive-card text-base flex items-center justify-between h-16 sm:h-20 select-none cursor-pointer transform hover:-translate-y-[2px] active:translate-y-0 transition-all ${
                  isSelected
                    ? "bg-[#8c1f2f]/[0.08] border-[#8c1f2f] text-text-primary shadow-[0_0_30px_rgba(140,31,47,0.1)]"
                    : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary"
                }`}
              >
                <span className="text-base sm:text-lg font-light tracking-tight text-text-primary">
                  {opt.value}
                </span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "border-[#8c1f2f] bg-[#8c1f2f]/20" : "border-white/10"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 bg-[#8c1f2f] rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
