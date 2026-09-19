/**
 * PegWatch Time-Aware Regime & Drift Classifier
 */

import { MarketRegime, DEFAULT_RISK_CONFIG } from "../config/constants.js";

export type DriftClassification = 
  | "NORMAL" 
  | "BENIGN_WEEKEND_GAP" 
  | "POTENTIAL_BREACH_PENDING" 
  | "ABNORMAL_DRIFT";

export interface ClassifierResult {
  regime: MarketRegime;
  thresholdPct: number;
  deviationPct: number;
  classification: DriftClassification;
  consecutiveBreaches: number;
  shouldExecute: boolean;
  explanation: string;
}

export class RegimeClassifier {
  private consecutiveBreaches: number = 0;
  private isCurrentlyInBreachState: boolean = false;

  /**
   * Determine the current market regime based on US Eastern Time (ET)
   */
  public getMarketRegime(now: Date = new Date()): MarketRegime {
    // Format to US Eastern Time (America/New_York)
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false
    });

    const parts = formatter.formatToParts(now);
    const day = parts.find(p => p.type === "weekday")?.value; // "Mon", "Tue", ...
    const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0", 10);
    const timeInMinutes = hour * 60 + minute;

    // Friday 4:00 PM ET is 16:00 = 960 minutes
    // Monday 9:30 AM ET is 9:30 = 570 minutes

    if (day === "Sat" || day === "Sun") {
      return MarketRegime.WEEKEND_DARK_MARKET;
    }

    if (day === "Fri" && timeInMinutes >= 960) {
      return MarketRegime.WEEKEND_DARK_MARKET;
    }

    if (day === "Mon" && timeInMinutes < 570) {
      return MarketRegime.WEEKEND_DARK_MARKET;
    }

    // Weekday regular market hours: 9:30 AM to 4:00 PM (570 to 960)
    if (timeInMinutes >= 570 && timeInMinutes < 960) {
      return MarketRegime.WEEKDAY_REGULAR;
    }

    return MarketRegime.OVERNIGHT;
  }

  /**
   * Get the active threshold for the current regime
   */
  public getThreshold(regime: MarketRegime, customConfig?: Partial<typeof DEFAULT_RISK_CONFIG>): number {
    switch (regime) {
      case MarketRegime.WEEKEND_DARK_MARKET:
        return customConfig?.weekendThresholdPct ?? DEFAULT_RISK_CONFIG.weekendThresholdPct;
      case MarketRegime.OVERNIGHT:
        return customConfig?.overnightThresholdPct ?? DEFAULT_RISK_CONFIG.overnightThresholdPct;
      case MarketRegime.WEEKDAY_REGULAR:
      default:
        return customConfig?.weekdayThresholdPct ?? DEFAULT_RISK_CONFIG.weekdayThresholdPct;
    }
  }

  /**
   * Classify drift with consecutive breach counter and hysteresis recovery
   */
  public classify(
    deviationPct: number,
    regimeOverride?: MarketRegime,
    customConfig?: Partial<typeof DEFAULT_RISK_CONFIG>
  ): ClassifierResult {
    const regime = regimeOverride || this.getMarketRegime();
    const threshold = this.getThreshold(regime, customConfig);
    const requiredBreaches = customConfig?.consecutiveBreachesRequired ?? DEFAULT_RISK_CONFIG.consecutiveBreachesRequired;
    const absDeviation = Math.abs(deviationPct);

    // Hysteresis threshold to exit an active breach state (70% of threshold)
    const recoveryThreshold = threshold * 0.70;

    let classification: DriftClassification = "NORMAL";
    let shouldExecute = false;
    let explanation = "";

    if (absDeviation > threshold) {
      this.consecutiveBreaches += 1;

      if (this.consecutiveBreaches >= requiredBreaches) {
        classification = "ABNORMAL_DRIFT";
        this.isCurrentlyInBreachState = true;
        shouldExecute = true;
        explanation = `Abnormal drift confirmed: |${deviationPct.toFixed(2)}%| exceeds ${regime} threshold (${threshold}%) for ${this.consecutiveBreaches} consecutive cycles.`;
      } else {
        classification = "POTENTIAL_BREACH_PENDING";
        explanation = `Potential breach detected: |${deviationPct.toFixed(2)}%| > ${threshold}%. Awaiting confirmation cycle (${this.consecutiveBreaches}/${requiredBreaches}).`;
      }
    } else {
      // Deviation is under the breach threshold
      if (this.isCurrentlyInBreachState) {
        if (absDeviation < recoveryThreshold) {
          // Cleared via hysteresis
          this.isCurrentlyInBreachState = false;
          this.consecutiveBreaches = 0;
          classification = "NORMAL";
          explanation = `Peg recovered: deviation returned below recovery band (${recoveryThreshold.toFixed(2)}%).`;
        } else {
          // Still in hysteresis cooldown
          classification = "NORMAL";
          explanation = `Deviation within threshold (${absDeviation.toFixed(2)}% <= ${threshold}%), cooling down.`;
        }
      } else {
        this.consecutiveBreaches = 0;
        
        // Check if this is a benign weekend gap
        const weekdayThreshold = customConfig?.weekdayThresholdPct ?? DEFAULT_RISK_CONFIG.weekdayThresholdPct;
        if (regime === MarketRegime.WEEKEND_DARK_MARKET && absDeviation > weekdayThreshold) {
          classification = "BENIGN_WEEKEND_GAP";
          explanation = `Benign weekend gap: deviation |${deviationPct.toFixed(2)}%| exceeds weekday baseline but is within acceptable dark market band (${threshold}%).`;
        } else {
          classification = "NORMAL";
          explanation = `Normal trading range: deviation |${deviationPct.toFixed(2)}%| within limits.`;
        }
      }
    }

    return {
      regime,
      thresholdPct: threshold,
      deviationPct,
      classification,
      consecutiveBreaches: this.consecutiveBreaches,
      shouldExecute,
      explanation
    };
  }

  public reset(): void {
    this.consecutiveBreaches = 0;
    this.isCurrentlyInBreachState = false;
  }

  public armForBreach(): void {
    this.consecutiveBreaches = Math.max(this.consecutiveBreaches, DEFAULT_RISK_CONFIG.consecutiveBreachesRequired - 1);
  }
}
