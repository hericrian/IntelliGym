import type { WorkoutPlan } from "../mocks/intelligym";

const equipmentKey = "intelligym.equipment";
const plansKey = "intelligym.customPlans";
const painKey = "intelligym.painLogs";

export const defaultEquipment = ["Halteres ajustaveis", "Mini band", "Bike ergometrica", "Colchonete", "Banco"];

function read<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getEquipment() {
  return read(equipmentKey, defaultEquipment);
}

export function saveEquipment(items: string[]) {
  write(equipmentKey, items);
}

export function getCustomPlans() {
  return read<WorkoutPlan[]>(plansKey, []);
}

export function savePlan(plan: WorkoutPlan) {
  const plans = getCustomPlans().filter((item) => item.id !== plan.id);
  write(plansKey, [plan, ...plans]);
}

export type PainLog = { score: number; region: string; trigger: string; createdAt: string };

export function savePainLog(log: PainLog) {
  write(painKey, [log, ...read<PainLog[]>(painKey, [])].slice(0, 30));
}

export function getPainLogs() {
  return read<PainLog[]>(painKey, []);
}
