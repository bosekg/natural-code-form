import { FormData } from "../types";

interface Slide1PersonalInfoProps {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
  errors: { ime?: string; prezime?: string; dob?: string };
}

export default function Slide1PersonalInfo({
  data,
  updateData,
  errors,
}: Slide1PersonalInfoProps) {
  return (
    <div id="slide1-container" className="space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-[1.15] mb-2 sm:mb-3 text-text-primary">
          Tell us a bit <span className="italic font-serif text-[#8c1f2f]">more</span> about yourself
        </h1>
        <p className="text-text-secondary text-sm sm:text-base font-light max-w-lg leading-relaxed">
          Enter your basic information to begin your personal qualification.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Honeypot field (visually hidden to humans, but bots will fill it) */}
        <div className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden opacity-0 pointer-events-none" aria-hidden="true">
          <label htmlFor="input-middle-name">Middle Name</label>
          <input
            id="input-middle-name"
            type="text"
            tabIndex={-1}
            autoComplete="new-password"
            value={data.middle_name || ""}
            onChange={(e) => updateData({ middle_name: e.target.value })}
          />
        </div>

        {/* Ime Field */}
        <div className="space-y-1.5 flex flex-col">
          <label
            htmlFor="input-ime"
            className="text-xs font-sans uppercase tracking-[0.2em] text-[#8a8a8a] font-light"
          >
            First Name
          </label>
          <input
            id="input-ime"
            type="text"
            required
            autoComplete="given-name"
            value={data.ime}
            onChange={(e) => updateData({ ime: e.target.value })}
            placeholder="Enter your first name"
            className="w-full bg-white/[0.02] border border-white/10 text-text-primary rounded-xl px-4 py-3 sm:py-3.5 text-base focus:outline-none focus:border-bordeaux focus:ring-1 focus:ring-bordeaux transition-colors placeholder:text-neutral-600 font-sans"
          />
          {errors.ime && (
            <span className="text-xs text-red-500 font-sans font-light tracking-wide mt-1">
              {errors.ime}
            </span>
          )}
        </div>

        {/* Prezime Field */}
        <div className="space-y-1.5 flex flex-col">
          <label
            htmlFor="input-prezime"
            className="text-xs font-sans uppercase tracking-[0.2em] text-[#8a8a8a] font-light"
          >
            Last Name
          </label>
          <input
            id="input-prezime"
            type="text"
            required
            autoComplete="family-name"
            value={data.prezime}
            onChange={(e) => updateData({ prezime: e.target.value })}
            placeholder="Enter your last name"
            className="w-full bg-white/[0.02] border border-white/10 text-text-primary rounded-xl px-4 py-3 sm:py-3.5 text-base focus:outline-none focus:border-bordeaux focus:ring-1 focus:ring-bordeaux transition-colors placeholder:text-neutral-600 font-sans"
          />
          {errors.prezime && (
            <span className="text-xs text-red-500 font-sans font-light tracking-wide mt-1">
              {errors.prezime}
            </span>
          )}
        </div>

        {/* Dob Field */}
        <div className="space-y-1.5 flex flex-col">
          <label
            htmlFor="input-dob"
            className="text-xs font-sans uppercase tracking-[0.2em] text-[#8a8a8a] font-light"
          >
            Age
          </label>
          <input
            id="input-dob"
            type="number"
            min="20"
            max="99"
            required
            value={data.dob}
            onChange={(e) => updateData({ dob: e.target.value })}
            placeholder="E.g. 24"
            className="w-full bg-white/[0.02] border border-white/10 text-text-primary rounded-xl px-4 py-3 sm:py-3.5 text-base focus:outline-none focus:border-bordeaux focus:ring-1 focus:ring-bordeaux transition-colors placeholder:text-neutral-600 font-sans"
          />
          {errors.dob && (
            <span className="text-xs text-red-500 font-sans font-light tracking-wide mt-1">
              {errors.dob}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
