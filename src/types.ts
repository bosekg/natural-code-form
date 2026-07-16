export interface FormData {
  ime: string;
  prezime: string;
  dob: string; // Keep as string for input bindings, convert to number on validation/submit
  izazov: string;
  investicija: string;
  vrijeme: string;
  email: string;
  middle_name?: string;
}

export interface ValidationErrors {
  ime?: string;
  prezime?: string;
  dob?: string;
  izazov?: string;
  email?: string;
}

export interface SubmitResponse {
  success: boolean;
  message: string;
  simulated?: boolean;
  recipient?: string;
  error?: string;
}
