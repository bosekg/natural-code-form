import { motion } from "motion/react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div id="progress-indicator-container" className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-xs text-text-secondary tracking-widest uppercase">
          Kvalifikacija kandidata
        </span>
        <span className="font-mono text-sm font-semibold text-bordeaux tracking-wider">
          {currentStep} / {totalSteps}
        </span>
      </div>
      <div className="w-full h-[3px] bg-neutral-900 rounded-full overflow-hidden">
        <motion.div
          id="progress-bar-fill"
          className="h-full bg-bordeaux"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
