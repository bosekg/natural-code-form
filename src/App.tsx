import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertCircle, Info } from "lucide-react";
import { FormData, SubmitResponse } from "./types";
import logo from "./logo.svg";
import ProgressIndicator from "./components/ProgressIndicator";
import Slide1PersonalInfo from "./components/Slide1PersonalInfo";
import Slide2Challenge from "./components/Slide2Challenge";
import Slide3Investment from "./components/Slide3Investment";
import Slide4Timing from "./components/Slide4Timing";
import Slide5Email from "./components/Slide5Email";

const TOTAL_STEPS = 5;

export default function App() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0); // 1 = forward, -1 = backward
  const [formData, setFormData] = useState<FormData>({
    ime: "",
    prezime: "",
    dob: "",
    izazov: "",
    investicija: "",
    vrijeme: "",
    email: "",
    middle_name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null);
  const [touchedSteps, setTouchedSteps] = useState<{ [key: number]: boolean }>({});

  const updateFormData = (fields: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  // Live validation calculations
  const getErrors = (currentStep: number) => {
    const errors: { ime?: string; prezime?: string; dob?: string; izazov?: string; email?: string } = {};

    if (currentStep === 1) {
      if (!formData.ime.trim()) {
        errors.ime = "First name is required.";
      }
      if (!formData.prezime.trim()) {
        errors.prezime = "Last name is required.";
      }
      const age = Number(formData.dob);
      if (!formData.dob) {
        errors.dob = "Age is required.";
      } else if (isNaN(age) || age < 20 || age > 99) {
        errors.dob = "Age must be a number between 20 and 99.";
      }
    } else if (currentStep === 2) {
      if (!formData.izazov) {
        errors.izazov = "Please select one of the provided challenges.";
      }
    } else if (currentStep === 5) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        errors.email = "Email address is required.";
      } else if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
    }

    return errors;
  };

  const stepErrors = getErrors(step);
  const isStepValid = Object.keys(stepErrors).length === 0;

  const handleNext = () => {
    setTouchedSteps((prev) => ({ ...prev, [step]: true }));
    if (isStepValid && step < TOTAL_STEPS) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ime: formData.ime,
          prezime: formData.prezime,
          dob: Number(formData.dob),
          izazov: formData.izazov,
          investicija: formData.investicija,
          vrijeme: formData.vrijeme,
          email: formData.email,
          middle_name: formData.middle_name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred while submitting the application.");
      }

      setSubmitResult({
        success: true,
        message: data.message,
        simulated: data.simulated,
      });
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: err.message || "Server connection failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Slider animation configuration
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
    }),
  };

  return (
    <div
      id="app-root-container"
      className="min-h-screen bg-[#060607] text-[#f5f5f5] font-sans flex flex-col justify-between overflow-x-hidden relative select-none"
    >
      {/* Background Graphic Accent */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#8c1f2f] rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-[#8c1f2f] rounded-full blur-[100px] opacity-[0.04] pointer-events-none" />

      {/* Centered Brand Header Block */}
      <header id="app-header" className="w-full px-6 sm:px-12 py-6 sm:py-8 md:py-10 flex items-center justify-center z-10 shrink-0">
        <div className="flex items-center">
          {/* Logo Mark */}
          <img src={logo} alt="The Natural Code logo" className="h-6 sm:h-7 w-auto shrink-0 select-none pointer-events-none" />
          
          {/* Vertical Divider Line */}
          <div className="w-px h-6 sm:h-8 bg-white/15 mx-4 sm:mx-5 shrink-0" />
          
          {/* Text Block */}
          <div className="flex flex-col items-start text-left">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-[#8a8a8a] font-sans font-light leading-none mb-1 sm:mb-1.5">The Natural Code</span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-[#f5f5f5] leading-none">Natural Crew 1:1 Coaching</span>
          </div>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-8 md:py-12 z-10 w-full">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {submitResult && submitResult.success ? (
              /* Success State */
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="text-center py-8 space-y-6 flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-[#8c1f2f]/10 border border-[#8c1f2f]/30 text-[#b23347] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(140,31,47,0.15)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#f5f5f5]">
                    Application <span className="italic font-serif text-[#8c1f2f]">successfully</span> submitted!
                  </h2>
                  <p className="text-[#8a8a8a] text-base leading-relaxed max-w-md mx-auto font-light">
                    Thank you for your time, <strong className="text-[#f5f5f5] font-semibold">{formData.ime}</strong>. We will study your answer in detail and contact you as soon as possible to schedule a call.
                  </p>
                </div>

                {/* Post-submit Calendly Booking CTA */}
                <div className="pt-4 w-full max-w-md">
                  <a
                    href="https://calendly.com/davidpukec-coaching/clients"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-4 sm:py-5 rounded-full text-xs sm:text-sm uppercase tracking-[0.2em] font-bold select-none cursor-pointer bg-[#8c1f2f] hover:bg-[#b23347] text-white transition-all shadow-[0_8px_20px_rgba(140,31,47,0.3)]"
                  >
                    Schedule Your Call Now
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ) : (
              /* Core Multi-Step Form Layout */
              <div key="form-steps-container">
                <form onSubmit={handleSubmit} className="relative flex flex-col justify-between">
                  {/* Step Indicator & Progress Bar (Hidden on step 5) */}
                  {step <= 4 && (
                    <div className="mb-6 sm:mb-8 flex flex-col gap-2.5 text-left self-start">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[#8a8a8a] text-[10px] uppercase tracking-[0.2em] font-sans font-light">Step</span>
                        <span className="text-xs font-semibold tracking-wider text-[#f5f5f5]">
                          0{step} <span className="text-white/20">/</span> <span className="text-[#8a8a8a] text-[10px]">04</span>
                        </span>
                      </div>
                      <div className="w-20 sm:w-24 h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          id="form-step-progress-fill"
                          className="h-full bg-[#8c1f2f]"
                          initial={{ width: 0 }}
                          animate={{ width: `${(step / 4) * 100}%` }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Slider Element Container */}
                  <div className="min-h-[300px] sm:min-h-[340px] md:min-h-[380px] flex items-center">
                    <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                      <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                        className="w-full"
                      >
                        {step === 1 && (
                          <Slide1PersonalInfo
                            data={formData}
                            updateData={updateFormData}
                            errors={touchedSteps[1] ? stepErrors : {}}
                          />
                        )}
                        {step === 2 && (
                          <Slide2Challenge
                            data={formData}
                            updateData={updateFormData}
                            error={touchedSteps[2] ? stepErrors.izazov : undefined}
                          />
                        )}
                        {step === 3 && (
                          <Slide3Investment
                            data={formData}
                            updateData={updateFormData}
                          />
                        )}
                        {step === 4 && (
                          <Slide4Timing
                            data={formData}
                            updateData={updateFormData}
                          />
                        )}
                        {step === 5 && (
                          <Slide5Email
                            data={formData}
                            updateData={updateFormData}
                            error={touchedSteps[5] ? stepErrors.email : undefined}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Submission error message overlay */}
                  {submitResult && !submitResult.success && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded-xl flex items-start gap-3 mt-6 text-sm leading-relaxed"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{submitResult.message}</span>
                    </motion.div>
                  )}

                  {/* Navigation and Submission Buttons Bar */}
                  <div className="flex items-center gap-4 sm:gap-6 mt-6 sm:mt-10 md:mt-12 w-full">
                    {/* Back Button */}
                    {step > 1 ? (
                      <button
                        id="btn-nav-nazad"
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="text-[#8a8a8a] hover:text-[#f5f5f5] text-xs sm:text-sm uppercase tracking-widest font-light transition-colors font-sans py-4 cursor-pointer shrink-0 select-none disabled:opacity-40"
                      >
                        ← Back
                      </button>
                    ) : (
                      <div className="w-[60px]" />
                    )}

                    {/* Forward / Submit Trigger */}
                    {step < TOTAL_STEPS ? (
                      <button
                        id="btn-nav-dalje"
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid}
                        className={`flex-grow py-4 sm:py-5 md:py-6 rounded-full text-xs sm:text-sm uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 select-none ${
                          isStepValid
                            ? "bg-[#8c1f2f] hover:bg-[#b23347] text-white cursor-pointer shadow-[0_8px_20px_rgba(140,31,47,0.2)]"
                            : "bg-white/[0.02] border border-white/5 text-neutral-600 cursor-not-allowed opacity-40"
                        }`}
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex-grow">
                        <AnimatePresence>
                          {isStepValid && (
                            <motion.button
                              id="btn-nav-submit"
                              type="submit"
                              disabled={isSubmitting}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.3 }}
                              className="w-full flex items-center justify-center gap-2 py-4 sm:py-5 md:py-6 rounded-full text-xs sm:text-sm uppercase tracking-[0.2em] font-bold select-none cursor-pointer bg-[#8c1f2f] hover:bg-[#b23347] text-white transition-all shadow-[0_8px_20px_rgba(140,31,47,0.3)] disabled:opacity-50"
                            >
                              {isSubmitting ? (
                                <>
                                  Sending...
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                </>
                              ) : (
                                <>
                                  Submit application
                                  <CheckCircle2 className="w-4 h-4" />
                                </>
                              )}
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Footer Info */}
      <footer id="app-footer" className="w-full px-6 sm:px-12 py-4 sm:py-6 flex justify-center items-center text-[10px] text-[#8a8a8a] tracking-[0.15em] uppercase border-t border-white/5 z-10 shrink-0">
        <div>© 2026 The Natural Code</div>
      </footer>

      {/* Aesthetic Background Number */}
      <div className="absolute bottom-[-50px] right-20 text-[260px] font-bold text-white/[0.015] select-none leading-none pointer-events-none hidden lg:block">
        0{step <= 4 ? step : 4}
      </div>
    </div>
  );
}
