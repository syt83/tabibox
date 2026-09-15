import { getSupabaseBrowserClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";
import { getCurrentUserId } from "./demo-user";

const DEMO_YEARS_STORAGE_KEY = "tabibox_demo_years";
const MIN_YEAR = 1900;

export function maxAllowedYear(): number {
  return new Date().getFullYear() + 10;
}

export interface AddYearResult {
  success: boolean;
  message?: string;
}

/**
 * Years manually added while Supabase isn't configured. Demo Mode has no
 * server to persist these to, so they live in this browser's localStorage
 * only — gone if the user clears site data, and never shared across
 * devices. That's expected for Demo Mode (see docs/supabase-setup.md).
 */
export function getDemoYears(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DEMO_YEARS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((year): year is number => typeof year === "number") : [];
  } catch {
    return [];
  }
}

function saveDemoYears(years: number[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_YEARS_STORAGE_KEY, JSON.stringify(years));
}

export function validateYearInput(value: number): AddYearResult {
  if (!Number.isInteger(value)) return { success: false, message: "연도는 4자리 숫자로 입력해주세요." };
  const max = maxAllowedYear();
  if (value < MIN_YEAR || value > max) {
    return { success: false, message: `${MIN_YEAR}년부터 ${max}년 사이로 입력해주세요.` };
  }
  return { success: true };
}

/**
 * Adds a year the user explicitly created (e.g. planning a future trip).
 * `existingYears` should be the already-computed dynamic year list
 * (trips + photos + manual years) so duplicates are caught locally before
 * ever touching the network.
 */
export async function addYear(year: number, existingYears: number[]): Promise<AddYearResult> {
  const validation = validateYearInput(year);
  if (!validation.success) return validation;

  if (existingYears.includes(year)) {
    return { success: false, message: "이미 추가된 연도예요." };
  }

  if (!isSupabaseConfigured()) {
    saveDemoYears([...getDemoYears(), year]);
    return { success: true };
  }

  const userId = getCurrentUserId();
  if (!userId) {
    return { success: false, message: "로그인이 필요해요." };
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, message: "연도를 추가하지 못했어요. 다시 시도해주세요." };
  }

  const { error } = await supabase.from("years").insert({ year, user_id: userId });
  if (error) {
    console.error("Failed to add year:", error);
    // Postgres unique_violation — a concurrent insert beat this one to it.
    if (error.code === "23505") return { success: false, message: "이미 추가된 연도예요." };
    return { success: false, message: "연도를 추가하지 못했어요. 다시 시도해주세요." };
  }

  return { success: true };
}
