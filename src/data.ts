import Papa from "papaparse";
export type Status = "important" | "unimportant" | null;
export type Entry = {
  id: string;
  values: Record<string, string>;
  status: Status;
};
export type Session = {
  entries: Entry[];
  fields: string[];
  filename: string;
  history: string[];
};
export const STORAGE_KEY = "passwise.session.v1";
export function parseCsv(text: string, filename: string): Session {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) =>
      h
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase(),
  });
  const fields = result.meta.fields ?? [];
  if (!["url", "username", "password"].every((f) => fields.includes(f)))
    throw new Error(
      "Choose a Chrome password CSV with url, username, and password columns.",
    );
  if (result.errors.length)
    throw new Error(
      "This CSV contains malformed rows. Please export a fresh file from Chrome.",
    );
  if (!result.data.length)
    throw new Error("This file has no passwords to review.");
  return {
    fields,
    filename,
    history: [],
    entries: result.data.map((values, i) => ({
      id: String(i),
      values,
      status: null,
    })),
  };
}
export function exportCsv(session: Session, status: Exclude<Status, null>) {
  return Papa.unparse({
    fields: session.fields,
    data: session.entries
      .filter((e) => e.status === status)
      .map((e) => session.fields.map((f) => e.values[f] ?? "")),
  });
}
export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (
      !Array.isArray(s.entries) ||
      !Array.isArray(s.fields) ||
      !Array.isArray(s.history) ||
      typeof s.filename !== "string"
    )
      return null;
    if (
      !s.entries.every(
        (e: Entry) =>
          typeof e.id === "string" &&
          e.values &&
          Object.values(e.values).every((v) => typeof v === "string") &&
          [null, "important", "unimportant"].includes(e.status),
      )
    )
      return null;
    return s;
  } catch {
    return null;
  }
}
export function website(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url || "Unknown website";
  }
}
