import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs";
import { getDijabetesSections } from "./oDijabetesu";

vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return {
    ...actual,
    default: { ...actual, readFileSync: vi.fn() },
    readFileSync: vi.fn(),
  };
});

const readFileSyncMock = vi.mocked(fs.readFileSync);

const blockSta = `---
id: sta-je
title: "Šta je dijabetes?"
archived: false
---

Intro tekst o dijabetesu.

<!-- more -->

**Pun** sadržaj sa formatting-om.`;

const blockTip1 = `---
id: tip-1
title: "Tip 1"
archived: false
---

Tip 1 intro.

<!-- more -->

Tip 1 content.`;

const blockArchived = `---
id: arhivirana
title: "Stara kategorija"
archived: true
---

Ne treba se prikazati.

<!-- more -->

Pun.`;

describe("getDijabetesSections", () => {
  beforeEach(() => {
    readFileSyncMock.mockReset();
  });

  it("parsira jedan validan blok sa intro i content", () => {
    readFileSyncMock.mockReturnValueOnce(blockSta);
    const sections = getDijabetesSections();
    expect(sections).toHaveLength(1);
    expect(sections[0]).toEqual({
      id: "sta-je",
      title: "Šta je dijabetes?",
      intro: "Intro tekst o dijabetesu.",
      content: "**Pun** sadržaj sa formatting-om.",
      archived: false,
    });
  });

  it("parsira više blokova razdvojenih sa ===", () => {
    readFileSyncMock.mockReturnValueOnce(`${blockSta}\n\n===\n\n${blockTip1}`);
    const sections = getDijabetesSections();
    expect(sections).toHaveLength(2);
    expect(sections.map((s) => s.id)).toEqual(["sta-je", "tip-1"]);
  });

  it("filtruje arhivirane kategorije", () => {
    readFileSyncMock.mockReturnValueOnce(`${blockSta}\n\n===\n\n${blockArchived}`);
    const sections = getDijabetesSections();
    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe("sta-je");
  });

  it("vraća prazan content kad nema <!-- more --> markera", () => {
    const noMore = `---
id: bez-more
title: "Bez more"
archived: false
---

Samo intro, nema marker.`;
    readFileSyncMock.mockReturnValueOnce(noMore);
    const sections = getDijabetesSections();
    expect(sections).toHaveLength(1);
    expect(sections[0].intro).toBe("Samo intro, nema marker.");
    expect(sections[0].content).toBe("");
  });

  it("filtruje blokove bez id ili title", () => {
    const empty = `---
id:
title:
archived: false
---

Tekst.

<!-- more -->

Više.`;
    readFileSyncMock.mockReturnValueOnce(empty);
    const sections = getDijabetesSections();
    expect(sections).toHaveLength(0);
  });

  it("ignoriše prazne blokove i whitespace između ===", () => {
    readFileSyncMock.mockReturnValueOnce(`\n\n===\n\n${blockSta}\n\n===\n\n   \n\n===\n\n`);
    const sections = getDijabetesSections();
    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe("sta-je");
  });

  it("vraća prazan niz za prazan fajl", () => {
    readFileSyncMock.mockReturnValueOnce("");
    const sections = getDijabetesSections();
    expect(sections).toEqual([]);
  });

  it("parsira archived: true kao boolean true", () => {
    readFileSyncMock.mockReturnValueOnce(blockArchived);
    const sections = getDijabetesSections();
    // archived bi se filtrirao, pa rezultat treba da je []
    expect(sections).toEqual([]);
  });

  it("prepoznaje varijacije <!-- more --> markera sa razmacima", () => {
    const variant = `---
id: v
title: "V"
archived: false
---

Intro.

<!--   more   -->

Pun tekst.`;
    readFileSyncMock.mockReturnValueOnce(variant);
    const sections = getDijabetesSections();
    expect(sections).toHaveLength(1);
    expect(sections[0].content).toBe("Pun tekst.");
  });
});
