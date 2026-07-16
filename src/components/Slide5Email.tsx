import { FormData } from "../types";

interface Slide5EmailProps {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
  error?: string;
}

export default function Slide5Email({
  data,
  updateData,
  error,
}: Slide5EmailProps) {
  return (
    <div id="slide5-container" className="space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-[1.15] mb-2 sm:mb-3 text-text-primary">
          Last thing, where should we send your{" "}
          <span className="italic font-serif text-bordeaux">confirmation</span>?
        </h1>
        <p className="text-text-secondary text-sm sm:text-base font-light max-w-lg leading-relaxed">
          We'll use this to reach out and follow up on your application.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div className="space-y-1.5 flex flex-col">
          <label
            htmlFor="input-email"
            className="text-xs font-sans uppercase tracking-[0.2em] text-[#8a8a8a] font-light"
          >
            Email Address
          </label>
          <input
            id="input-email"
            type="email"
            required
            autoComplete="email"
            value={data.email || ""}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="E.g. name@example.com"
            className="w-full bg-white/[0.02] border border-white/10 text-text-primary rounded-xl px-4 py-3 sm:py-3.5 text-base focus:outline-none focus:border-bordeaux focus:ring-1 focus:ring-bordeaux transition-colors placeholder:text-neutral-600 font-sans"
          />
          {error && (
            <span className="text-xs text-red-500 font-sans font-light tracking-wide mt-1">
              {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
