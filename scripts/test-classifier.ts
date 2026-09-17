/**
 * Unit Test: Test RegimeClassifier with synthetic price series
 */

import { RegimeClassifier } from "../backend/src/classifier/regimeClassifier.js";
import { MarketRegime } from "../backend/src/config/constants.js";

function runClassifierTests() {
  console.log("==================================================");
  console.log("   UNIT TEST: RegimeClassifier & Drift Logic");
  console.log("==================================================");

  const classifier = new RegimeClassifier();

  // Test 1: Normal within weekday threshold (0.5% deviation)
  let res = classifier.classify(0.5, MarketRegime.WEEKDAY_REGULAR);
  console.log(`[TEST 1] Weekday 0.5% -> ${res.classification} (Expected: NORMAL)`);
  if (res.classification !== "NORMAL" || res.shouldExecute) throw new Error("Test 1 Failed");

  // Test 2: Benign Weekend Gap (1.8% deviation on weekend: > 1.2% weekday, < 3.0% weekend)
  res = classifier.classify(-1.8, MarketRegime.WEEKEND_DARK_MARKET);
  console.log(`[TEST 2] Weekend -1.8% -> ${res.classification} (Expected: BENIGN_WEEKEND_GAP)`);
  if (res.classification !== "BENIGN_WEEKEND_GAP" || res.shouldExecute) throw new Error("Test 2 Failed");

  // Test 3: First breach on weekend (-3.5% deviation, threshold is 3.0%)
  // Should be POTENTIAL_BREACH_PENDING (N=1)
  res = classifier.classify(-3.5, MarketRegime.WEEKEND_DARK_MARKET);
  console.log(`[TEST 3] Weekend -3.5% (Cycle 1) -> ${res.classification} (Expected: POTENTIAL_BREACH_PENDING)`);
  if (res.classification !== "POTENTIAL_BREACH_PENDING" || res.shouldExecute) throw new Error("Test 3 Failed");

  // Test 4: Second consecutive breach on weekend (-3.6% deviation)
  // Should trigger ABNORMAL_DRIFT (N=2) -> shouldExecute: true
  res = classifier.classify(-3.6, MarketRegime.WEEKEND_DARK_MARKET);
  console.log(`[TEST 4] Weekend -3.6% (Cycle 2) -> ${res.classification} (Expected: ABNORMAL_DRIFT)`);
  if (res.classification !== "ABNORMAL_DRIFT" || !res.shouldExecute) throw new Error("Test 4 Failed");

  // Test 5: Single-block spike that returns to normal does NOT execute if it was only 1 cycle
  classifier.reset();
  res = classifier.classify(4.2, MarketRegime.WEEKEND_DARK_MARKET); // Cycle 1 (breach)
  res = classifier.classify(0.8, MarketRegime.WEEKEND_DARK_MARKET); // Cycle 2 (back to normal)
  console.log(`[TEST 5] Spike then drop -> ${res.classification} (Expected: NORMAL, no execution)`);
  if (res.classification !== "NORMAL" || res.shouldExecute) throw new Error("Test 5 Failed");

  console.log("\n--------------------------------------------------");
  console.log(">>> RESULT: ALL CLASSIFIER TESTS PASSED <<<");
  console.log("--------------------------------------------------\n");
}

runClassifierTests();
