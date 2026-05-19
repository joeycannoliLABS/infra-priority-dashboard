// Scoring weights (defaults)
export const DEFAULT_WEIGHTS = { strategic: 30, risk: 25, value: 25, efficiency: 20 };

export function scoreInitiative(item) {
  let strategic = 0, risk = 0, value = 0, efficiency = 0;

  // STRATEGIC ALIGNMENT (0-100)
  if (item["2026 AVL Strategy Aligned"] === "Yes") strategic += 40;
  else if (item["2026 AVL Strategy Aligned"] === "No") strategic += 0;
  else strategic += 10;
  if (item["OKR"]) strategic += 35;
  const statusBonus = { "In Progress": 15, "To Do": 10, "New": 5, "Blocked": 8, "OnHold": 0 };
  strategic += statusBonus[item["Status"]] || 0;
  if (item["Q1 2026 plan"] && item["Q1 2026 plan"] !== "0") strategic += 10;

  // RISK & COMPLIANCE (0-100)
  const combined = ((item["MotherEPIC"] || "") + " " + (item["Roadmap item"] || "")).toLowerCase();
  if (item["LoB"] === "Security") risk += 35;
  if (combined.includes("security") || combined.includes("soc2") || combined.includes("soc1") || combined.includes("iso27") || combined.includes("compliance")) risk += 25;
  if (combined.includes("disaster") || combined.includes("dr test")) risk += 30;
  if (combined.includes("supply chain") || combined.includes("ecr permission")) risk += 30;
  if (combined.includes("upgrade") || combined.includes("migration") || combined.includes("ingress")) risk += 15;
  if (combined.includes("maintenance") || item["Classification"] === "Maintenance") risk += 10;
  if (item["Classification"] === "Incident") risk += 25;
  if (item["Status"] === "Blocked") risk += 10;
  risk = Math.min(risk, 100);

  // BUSINESS VALUE (0-100)
  if (item["Business Value/Purpose"]) value += 20;
  if (item["OKR"]) value += 25;
  if (["AvaCloud", "Core", "Custody", "PEG", "Foundation"].includes(item["LoB"] || "")) value += 25;
  if (item["Classification"] === "Request") value += 15;
  if (combined.includes("cost") || combined.includes("optimization") || combined.includes("right-sizing") || combined.includes("grafana") || combined.includes("prometheus")) value += 15;
  if (combined.includes("new functionality") || combined.includes("new product")) value += 10;
  const pri = item["Priority "];
  if (pri !== null && pri <= 1) value += 10;
  else if (pri !== null && pri <= 2) value += 5;
  value = Math.min(value, 100);

  // EXECUTION READINESS (0-100)
  const effort = item["Estimated Effort (FTE Weeks)"] || 0;
  if (effort === 0) efficiency += 30;
  else if (effort <= 2) efficiency += 25;
  else if (effort <= 4) efficiency += 15;
  else if (effort <= 8) efficiency += 5;
  if (item["Status"] === "In Progress") efficiency += 35;
  else if (item["Status"] === "To Do") efficiency += 20;
  else if (item["Status"] === "New") efficiency += 15;
  if (!item["Dependency"]) efficiency += 15;
  if (item["Q1 2026 plan"] && item["Q1 2026 plan"] !== "0") efficiency += 20;
  efficiency = Math.min(efficiency, 100);

  return { strategic, risk, value, efficiency };
}

export function computeTotal(scores, weights) {
  const weighted = (scores.strategic * weights.strategic + scores.risk * weights.risk + scores.value * weights.value + scores.efficiency * weights.efficiency) / 100;
  return Math.round(weighted * 10) / 10;
}

export function getTier(score) {
  if (score >= 55) return "Critical";
  if (score >= 40) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}
