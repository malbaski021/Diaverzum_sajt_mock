"use client";

import { useState, useRef, useEffect } from "react";

// --- Konstante ---

const EXISTING_TAGS = [
  "iskustvo", "tip 1", "lični stav", "izlet", "sport", "kopaonik",
  "ishrana", "radionica", "zdravlje", "vesti", "akcija", "svetski dan dijabetesa",
  "recept", "video", "škola", "kamp", "mladi", "prijave", "saveti",
  "glikemijski indeks", "edukacija", "mitovi", "dijabetes", "CGM", "RFZO",
  "prava pacijenata", "dijabetes tip 1", "terapija", "lekovi", "GLP-1",
  "svakodnevni život", "tip1", "trčanje", "joga", "zdrav život",
];

const today = new Date().toISOString().split("T")[0];

const inputCls =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition";
const textareaCls = inputCls + " resize-none";
const fileCls =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#e8f0fb] file:text-[#0056b3] cursor-pointer transition";

// --- Tipovi ---

type Section = "vesti" | "blog" | "juniori" | "clanovi";
type View = "dashboard" | "overview" | "add" | "list" | "delete" | "edit";

interface NavItem {
  id: Section;
  label: string;
  hasBackend: boolean;
  description: string;
  addLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "vesti",   label: "Vesti",   hasBackend: false, description: "Novosti i aktuelnosti",           addLabel: "Dodaj vest"    },
  { id: "blog",    label: "Blog",    hasBackend: true,  description: "Blog postovi i priče",             addLabel: "Dodaj blog"    },
  { id: "juniori", label: "Juniori", hasBackend: false, description: "Sadržaj za mlade dijabetičare",   addLabel: "Dodaj objavu"  },
  { id: "clanovi", label: "Članovi", hasBackend: true,  description: "Upravljaj listom članova",        addLabel: "Dodaj člana"   },
];

// --- SVG Ikone ---

