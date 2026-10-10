import { describe, expect, it } from "vitest";
import { parseCsv, exportCsv } from "./data";
const csv =
  'name,url,username,password,note\r\nExample,https://example.com,"someone,a","p""ass","line 1\nline 2"\r\nOther,https://other.com,user,secret,\r\n';
describe("Chrome CSV round trip", () => {
  it("preserves commas, quotes, multiline notes and original columns across filtered exports", () => {
    const session = parseCsv(csv, "chrome.csv");
    expect(session.entries).toHaveLength(2);
    session.entries[0].status = "important";
    session.entries[1].status = "unimportant";
    const imported = parseCsv(exportCsv(session, "important"), "important.csv");
    expect(imported.fields).toEqual(session.fields);
    expect(imported.entries[0].values).toEqual(session.entries[0].values);
    expect(
      parseCsv(exportCsv(session, "unimportant"), "other.csv").entries[0].values
        .password,
    ).toBe("secret");
  });
  it("rejects unrelated, empty and malformed files", () => {
    expect(() => parseCsv("a,b\n1,2", "bad.csv")).toThrow();
    expect(() => parseCsv("url,username,password\n", "empty.csv")).toThrow();
    expect(() =>
      parseCsv("url,username,password\nx,y", "broken.csv"),
    ).toThrow();
  });
  it("accepts a BOM and excludes undecided entries", () => {
    const session = parseCsv(
      "\uFEFFurl,username,password\nhttps://example.com,a,b",
      "bom.csv",
    );
    expect(session.entries).toHaveLength(1);
    expect(exportCsv(session, "important").trim()).toBe(
      "url,username,password",
    );
  });
});
