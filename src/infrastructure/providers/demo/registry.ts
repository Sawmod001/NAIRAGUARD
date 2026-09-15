import { demoDatasetSchema, type DemoDataset } from "@/schemas/demo";

/**
 * Demo Scenario Registry — NG-203
 * Provider-independent. Scenarios selectable via id, not UI fake data.
 * Future edge scenarios (no-recommendations, throttled, etc.) are defined here as ids that
 * Demo providers will map to AppError codes (docs/17) — no UI model change needed.
 */

export const REQUIRED_SCENARIOS = [
  "balanced-startup",
  "waste-heavy-startup",
  "ec2-heavy-startup",
  "storage-heavy-startup",
  "fx-pressure",
] as const;

export const EDGE_SCENARIOS = [
  "no-recommendations",
  "aws-access-denied",
  "provider-throttled",
  "provider-unavailable",
  "fx-unavailable",
  "ai-unavailable",
  "stale-data",
  "malformed-provider-response",
  "db-failure",
] as const;

export type RequiredScenarioId = (typeof REQUIRED_SCENARIOS)[number];
export type EdgeScenarioId = (typeof EDGE_SCENARIOS)[number];
export type DemoScenarioId = RequiredScenarioId | EdgeScenarioId | string;

export const ALL_SCENARIOS = [...REQUIRED_SCENARIOS, ...EDGE_SCENARIOS] as const;

// In Node (providers), use fs. In edge runtimes, data would be bundled — keep provider-independent.
import fs from "fs";
import path from "path";

function dataRoot(): string {
  // Allow test override via DEMO_DATA_ROOT; default to project data/
  return process.env.DEMO_DATA_ROOT || path.join(process.cwd(), "data", "scenarios");
}

export function listScenarios(): { id: string; name: string; description: string }[] {
  try {
    const idx = JSON.parse(fs.readFileSync(path.join(dataRoot(), "index.json"), "utf8"));
    return idx.scenarios as { id: string; name: string; description: string }[];
  } catch {
    return REQUIRED_SCENARIOS.map((id) => ({ id, name: id, description: "" }));
  }
}

export function isEdgeScenario(id: string): boolean {
  return (EDGE_SCENARIOS as readonly string[]).includes(id);
}

export function getDemoDataset(scenarioId: string): DemoDataset {
  const file = path.join(dataRoot(), `${scenarioId}.json`);
  if (!fs.existsSync(file)) {
    // Edge: no file yet — return minimal synthetic for no-recommendations, else throw edge error
    if (scenarioId === "no-recommendations") {
      const base = JSON.parse(fs.readFileSync(path.join(dataRoot(), "balanced-startup.json"), "utf8"));
      return demoDatasetSchema.parse({ ...base, scenario: { ...base.scenario, id: "no-recommendations", name: "No Recommendations" }, recommendations: [] });
    }
    // For other edge ids, throw so Demo provider can map to AppError
    throw new Error(`EDGE_SCENARIO:${scenarioId}`);
  }
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  return demoDatasetSchema.parse(raw);
}

export function listAvailableScenarioIds(): string[] {
  return listScenarios().map((s) => s.id);
}