function IcoDashboard() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IcoNewspaper() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}
function IcoPen() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IcoStar() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IcoUsers() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IcoPlus() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IcoChevronRight() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IcoArrowLeft() {
  return (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
function IcoList() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcoTrash() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}
function IcoHamburger() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function getIcon(section: Section | null) {
  switch (section) {
    case "vesti":   return <IcoNewspaper />;
    case "blog":    return <IcoPen />;
    case "juniori": return <IcoStar />;
    case "clanovi": return <IcoUsers />;
    default:        return <IcoDashboard />;
  }
}

// --- Tipovi ---

interface BlogItem {
  folder: string;
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  arhivirano: boolean;
}

interface BlogEditData {
  folder: string;
  slug: string;
  sha?: string;
  title: string;
  author: string;
  date: string;
  heroLayout: string;
  tags: string[];
  text: string;
}

interface ClanMember {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  arhivirano?: boolean;
}

interface ClanEditData {
  id: number;
  name: string;
  bio: string;
  image: string;
  arhivirano: boolean;
}

// --- Komponenta ---

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [view, setView]                   = useState<View>("dashboard");
  const [mobileOpen, setMobileOpen]       = useState(false);

  // Lista blogova
  const [blogItems, setBlogItems]     = useState<BlogItem[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError]     = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);
  const [blogSearch, setBlogSearch]     = useState("");

  // Edit
  const [editData,   setEditData]   = useState<BlogEditData | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving,  setEditSaving]  = useState(false);
  const [editStatus,  setEditStatus]  = useState<{ ok: boolean; msg: string } | null>(null);
  const [editNewTag,  setEditNewTag]  = useState("");

  // Delete view (blog)
  const [deleteSearch,   setDeleteSearch]   = useState("");
  const [deleteItems,    setDeleteItems]    = useState<BlogItem[]>([]);
  const [deleteLoading,  setDeleteLoading]  = useState(false);
  const [deleteError,    setDeleteError]    = useState(false);
  const [modal, setModal] = useState<
    | { type: "arhiviraj" | "vrati" | "obrisi"; kind: "blog"; item: BlogItem }
    | { type: "arhiviraj" | "vrati" | "obrisi"; kind: "clan"; item: ClanMember }
    | null
  >(null);
  const [modalLoading,   setModalLoading]   = useState(false);

  // Clanovi — lista
  const [clanItems,    setClanItems]    = useState<ClanMember[]>([]);
  const [clanLoading,  setClanLoading]  = useState(false);
  const [clanError,    setClanError]    = useState(false);
  const [clanSearch,   setClanSearch]   = useState("");

  // Clanovi — edit
  const [clanEditData,    setClanEditData]    = useState<ClanEditData | null>(null);
  const [clanEditLoading, setClanEditLoading] = useState(false);
  const [clanEditSaving,  setClanEditSaving]  = useState(false);
  const [clanEditStatus,  setClanEditStatus]  = useState<{ ok: boolean; msg: string } | null>(null);

  // Clanovi — delete
  const [deleteClanItems,   setDeleteClanItems]   = useState<ClanMember[]>([]);
  const [deleteClanLoading, setDeleteClanLoading] = useState(false);
  const [deleteClanError,   setDeleteClanError]   = useState(false);
  const [deleteClanSearch,  setDeleteClanSearch]  = useState("");

  // Form state
  const [, setIzvor]               = useState("");
  const [heroLayout, setHeroLayout]     = useState<"top" | "float" | "">("");
  const [tags, setTags]                 = useState<string[]>([]);
  const [newTag, setNewTag]             = useState("");
  const [loading, setLoading]           = useState(false);
  const [status, setStatus]             = useState<{ ok: boolean; msg: string } | null>(null);

  // Validacija obaveznih polja (blog)
  const [titleVal, setTitleVal] = useState("");
  const [textVal,  setTextVal]  = useState("");
  const [dateVal,  setDateVal]  = useState(today);
  const [hasImage, setHasImage] = useState(false);

  const blogCanSave = titleVal.trim() !== "" && textVal.trim() !== "" && dateVal !== "" && hasImage && heroLayout !== "";

  // Validacija obaveznih polja (clanovi)
  const [clanNameVal,  setClanNameVal]  = useState("");
  const [clanBioVal,   setClanBioVal]   = useState("");
  const [clanHasImage, setClanHasImage] = useState(false);

  const CLAN_BIO_MAX = 500;
  const clanCanSave = clanNameVal.trim() !== "" && clanBioVal.trim() !== "" && clanHasImage && clanBioVal.length <= CLAN_BIO_MAX;

  // Refs
  const nameRef         = useRef<HTMLInputElement>(null);
  const titleRef        = useRef<HTMLInputElement>(null);
  const authorRef       = useRef<HTMLInputElement>(null);
  const dateRef         = useRef<HTMLInputElement>(null);
  const bioRef          = useRef<HTMLTextAreaElement>(null);
  const imageRef        = useRef<HTMLInputElement>(null);
  const galleryRef      = useRef<HTMLInputElement>(null);
  const izvorRef        = useRef<HTMLInputElement>(null);
  const clanEditImageRef = useRef<HTMLInputElement>(null);

  async function openEdit(item: BlogItem) {
    setEditLoading(true);
    setEditStatus(null);
    setView("edit");
    try {
      const res  = await fetch(`/api/admin/blog?folder=${encodeURIComponent(item.folder)}&slug=${encodeURIComponent(item.slug)}`);
      const data = await res.json();
      setEditData(data);
    } catch {
      setEditStatus({ ok: false, msg: "Greška pri učitavanju bloga." });
    } finally {
      setEditLoading(false);
    }
  }

  async function handleEditSave() {
    if (!editData) return;
    setEditSaving(true);
    setEditStatus(null);
    try {
      const res  = await fetch("/api/admin/blog", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editData) });
      const data = await res.json();
      if (res.ok) setEditStatus({ ok: true, msg: "Blog uspešno sačuvan!" });
      else        setEditStatus({ ok: false, msg: data.error ?? "Greška pri čuvanju." });
    } catch {
      setEditStatus({ ok: false, msg: "Greška pri čuvanju." });
    } finally {
      setEditSaving(false);
    }
  }

  async function openClanEdit(item: ClanMember) {
    setClanEditLoading(true);
    setClanEditStatus(null);
    setView("edit");
    try {
      const res  = await fetch(`/api/admin/clanovi?id=${item.id}`);
      const data = await res.json() as ClanMember;
      setClanEditData({ id: data.id, name: data.name, bio: data.bio ?? "", image: data.image ?? "", arhivirano: data.arhivirano ?? false });
    } catch {
      setClanEditStatus({ ok: false, msg: "Greška pri učitavanju člana." });
    } finally {
      setClanEditLoading(false);
    }
  }

  async function handleClanEditSave() {
    if (!clanEditData) return;
    setClanEditSaving(true);
    setClanEditStatus(null);
    try {
      const fd = new FormData();
      fd.append("id", String(clanEditData.id));
      fd.append("name", clanEditData.name);
      fd.append("bio", clanEditData.bio);
      fd.append("arhivirano", String(clanEditData.arhivirano));
      const newImage = clanEditImageRef.current?.files?.[0];
      if (newImage) fd.append("image", newImage);

      const res  = await fetch("/api/admin/clanovi", { method: "PUT", body: fd });
      const data = await res.json();
      if (res.ok) {
        setClanEditStatus({ ok: true, msg: "Član uspešno sačuvan!" });
        if (clanEditImageRef.current) clanEditImageRef.current.value = "";
      } else {
        setClanEditStatus({ ok: false, msg: data.error ?? "Greška pri čuvanju." });
      }
    } catch {
      setClanEditStatus({ ok: false, msg: "Greška pri čuvanju." });
    } finally {
      setClanEditSaving(false);
    }
  }

  function navigate(section: Section | null, v: View = "overview") {
    setActiveSection(section);
    setView(section === null ? "dashboard" : v);
    setStatus(null);
    setModal(null);
    setMobileOpen(false);
  }

  function resetForm() {
    [nameRef, titleRef, authorRef, imageRef, galleryRef, izvorRef].forEach((r) => {
      if (r.current) r.current.value = "";
    });
    if (dateRef.current) dateRef.current.value = today;
    if (bioRef.current)  bioRef.current.value  = "";
    setTags([]);
    setHeroLayout("");
    setIzvor("");
    setTitleVal("");
    setTextVal("");
    setDateVal(today);
    setHasImage(false);
    setClanNameVal("");
    setClanBioVal("");
    setClanHasImage(false);
  }

  async function handleUpload() {
    setLoading(true);
    setStatus(null);

    try {
      if (activeSection === "clanovi") {
        const name  = nameRef.current?.value.trim() ?? "";
        const bio   = bioRef.current?.value.trim()  ?? "";
        const image = imageRef.current?.files?.[0]  ?? null;

        if (!name) { setStatus({ ok: false, msg: "Ime i prezime su obavezni." }); return; }

        const fd = new FormData();
        fd.append("name", name);
        fd.append("bio", bio);
        if (image) fd.append("image", image);

        const res  = await fetch("/api/admin/clanovi", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok) { setStatus({ ok: true, msg: "Član uspešno dodat!" }); resetForm(); }
        else         setStatus({ ok: false, msg: data.error ?? "Greška pri uploadu." });

      } else if (activeSection === "blog") {
        const title        = titleRef.current?.value.trim()   ?? "";
        const author       = authorRef.current?.value.trim()  ?? "";
        const date         = dateRef.current?.value            ?? today;
        const text         = bioRef.current?.value.trim()      ?? "";
        const mainImage    = imageRef.current?.files?.[0]     ?? null;
        const galleryFiles = galleryRef.current?.files ? Array.from(galleryRef.current.files) : [];

        if (!title) { setStatus({ ok: false, msg: "Naslov je obavezan." }); return; }

        const fd = new FormData();
        fd.append("title", title);
        fd.append("author", author);
        fd.append("date", date);
        fd.append("text", text);
        fd.append("heroLayout", heroLayout);
        fd.append("tags", JSON.stringify(tags));
        if (mainImage) fd.append("mainImage", mainImage);
        galleryFiles.forEach((f) => fd.append("gallery", f));

        const res  = await fetch("/api/admin/blog", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok) { setStatus({ ok: true, msg: "Blog post uspešno dodat!" }); resetForm(); }
        else         setStatus({ ok: false, msg: data.error ?? "Greška pri uploadu." });
      }
    } catch {
      setStatus({ ok: false, msg: "Greška pri uploadu." });
    } finally {
      setLoading(false);
    }
  }

  const toggleTag = (tag: string) =>
    setTags((p) => (p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]));

  const addNewTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setNewTag("");
  };

  useEffect(() => {
    if (view === "list" && activeSection === "blog") {
      setBlogLoading(true);
      setBlogError(false);
      setSelectedBlog(null);
      setBlogSearch("");
      fetch("/api/admin/blog")
        .then((r) => r.json())
        .then((data) => setBlogItems(data.items ?? []))
        .catch(() => setBlogError(true))
        .finally(() => setBlogLoading(false));
    }
    if (view === "delete" && activeSection === "blog") {
      setDeleteLoading(true);
      setDeleteError(false);
      setDeleteSearch("");
      fetch("/api/admin/blog")
        .then((r) => r.json())
        .then((data) => setDeleteItems(data.items ?? []))
        .catch(() => setDeleteError(true))
        .finally(() => setDeleteLoading(false));
    }
    if (view === "list" && activeSection === "clanovi") {
      setClanLoading(true);
      setClanError(false);
      setClanSearch("");
      fetch("/api/admin/clanovi")
        .then((r) => r.json())
        .then((data) => setClanItems(data.items ?? []))
        .catch(() => setClanError(true))
        .finally(() => setClanLoading(false));
    }
    if (view === "delete" && activeSection === "clanovi") {
      setDeleteClanLoading(true);
      setDeleteClanError(false);
      setDeleteClanSearch("");
      fetch("/api/admin/clanovi")
        .then((r) => r.json())
        .then((data) => setDeleteClanItems(data.items ?? []))
        .catch(() => setDeleteClanError(true))
        .finally(() => setDeleteClanLoading(false));
    }
  }, [view, activeSection]);

  async function handleModalConfirm() {
    if (!modal) return;
    setModalLoading(true);
    const { type, kind } = modal;
    try {
      if (kind === "blog") {
        const item = modal.item;
        if (type === "obrisi") {
          const res = await fetch("/api/admin/blog", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: item.folder, slug: item.slug }),
          });
          if (res.ok) setDeleteItems((prev) => prev.filter((b) => b.slug !== item.slug));
        } else {
          const getRes = await fetch(`/api/admin/blog?folder=${encodeURIComponent(item.folder)}&slug=${encodeURIComponent(item.slug)}`);
          const blogData = await getRes.json();
          const arhivirano = type === "arhiviraj";
          await fetch("/api/admin/blog", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...blogData, arhivirano }),
          });
          setDeleteItems((prev) => prev.map((b) => b.slug === item.slug ? { ...b, arhivirano } : b));
        }
      } else {
        const item = modal.item;
        if (type === "obrisi") {
          const res = await fetch("/api/admin/clanovi", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.id }),
          });
          if (res.ok) setDeleteClanItems((prev) => prev.filter((c) => c.id !== item.id));
        } else {
          const arhivirano = type === "arhiviraj";
          const fd = new FormData();
          fd.append("id", String(item.id));
          fd.append("name", item.name);
          fd.append("bio", item.bio ?? "");
          fd.append("arhivirano", String(arhivirano));
          const res = await fetch("/api/admin/clanovi", { method: "PUT", body: fd });
          if (res.ok) setDeleteClanItems((prev) => prev.map((c) => c.id === item.id ? { ...c, arhivirano } : c));
        }
      }
    } catch {
      // silently fail — modal closes regardless
    } finally {
      setModalLoading(false);
      setModal(null);
    }
  }

  const navItem    = NAV_ITEMS.find((n) => n.id === activeSection);
  const hasBackend = navItem?.hasBackend ?? false;

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div
      className="min-h-screen flex flex-col md:flex-row gap-3 p-3"
      style={{ backgroundColor: "#00adef" }}
    >
      {/* ===== SIDEBAR ===== */}
      <aside className="w-full md:w-60 bg-white rounded-2xl shadow-lg flex-shrink-0 flex flex-col">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#00adef" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <circle cx="12" cy="12" r="10" opacity=".25" />
              <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 leading-none tracking-wide">Diaverzum NS</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">Admin Panel</p>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label="Otvori meni"
        >
          <span>Navigacija</span>
          <IcoHamburger />
        </button>

        {/* Nav */}
        <nav
          className={`${mobileOpen ? "block" : "hidden"} md:block flex-1 px-3 py-3 space-y-0.5`}
          aria-label="Admin navigacija"
        >
          <button
            onClick={() => navigate(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
              view === "dashboard"
                ? "bg-[#e8f0fb] text-[#0056b3]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <IcoDashboard />
            Pregled
          </button>

          <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none">
            Sadržaj
          </p>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeSection === item.id && view !== "dashboard"
                  ? "bg-[#e8f0fb] text-[#0056b3]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {getIcon(item.id)}
              <span className="flex-1">{item.label}</span>
              {!item.hasBackend && (
                <span className="text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full leading-none">
                  Uskoro
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="hidden md:block px-5 py-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">v1.0 · Diaverzum Admin</p>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col rounded-2xl shadow-lg overflow-hidden bg-[#f5f7fa] min-h-[calc(100vh-1.5rem)]">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {view !== "dashboard" && (
              <button
                onClick={() => {
                  if (view === "add") { setView("overview"); setStatus(null); resetForm(); }
                  else if (view === "list" || view === "delete") setView("overview");
                  else if (view === "edit") {
                    if (activeSection === "clanovi") { setView("list"); setClanEditData(null); setClanEditStatus(null); }
                    else { setView("list"); setEditData(null); setEditStatus(null); }
                  }
                  else navigate(null);
                }}
                className="text-gray-400 hover:text-gray-700 transition-colors -ml-1 p-1 rounded-lg hover:bg-gray-100"
                aria-label="Nazad"
              >
                <IcoArrowLeft />
              </button>
            )}
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                {view === "dashboard" && "Pregled"}
                {view === "overview" && navItem?.label}
                {view === "add"      && navItem?.addLabel}
                {view === "list"     && "Izmena sadržaja"}
                {view === "delete"   && "Briši sadržaj"}
                {view === "edit"     && (activeSection === "clanovi" ? (clanEditData?.name ?? "Uredi člana") : (editData?.title ?? "Uredi blog"))}
              </h1>
              {view === "overview" && navItem && (
                <p className="text-xs text-gray-400 mt-0.5">{navItem.description}</p>
              )}
              {view === "dashboard" && (
                <p className="text-xs text-gray-400 mt-0.5">Upravljajte sadržajem sajta</p>
              )}
              {view === "list" && (
                <p className="text-xs text-gray-400 mt-0.5">Pregled/izmena svih objava — {navItem?.label}</p>
              )}
              {view === "delete" && (
                <p className="text-xs text-gray-400 mt-0.5">Ukloni postojeće objave — {navItem?.label}</p>
              )}
              {view === "edit" && editData && activeSection !== "clanovi" && (
                <p className="text-xs text-gray-400 mt-0.5">{editData.date || ""}{editData.author ? ` · ${editData.author}` : ""}</p>
              )}
              {view === "edit" && clanEditData && activeSection === "clanovi" && (
                <p className="text-xs text-gray-400 mt-0.5">Član</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {view === "overview" && activeSection && hasBackend && (
              <button
                onClick={() => setView("add")}
                className="flex items-center gap-2 px-4 py-2 bg-[#0056b3] text-white text-sm font-semibold rounded-lg hover:bg-[#003d80] transition-colors shadow-sm"
              >
                <IcoPlus />
                {navItem?.addLabel}
              </button>
            )}
            {view === "add" && (
              <button
                onClick={() => { setView("overview"); setStatus(null); resetForm(); }}
                className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Otkaži
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ---- DASHBOARD ---- */}
          {view === "dashboard" && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className="bg-white rounded-xl p-5 border border-gray-100 hover:border-[#0056b3] hover:shadow-md transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#e8f0fb] text-[#0056b3] flex items-center justify-center group-hover:bg-[#0056b3] group-hover:text-white transition-colors">
                        {getIcon(item.id)}
                      </div>
                      {item.hasBackend ? (
                        <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Aktivno</span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Uskoro</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-4">{item.label}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-[#0056b3] group-hover:gap-2 transition-all">
                      <span>Upravljaj</span>
                      <IcoChevronRight />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- SECTION OVERVIEW ---- */}
          {view === "overview" && activeSection && (
            <div className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Dodaj */}
                <button
                  onClick={() => hasBackend && setView("add")}
                  disabled={!hasBackend}
                  className={`bg-white rounded-xl p-5 border text-left transition-all group ${
                    hasBackend
                      ? "border-gray-100 hover:border-[#0056b3] hover:shadow-md cursor-pointer"
                      : "border-gray-100 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    hasBackend
                      ? "bg-[#e8f0fb] text-[#0056b3] group-hover:bg-[#0056b3] group-hover:text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    <IcoPlus />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mt-4">Dodaj novi</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {hasBackend ? "Kreiraj novi sadržaj" : "Uskoro dostupno"}
                  </p>
                  {hasBackend && (
                    <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-[#0056b3] group-hover:gap-2 transition-all">
                      <span>Otvori</span><IcoChevronRight />
                    </div>
                  )}
                  {!hasBackend && (
                    <span className="inline-block mt-3 text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Uskoro</span>
                  )}
                </button>

                {/* Izmena sadržaja */}
                {(() => {
                  const canList = activeSection === "blog" || activeSection === "clanovi";
                  return (
                    <button
                      onClick={() => canList && setView("list")}
                      disabled={!canList}
                      className={`bg-white rounded-xl p-5 border text-left transition-all group ${
                        canList
                          ? "border-gray-100 hover:border-[#0056b3] hover:shadow-md cursor-pointer"
                          : "border-gray-100 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        canList
                          ? "bg-[#e8f0fb] text-[#0056b3] group-hover:bg-[#0056b3] group-hover:text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        <IcoList />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mt-4">Izmena sadržaja</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Pregled/izmena svih objava</p>
                      {canList ? (
                        <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-[#0056b3] group-hover:gap-2 transition-all">
                          <span>Otvori</span><IcoChevronRight />
                        </div>
                      ) : (
                        <span className="inline-block mt-3 text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Uskoro</span>
                      )}
                    </button>
                  );
                })()}

                {/* Briši sadržaj */}
                {(() => {
                  const canDelete = activeSection === "blog" || activeSection === "clanovi";
                  return (
                    <button
                      onClick={() => canDelete && setView("delete")}
                      disabled={!canDelete}
                      className={`bg-white rounded-xl p-5 border text-left transition-all group ${
                        canDelete
                          ? "border-gray-100 hover:border-red-300 hover:shadow-md cursor-pointer"
                          : "border-gray-100 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        canDelete
                          ? "bg-red-50 text-red-400 group-hover:bg-red-500 group-hover:text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        <IcoTrash />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mt-4">Briši sadržaj</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Ukloni postojeće objave</p>
                      {canDelete ? (
                        <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-red-400 group-hover:gap-2 transition-all">
                          <span>Otvori</span><IcoChevronRight />
                        </div>
                      ) : (
                        <span className="inline-block mt-3 text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Uskoro</span>
                      )}
                    </button>
                  );
                })()}

              </div>
            </div>
          )}

          {/* ---- LIST / IZMENA ---- */}
          {view === "list" && activeSection === "blog" && (
            <div className="space-y-4">

              {/* Search */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="relative flex-1">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    placeholder="Pretraži po naslovu..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition"
                  />
                </div>
                {blogSearch && (
                  <button
                    onClick={() => setBlogSearch("")}
                    className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    Obriši
                  </button>
                )}
              </div>

              {/* Tabela svih blogova */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-5">Naslov</div>
                  <div className="col-span-2 hidden sm:block">Datum</div>
                  <div className="col-span-3 hidden md:block">Autor</div>
                  <div className="col-span-2 text-right">Akcija</div>
                </div>

                {blogLoading && [1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 items-center animate-pulse">
                    <div className="col-span-5"><div className="h-3.5 bg-gray-100 rounded-full w-3/4" /><div className="h-2.5 bg-gray-100 rounded-full w-1/2 mt-1.5" /></div>
                    <div className="col-span-2 hidden sm:block"><div className="h-3 bg-gray-100 rounded-full" /></div>
                    <div className="col-span-3 hidden md:block"><div className="h-3 bg-gray-100 rounded-full w-2/3" /></div>
                    <div className="col-span-2 flex justify-end"><div className="h-7 w-16 bg-gray-100 rounded-lg" /></div>
                  </div>
                ))}

                {!blogLoading && blogItems.filter((b) => b.title.toLowerCase().includes(blogSearch.toLowerCase())).map((item) => (
                  <div
                    key={item.slug}
                    className={`grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors ${selectedBlog?.slug === item.slug ? "bg-[#e8f0fb]" : ""}`}
                  >
                    <div className="col-span-5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                      {item.excerpt && <p className="text-xs text-gray-400 truncate mt-0.5">{item.excerpt}</p>}
                    </div>
                    <div className="col-span-2 hidden sm:block text-sm text-gray-500">{item.date || "—"}</div>
                    <div className="col-span-3 hidden md:block text-sm text-gray-500 truncate">{item.author || "—"}</div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#e8f0fb] text-[#0056b3] hover:bg-[#0056b3] hover:text-white transition-colors"
                      >
                        Izaberi
                      </button>
                    </div>
                  </div>
                ))}

                {!blogLoading && !blogError && blogItems.filter((b) => b.title.toLowerCase().includes(blogSearch.toLowerCase())).length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-3"><IcoList /></div>
                    <p className="text-sm font-semibold text-gray-400">
                      {blogSearch ? `Nema rezultata za "${blogSearch}"` : "Nema blog postova"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {blogSearch ? "Pokušaj drugi pojam za pretragu." : "Dodaj prvi blog post."}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ---- LIST / IZMENA — CLANOVI ---- */}
          {view === "list" && activeSection === "clanovi" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="relative flex-1">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    value={clanSearch}
                    onChange={(e) => setClanSearch(e.target.value)}
                    placeholder="Pretraži po imenu..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition"
                  />
                </div>
                {clanSearch && (
                  <button onClick={() => setClanSearch("")} className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">Obriši</button>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-5">Ime</div>
                  <div className="col-span-4 hidden sm:block">Uloga</div>
                  <div className="col-span-3 text-right">Akcija</div>
                </div>

                {clanLoading && [1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 items-center animate-pulse">
                    <div className="col-span-5"><div className="h-3.5 bg-gray-100 rounded-full w-3/4" /></div>
                    <div className="col-span-4 hidden sm:block"><div className="h-3 bg-gray-100 rounded-full w-2/3" /></div>
                    <div className="col-span-3 flex justify-end"><div className="h-7 w-16 bg-gray-100 rounded-lg" /></div>
                  </div>
                ))}

                {!clanLoading && clanItems.filter((c) => c.name.toLowerCase().includes(clanSearch.toLowerCase())).map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    </div>
                    <div className="col-span-4 hidden sm:block text-sm text-gray-500 truncate">{item.role || "—"}</div>
                    <div className="col-span-3 flex justify-end">
                      <button
                        onClick={() => openClanEdit(item)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#e8f0fb] text-[#0056b3] hover:bg-[#0056b3] hover:text-white transition-colors"
                      >
                        Izaberi
                      </button>
                    </div>
                  </div>
                ))}

                {!clanLoading && !clanError && clanItems.filter((c) => c.name.toLowerCase().includes(clanSearch.toLowerCase())).length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-3"><IcoUsers /></div>
                    <p className="text-sm font-semibold text-gray-400">
                      {clanSearch ? `Nema rezultata za "${clanSearch}"` : "Nema članova"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- DELETE ---- */}
          {view === "delete" && activeSection === "blog" && (
            <div className="space-y-4">

              {/* Upozorenje o akciji */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
                <svg width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-700">Pažnja — brisanje je nepovratno</p>
                  <p className="text-xs text-amber-600 mt-0.5">Obrisani blog post i sve njegove slike ne mogu se povratiti. Svaka stavka zahteva potvrdu pre brisanja.</p>
                </div>
              </div>

              {/* Pretraga */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="relative flex-1">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    value={deleteSearch}
                    onChange={(e) => setDeleteSearch(e.target.value)}
                    placeholder="Pretraži po naslovu..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition"
                  />
                </div>
                {deleteSearch && (
                  <button
                    onClick={() => setDeleteSearch("")}
                    className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    Obriši
                  </button>
                )}
              </div>

              {/* Tabela */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-5">Naslov</div>
                  <div className="col-span-2 hidden sm:block">Datum</div>
                  <div className="col-span-5 text-right">Akcija</div>
                </div>

                {deleteLoading && [1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 items-center animate-pulse">
                    <div className="col-span-5"><div className="h-3.5 bg-gray-100 rounded-full w-3/4" /><div className="h-2.5 bg-gray-100 rounded-full w-1/2 mt-1.5" /></div>
                    <div className="col-span-2 hidden sm:block"><div className="h-3 bg-gray-100 rounded-full" /></div>
                    <div className="col-span-5 flex justify-end gap-2"><div className="h-7 w-20 bg-gray-100 rounded-lg" /><div className="h-7 w-16 bg-red-50 rounded-lg" /></div>
                  </div>
                ))}

                {!deleteLoading && deleteItems.filter((b) => b.title.toLowerCase().includes(deleteSearch.toLowerCase())).map((item) => (
                  <div key={item.slug} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-5">
                      {item.arhivirano && (
                        <span className="inline-block text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full mb-1">Arhivirano</span>
                      )}
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                    </div>
                    <div className="col-span-2 hidden sm:block text-sm text-gray-500">{item.date || "—"}</div>
                    <div className="col-span-5 flex justify-end gap-2">
                      {item.arhivirano ? (
                        <button
                          onClick={() => setModal({ type: "vrati", kind: "blog", item })}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors whitespace-nowrap"
                        >
                          Vrati
                        </button>
                      ) : (
                        <button
                          onClick={() => setModal({ type: "arhiviraj", kind: "blog", item })}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors whitespace-nowrap"
                        >
                          Arhiviraj
                        </button>
                      )}
                      <button
                        onClick={() => setModal({ type: "obrisi", kind: "blog", item })}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors whitespace-nowrap"
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                ))}

                {!deleteLoading && !deleteError && deleteItems.filter((b) => b.title.toLowerCase().includes(deleteSearch.toLowerCase())).length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-300 flex items-center justify-center mx-auto mb-3"><IcoTrash /></div>
                    <p className="text-sm font-semibold text-gray-400">
                      {deleteSearch ? `Nema rezultata za "${deleteSearch}"` : "Nema blog postova"}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ---- DELETE — CLANOVI ---- */}
          {view === "delete" && activeSection === "clanovi" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
                <svg width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-700">Pažnja — brisanje je nepovratno</p>
                  <p className="text-xs text-amber-600 mt-0.5">Obrisani član i njegova fotografija ne mogu se povratiti. Svaka stavka zahteva potvrdu pre brisanja.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="relative flex-1">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    value={deleteClanSearch}
                    onChange={(e) => setDeleteClanSearch(e.target.value)}
                    placeholder="Pretraži po imenu..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition"
                  />
                </div>
                {deleteClanSearch && (
                  <button onClick={() => setDeleteClanSearch("")} className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">Obriši</button>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-5">Ime</div>
                  <div className="col-span-2 hidden sm:block">Uloga</div>
                  <div className="col-span-5 text-right">Akcija</div>
                </div>

                {deleteClanLoading && [1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 items-center animate-pulse">
                    <div className="col-span-5"><div className="h-3.5 bg-gray-100 rounded-full w-3/4" /></div>
                    <div className="col-span-2 hidden sm:block"><div className="h-3 bg-gray-100 rounded-full" /></div>
                    <div className="col-span-5 flex justify-end gap-2"><div className="h-7 w-20 bg-gray-100 rounded-lg" /><div className="h-7 w-16 bg-red-50 rounded-lg" /></div>
                  </div>
                ))}

                {!deleteClanLoading && deleteClanItems.filter((c) => c.name.toLowerCase().includes(deleteClanSearch.toLowerCase())).map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-5">
                      {item.arhivirano && (
                        <span className="inline-block text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full mb-1">Arhivirano</span>
                      )}
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    </div>
                    <div className="col-span-2 hidden sm:block text-sm text-gray-500 truncate">{item.role || "—"}</div>
                    <div className="col-span-5 flex justify-end gap-2">
                      {item.arhivirano ? (
                        <button
                          onClick={() => setModal({ type: "vrati", kind: "clan", item })}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors whitespace-nowrap"
                        >
                          Vrati
                        </button>
                      ) : (
                        <button
                          onClick={() => setModal({ type: "arhiviraj", kind: "clan", item })}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors whitespace-nowrap"
                        >
                          Arhiviraj
                        </button>
                      )}
                      <button
                        onClick={() => setModal({ type: "obrisi", kind: "clan", item })}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors whitespace-nowrap"
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                ))}

                {!deleteClanLoading && !deleteClanError && deleteClanItems.filter((c) => c.name.toLowerCase().includes(deleteClanSearch.toLowerCase())).length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-300 flex items-center justify-center mx-auto mb-3"><IcoTrash /></div>
                    <p className="text-sm font-semibold text-gray-400">
                      {deleteClanSearch ? `Nema rezultata za "${deleteClanSearch}"` : "Nema članova"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- EDIT CLAN ---- */}
          {view === "edit" && activeSection === "clanovi" && (
            <div className="flex flex-col gap-4">
              {clanEditLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Učitavanje podataka...
                </div>
              )}

              {!clanEditLoading && clanEditData && (
                <>
                  <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
                    {/* Leva kolona — sadržaj */}
                    <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ime i prezime <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={clanEditData.name}
                          onChange={(e) => setClanEditData((p) => p && ({ ...p, name: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Biografija</label>
                        <textarea
                          rows={12}
                          value={clanEditData.bio}
                          onChange={(e) => setClanEditData((p) => p && ({ ...p, bio: e.target.value }))}
                          className={textareaCls}
                        />
                      </div>
                    </div>

                    {/* Desna kolona — fotografija */}
                    <div className="w-full lg:w-64 flex-shrink-0 bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fotografija</p>
                      {clanEditData.image && (
                        <p className="text-xs text-gray-500 leading-relaxed break-all">
                          Trenutna: <span className="font-medium text-gray-700">{clanEditData.image.split("/").pop()}</span>
                        </p>
                      )}
                      <input
                        ref={clanEditImageRef}
                        type="file"
                        accept="image/*"
                        className={fileCls}
                      />
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Ako izaberete novu fotografiju, prethodna će biti automatski zamenjena.
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Nova fotografija preuzima identičan naziv prethodne.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status + Akcije */}
                  <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-3">
                    {clanEditStatus && (
                      <div className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${clanEditStatus.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {clanEditStatus.ok ? (
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                        ) : (
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        )}
                        {clanEditStatus.msg}
                      </div>
                    )}
                    {!clanEditStatus && <div className="flex-1" />}
                    <button
                      onClick={() => { setView("list"); setClanEditData(null); setClanEditStatus(null); }}
                      className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Otkaži
                    </button>
                    <button
                      onClick={handleClanEditSave}
                      disabled={clanEditSaving || !clanEditData.name.trim()}
                      className="px-6 py-2.5 bg-[#0056b3] text-white text-sm font-bold rounded-lg hover:bg-[#003d80] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      {clanEditSaving ? "Čuvanje..." : "Sačuvaj izmene"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ---- EDIT BLOG ---- */}
          {view === "edit" && activeSection !== "clanovi" && (
            <div className="flex flex-col gap-4">
              {editLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Učitavanje sadržaja...
                </div>
              )}

              {!editLoading && editData && (
                <>
                  {/* Dve kolone — isti layout kao add */}
                  <div className="flex flex-col xl:flex-row gap-4 xl:items-start">

                    {/* Leva kolona — sadržaj */}
                    <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Naslov <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) => setEditData((p) => p && ({ ...p, title: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tekst <span className="text-red-400">*</span></label>
                        <textarea
                          rows={18}
                          value={editData.text}
                          onChange={(e) => setEditData((p) => p && ({ ...p, text: e.target.value }))}
                          className={textareaCls}
                        />
                      </div>
                    </div>

                    {/* Desna kolona — metadata */}
                    <div className="w-full xl:w-72 2xl:w-80 flex-shrink-0 space-y-4">
                      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detalji</p>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Autor</label>
                          <input
                            type="text"
                            value={editData.author}
                            onChange={(e) => setEditData((p) => p && ({ ...p, author: e.target.value }))}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Datum objave <span className="text-red-400">*</span></label>
                          <input
                            type="date"
                            value={editData.date}
                            onChange={(e) => setEditData((p) => p && ({ ...p, date: e.target.value }))}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Layout glavne slike <span className="text-red-400">*</span></label>
                          <select
                            value={editData.heroLayout}
                            onChange={(e) => setEditData((p) => p && ({ ...p, heroLayout: e.target.value }))}
                            className={inputCls}
                          >
                            <option value="top">Landscape — slika gore, tekst ispod</option>
                            <option value="float">Portret — slika levo, tekst teče oko nje</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tagovi — puna širina */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tagovi</p>
                    <div className="flex flex-wrap gap-2">
                      {EXISTING_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setEditData((p) => p && ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter((t) => t !== tag) : [...p.tags, tag] }))}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            editData.tags.includes(tag)
                              ? "bg-[#0056b3] text-white border-[#0056b3]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#0056b3]"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                      {editData.tags.filter((t) => !EXISTING_TAGS.includes(t)).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-[#0056b3] text-white border border-[#0056b3]">
                          {tag}
                          <button type="button" onClick={() => setEditData((p) => p && ({ ...p, tags: p.tags.filter((t) => t !== tag) }))} className="hover:opacity-70 ml-0.5" aria-label={`Ukloni tag ${tag}`}>✕</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1 max-w-xs">
                      <input
                        type="text"
                        value={editNewTag}
                        onChange={(e) => setEditNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const t = editNewTag.trim().toLowerCase();
                            if (t && !editData.tags.includes(t)) setEditData((p) => p && ({ ...p, tags: [...p.tags, t] }));
                            setEditNewTag("");
                          }
                        }}
                        placeholder="Novi tag..."
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const t = editNewTag.trim().toLowerCase();
                          if (t && !editData.tags.includes(t)) setEditData((p) => p && ({ ...p, tags: [...p.tags, t] }));
                          setEditNewTag("");
                        }}
                        className="px-4 py-2 bg-[#e8f0fb] text-[#0056b3] text-sm font-semibold rounded-lg hover:bg-[#0056b3] hover:text-white transition-colors"
                      >
                        Dodaj
                      </button>
                    </div>
                  </div>

                  {/* Status + Akcije */}
                  <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-3">
                    {editStatus && (
                      <div className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${editStatus.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {editStatus.ok ? (
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                        ) : (
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        )}
                        {editStatus.msg}
                      </div>
                    )}
                    {!editStatus && <div className="flex-1" />}
                    <button
                      onClick={() => { setView("list"); setEditData(null); setEditStatus(null); }}
                      className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Otkaži
                    </button>
                    <button
                      onClick={handleEditSave}
                      disabled={editSaving || !editData.title.trim() || !editData.text.trim() || !editData.date}
                      className="px-6 py-2.5 bg-[#0056b3] text-white text-sm font-bold rounded-lg hover:bg-[#003d80] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      {editSaving ? "Čuvanje..." : "Sačuvaj izmene"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ---- ADD FORM ---- */}
          {view === "add" && activeSection && (
            <div className="flex flex-col gap-4">

              {/* === BLOG FORMA === */}
              {activeSection === "blog" && (
                <div className="flex flex-col xl:flex-row gap-4 xl:items-start">

                  {/* Leva kolona — glavni sadržaj */}
                  <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Naslov <span className="text-red-400">*</span>
                      </label>
                      <input ref={titleRef} type="text" placeholder="Naslov blog posta..." className={inputCls} onChange={(e) => setTitleVal(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tekst <span className="text-red-400">*</span></label>
                      <textarea
                        ref={bioRef}
                        rows={18}
                        placeholder="Sadržaj blog posta..."
                        className={textareaCls}
                        onChange={(e) => setTextVal(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Desna kolona — metadata */}
                  <div className="w-full xl:w-72 2xl:w-80 flex-shrink-0 space-y-4">

                    {/* Osnovno */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detalji</p>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Autor</label>
                        <input ref={authorRef} type="text" placeholder="Ime i prezime autora..." className={inputCls} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-sm font-semibold text-gray-700">Datum objave <span className="text-red-400">*</span></label>
                          <div className="relative group">
                            <button
                              type="button"
                              className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-[#0056b3] hover:text-white transition-colors leading-none"
                              aria-label="Informacija o datumu objave"
                            >
                              i
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 leading-relaxed shadow-lg">
                              Datum objave je obavezan. Sadržaj se prikazuje hronološki — noviji materijal se pojavljuje prvi na stranici.
                              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>
                        </div>
                        <input ref={dateRef} type="date" defaultValue={today} className={inputCls} onChange={(e) => setDateVal(e.target.value)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">Layout glavne slike <span className="text-red-400">*</span></label>
                        <div className="relative group">
                          <button
                            type="button"
                            className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-[#0056b3] hover:text-white transition-colors leading-none"
                            aria-label="Informacija o layoutu slike"
                          >
                            i
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gray-900 text-white text-xs rounded-xl px-3 py-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 leading-relaxed shadow-lg space-y-2">
                            <p className="font-semibold text-white">Landscape</p>
                            <p className="text-gray-300">Slika se prikazuje celom širinom na vrhu teksta. Pogodno za horizontalne fotografije. Tekst ide celom širinom ispod slike.</p>
                            <p className="font-semibold text-white pt-1">Portret</p>
                            <p className="text-gray-300">Slika se postavlja levo, tekst teče oko nje sa desne strane, nastavlja celom širinom ispod teksta. Pogodno za uspravne fotografije.</p>
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </div>
                        <select
                          value={heroLayout}
                          onChange={(e) => setHeroLayout(e.target.value as "top" | "float")}
                          className={inputCls}
                        >
                          <option value="" disabled>Izaberi layout...</option>
                          <option value="top">Landscape — slika gore, tekst ispod</option>
                          <option value="float">Portret — slika levo, tekst teče oko nje</option>
                        </select>
                      </div>
                    </div>

                    {/* Slike */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Slike</p>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-sm font-semibold text-gray-700">Glavna slika <span className="text-red-400">*</span></label>
                          <div className="relative group">
                            <button type="button" className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-[#0056b3] hover:text-white transition-colors leading-none" aria-label="Informacija o glavnoj slici">
                              i
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 leading-relaxed shadow-lg">
                              Moguće je uploadovati samo jednu sliku. Ona će se prikazati kao naslovna fotografija blog posta.
                              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>
                        </div>
                        <input ref={imageRef} type="file" accept="image/*" className={fileCls} onChange={(e) => setHasImage((e.target.files?.length ?? 0) > 0)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-sm font-semibold text-gray-700">Galerija (opciono)</label>
                          <div className="relative group">
                            <button type="button" className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-[#0056b3] hover:text-white transition-colors leading-none" aria-label="Informacija o galeriji">
                              i
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 leading-relaxed shadow-lg">
                              Moguće je uploadovati više slika. <span className="text-amber-300 font-semibold">Napomena:</span> ove slike neće biti automatski vidljive na stranici. Za njihovo prikazivanje, moderator mora da izmeni izgled stranice u kodu.
                              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>
                        </div>
                        <input ref={galleryRef} type="file" accept="image/*" multiple className={fileCls} />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tagovi — puna širina, ispod dvocolonog layouta */}
              {activeSection === "blog" && (
                <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tagovi</p>
                  <div className="flex flex-wrap gap-2">
                    {EXISTING_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          tags.includes(tag)
                            ? "bg-[#0056b3] text-white border-[#0056b3]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#0056b3]"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {tags.filter((t) => !EXISTING_TAGS.includes(t)).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-[#0056b3] text-white border border-[#0056b3]">
                        {tag}
                        <button type="button" onClick={() => toggleTag(tag)} className="hover:opacity-70 ml-0.5" aria-label={`Ukloni tag ${tag}`}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1 max-w-xs">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNewTag())}
                      placeholder="Novi tag..."
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={addNewTag}
                      className="px-4 py-2 bg-[#e8f0fb] text-[#0056b3] text-sm font-semibold rounded-lg hover:bg-[#0056b3] hover:text-white transition-colors"
                    >
                      Dodaj
                    </button>
                  </div>
                </div>
              )}

              {/* === CLANOVI FORMA === */}
              {activeSection === "clanovi" && (
                <div className="flex flex-col lg:flex-row gap-4 lg:items-start">

                  {/* Leva kolona */}
                  <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Ime i prezime <span className="text-red-400">*</span>
                      </label>
                      <input
                        ref={nameRef}
                        type="text"
                        placeholder="Ime i prezime..."
                        className={inputCls}
                        onChange={(e) => setClanNameVal(e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Biografija <span className="text-red-400">*</span>
                        </label>
                        <span className={`text-xs font-medium tabular-nums ${clanBioVal.length > CLAN_BIO_MAX ? "text-red-500 font-bold" : clanBioVal.length > CLAN_BIO_MAX * 0.9 ? "text-amber-500" : "text-gray-400"}`}>
                          {clanBioVal.length}/{CLAN_BIO_MAX}
                        </span>
                      </div>
                      <textarea
                        ref={bioRef}
                        rows={10}
                        placeholder="Kratka biografija člana..."
                        className={`${textareaCls} ${clanBioVal.length > CLAN_BIO_MAX ? "border-red-300 focus:ring-red-400" : ""}`}
                        onChange={(e) => setClanBioVal(e.target.value)}
                      />
                      {clanBioVal.length > CLAN_BIO_MAX && (
                        <p className="text-xs text-red-500 mt-1">Biografija ne sme biti duža od {CLAN_BIO_MAX} karaktera.</p>
                      )}
                    </div>
                  </div>

                  {/* Desna kolona */}
                  <div className="w-full lg:w-64 flex-shrink-0 bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Fotografija <span className="text-red-400">*</span>
                    </p>
                    <input
                      ref={imageRef}
                      type="file"
                      accept="image/*"
                      className={fileCls}
                      onChange={(e) => setClanHasImage((e.target.files?.length ?? 0) > 0)}
                    />
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Moguće je priložiti samo jednu fotografiju — ona će biti vidljiva na stranici članova.
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Preporučeni format: portretna fotografija (3:4), JPG ili PNG, do 5 MB.
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* Status + Akcije */}
              <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-3">
                {status && (
                  <div className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${status.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {status.ok ? (
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    )}
                    {status.msg}
                  </div>
                )}
                {!status && <div className="flex-1" />}
                <button
                  onClick={() => { setView("overview"); setStatus(null); resetForm(); }}
                  className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Otkaži
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading || (activeSection === "blog" && !blogCanSave) || (activeSection === "clanovi" && !clanCanSave)}
                  className="px-6 py-2.5 bg-[#0056b3] text-white text-sm font-bold rounded-lg hover:bg-[#003d80] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? "Čuvanje..." : "Sačuvaj"}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ===== MODAL ===== */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !modalLoading) setModal(null); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              {modal.type === "obrisi" ? (
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                  <IcoTrash />
                </div>
              ) : modal.type === "arhiviraj" ? (
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                {(() => {
                  const isClan = modal.kind === "clan";
                  const label = isClan ? modal.item.name : modal.item.title;
                  const noun = isClan ? "Član" : "Blog";
                  return (
                    <>
                      <p id="modal-title" className="text-sm font-bold text-gray-900">
                        {modal.type === "obrisi" && `Obriši ${isClan ? "člana" : "blog post"}`}
                        {modal.type === "arhiviraj" && `Arhiviraj ${isClan ? "člana" : "blog post"}`}
                        {modal.type === "vrati" && `Vrati ${isClan ? "člana" : "blog post"}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {modal.type === "obrisi" && (
                          <>{isClan ? "Član" : "Sadržaj"} se bezpovratno briše{isClan ? "." : " sa sajta i projekta."} Da li ste sigurni da želite da obrišete <span className="font-semibold text-gray-800">{label}</span>?</>
                        )}
                        {modal.type === "arhiviraj" && (
                          <>{noun} <span className="font-semibold text-gray-800">{label}</span> biće sakriven sa sajta. {isClan ? "Podaci ostaju i mogu se vratiti." : "Sadržaj ostaje na projektu i može se vratiti."}</>
                        )}
                        {modal.type === "vrati" && (
                          <>{noun} <span className="font-semibold text-gray-800">{label}</span> biće ponovo vidljiv na sajtu.</>
                        )}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setModal(null)}
                disabled={modalLoading}
                className="px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Odustani
              </button>
              <button
                onClick={handleModalConfirm}
                disabled={modalLoading}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white ${
                  modal.type === "obrisi"
                    ? "bg-red-500 hover:bg-red-600"
                    : modal.type === "arhiviraj"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {modalLoading ? "..." : modal.type === "obrisi" ? "Obriši" : modal.type === "arhiviraj" ? "Arhiviraj" : "Vrati"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
