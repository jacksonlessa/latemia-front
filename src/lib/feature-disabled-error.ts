/**
 * FeatureDisabledError signals that a feature endpoint responded with a
 * code indicating the feature is disabled server-side (e.g.
 * `OTP_FEATURE_DISABLED` returned by the OTP controller when the
 * `otp_contract_enabled` setting is false).
 *
 * Callers are expected to silently fall back to the legacy behaviour
 * instead of surfacing this error to the user — typically this happens
 * when the frontend cached a stale `otpContractEnabled=true` while the
 * admin toggled the flag back off.
 */
export class FeatureDisabledError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(`Feature disabled: ${code}`);
    this.name = 'FeatureDisabledError';
    this.code = code;
  }
}
