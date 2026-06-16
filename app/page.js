"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  fetchCategories,
  insertCategory,
  updateCategory,
  deleteCategoryRow,
  fetchFoods,
  upsertFood,
  deleteFoodRow,
  fetchRecipes,
  upsertRecipe,
  deleteRecipeRow,
  fetchPlan,
  insertPlanItem,
  deletePlanItem,
  uploadImage,
} from "../lib/data";

/* =========================================================================
   Nutrition knowledge base — per 100g/ml typical values, used to auto-fill
   ========================================================================= */
const NUTRITION_DB = {
  "chicken - breast": { cal: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, unit: "g", portion: 150 },
  "chicken - thigh": { cal: 209, protein: 26, carbs: 0, fat: 11, fiber: 0, unit: "g", portion: 130 },
  "chicken - wings": { cal: 203, protein: 30, carbs: 0, fat: 8, fiber: 0, unit: "g", portion: 90 },
  "chicken - drumstick": { cal: 172, protein: 28, carbs: 0, fat: 5.7, fiber: 0, unit: "g", portion: 110 },
  "chicken - ground": { cal: 143, protein: 17, carbs: 0, fat: 8, fiber: 0, unit: "g", portion: 110 },
  "beef - ground": { cal: 250, protein: 26, carbs: 0, fat: 17, fiber: 0, unit: "g", portion: 150 },
  "beef - steak": { cal: 271, protein: 25, carbs: 0, fat: 19, fiber: 0, unit: "g", portion: 200 },
  "beef - ribs": { cal: 290, protein: 24, carbs: 0, fat: 22, fiber: 0, unit: "g", portion: 200 },
  "pork - chop": { cal: 231, protein: 25, carbs: 0, fat: 14, fiber: 0, unit: "g", portion: 150 },
  "pork - bacon": { cal: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0, unit: "g", portion: 16 },
  "pork - ground": { cal: 263, protein: 17, carbs: 0, fat: 21, fiber: 0, unit: "g", portion: 110 },
  "turkey - breast": { cal: 135, protein: 30, carbs: 0, fat: 0.7, fiber: 0, unit: "g", portion: 150 },
  "turkey - ground": { cal: 203, protein: 19, carbs: 0, fat: 13, fiber: 0, unit: "g", portion: 110 },
  "lamb - chop": { cal: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, unit: "g", portion: 150 },
  "salmon": { cal: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, unit: "g", portion: 150 },
  "tuna": { cal: 132, protein: 28, carbs: 0, fat: 1.3, fiber: 0, unit: "g", portion: 150 },
  "shrimp": { cal: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, unit: "g", portion: 100 },
  "cod": { cal: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0, unit: "g", portion: 150 },
  "tilapia": { cal: 96, protein: 20, carbs: 0, fat: 1.7, fiber: 0, unit: "g", portion: 150 },
  "egg": { cal: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, unit: "g", portion: 50 },
  "tofu": { cal: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, unit: "g", portion: 100 },
  "lentils": { cal: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, unit: "g", portion: 100 },
  "chickpeas": { cal: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, unit: "g", portion: 120 },
  "black beans": { cal: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 8.7, unit: "g", portion: 120 },
  "peanut butter": { cal: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, unit: "g", portion: 32 },
  "almonds": { cal: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, unit: "g", portion: 28 },
  "yellow potato": { cal: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, unit: "g", portion: 170 },
  "potato": { cal: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, unit: "g", portion: 170 },
  "sweet potato": { cal: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, unit: "g", portion: 130 },
  "tomato": { cal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, unit: "g", portion: 120 },
  "broccoli": { cal: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, unit: "g", portion: 90 },
  "spinach": { cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, unit: "g", portion: 60 },
  "onion": { cal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, unit: "g", portion: 80 },
  "garlic": { cal: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, unit: "g", portion: 6 },
  "carrot": { cal: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, unit: "g", portion: 60 },
  "bell pepper": { cal: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, unit: "g", portion: 120 },
  "cucumber": { cal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, unit: "g", portion: 120 },
  "lettuce": { cal: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, unit: "g", portion: 80 },
  "zucchini": { cal: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, unit: "g", portion: 120 },
  "mushroom": { cal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, unit: "g", portion: 70 },
  "milk": { cal: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, unit: "ml", portion: 240 },
  "cheese": { cal: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, unit: "g", portion: 30 },
  "butter": { cal: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, unit: "g", portion: 14 },
  "yogurt": { cal: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, unit: "g", portion: 170 },
  "cottage cheese": { cal: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, unit: "g", portion: 110 },
  "cream cheese": { cal: 342, protein: 6, carbs: 4, fat: 34, fiber: 0, unit: "g", portion: 30 },
  "rice": { cal: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, unit: "g", portion: 150 },
  "bread": { cal: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, unit: "g", portion: 35 },
  "pasta": { cal: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, unit: "g", portion: 140 },
  "oats": { cal: 389, protein: 17, carbs: 66, fat: 7, fiber: 10.6, unit: "g", portion: 40 },
  "quinoa": { cal: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, unit: "g", portion: 90 },
  "tortilla": { cal: 218, protein: 5.7, carbs: 36, fat: 5.4, fiber: 2.2, unit: "g", portion: 45 },
  "banana": { cal: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, unit: "g", portion: 120 },
  "apple": { cal: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, unit: "g", portion: 180 },
  "avocado": { cal: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, unit: "g", portion: 100 },
  "lemon": { cal: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8, unit: "g", portion: 60 },
  "orange": { cal: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, unit: "g", portion: 130 },
  "strawberry": { cal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, unit: "g", portion: 150 },
  "blueberry": { cal: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, unit: "g", portion: 145 },
  "grapes": { cal: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, unit: "g", portion: 150 },
  "salt": { cal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, unit: "g", portion: 2 },
  "black pepper": { cal: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 25, unit: "g", portion: 2 },
  "paprika": { cal: 282, protein: 14, carbs: 54, fat: 13, fiber: 35, unit: "g", portion: 2 },
  "cumin": { cal: 375, protein: 18, carbs: 44, fat: 22, fiber: 11, unit: "g", portion: 2 },
  "cinnamon": { cal: 247, protein: 4, carbs: 81, fat: 1.2, fiber: 53, unit: "g", portion: 2 },
  "honey": { cal: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2, unit: "g", portion: 21 },
  "olive oil": { cal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, unit: "g", portion: 14 },
  "vegetable oil": { cal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, unit: "g", portion: 14 },
  "coconut oil": { cal: 862, protein: 0, carbs: 0, fat: 99, fiber: 0, unit: "g", portion: 14 },
  "sesame oil": { cal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, unit: "g", portion: 14 },
};

const CATEGORY_PALETTE = [
  { id: "p1", hex: "#C4683D", soft: "#F3E3D8", deep: "#8C4426" },
  { id: "p2", hex: "#6E8C4A", soft: "#E7EBDA", deep: "#3D4A2E" },
  { id: "p3", hex: "#4A7A8C", soft: "#DCEAEE", deep: "#27495A" },
  { id: "p4", hex: "#B8923A", soft: "#F2E8D2", deep: "#7A5F1F" },
  { id: "p5", hex: "#9A5A7A", soft: "#EFDFE8", deep: "#65334A" },
  { id: "p6", hex: "#7A6E5A", soft: "#E8E3D6", deep: "#4A4133" },
  { id: "p7", hex: "#B5483F", soft: "#F2DDD9", deep: "#7A2E27" },
  { id: "p8", hex: "#3F8F7A", soft: "#D9EDE6", deep: "#235144" },
  { id: "p9", hex: "#6B7FB0", soft: "#E2E6F2", deep: "#37406B" },
];
function categoryPalette(cat) {
  if (!cat) return CATEGORY_PALETTE[0];
  const p = CATEGORY_PALETTE.find((x) => x.id === cat.colorId);
  return p || CATEGORY_PALETTE[0];
}

const THEME = {
  paper: "var(--paper)", paperRaised: "var(--paper-raised)", ink: "var(--ink)",
  inkSoft: "var(--ink-soft)", inkFaint: "var(--ink-faint)", line: "var(--line)",
  lineStrong: "var(--line-strong)", sage: "var(--sage)", sageDeep: "var(--sage-deep)",
  terracotta: "var(--terracotta)", terracottaSoft: "var(--terracotta-soft)",
  cream: "var(--cream)", danger: "var(--danger)", bg: "var(--bg)",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function uid(prefix) { return "local_" + prefix + "_" + Math.random().toString(36).slice(2, 10); }
function round(n, d = 0) { const f = Math.pow(10, d); return Math.round((Number(n) + Number.EPSILON) * f) / f; }
function normalizeFoodKey(s) { return s.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim(); }
function lookupNutrition(name) {
  const key = normalizeFoodKey(name);
  if (!key) return null;
  for (const dbKey of Object.keys(NUTRITION_DB)) {
    if (normalizeFoodKey(dbKey) === key) return { ...NUTRITION_DB[dbKey] };
  }
  let best = null;
  for (const dbKey of Object.keys(NUTRITION_DB)) {
    const normKey = normalizeFoodKey(dbKey);
    if (key.includes(normKey) || normKey.includes(key)) {
      if (!best || normKey.length > normalizeFoodKey(best).length) best = dbKey;
    }
  }
  return best ? { ...NUTRITION_DB[best] } : null;
}
function emptyNutrition() { return { cal: "", protein: "", carbs: "", fat: "", fiber: "", unit: "g", portion: 100 }; }
function scaleNutrition(nutrition, amount) {
  const factor = (Number(amount) || 0) / 100;
  return {
    cal: (Number(nutrition.cal) || 0) * factor,
    protein: (Number(nutrition.protein) || 0) * factor,
    carbs: (Number(nutrition.carbs) || 0) * factor,
    fat: (Number(nutrition.fat) || 0) * factor,
    fiber: (Number(nutrition.fiber) || 0) * factor,
  };
}

/* ========================= shared atoms ========================= */
function NutNum({ value, unit, size = 15 }) {
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: size, fontWeight: 500, color: THEME.ink }}>
      {value}{unit && <span style={{ fontSize: size - 3, color: THEME.inkSoft, marginLeft: 2 }}>{unit}</span>}
    </span>
  );
}
function IconBtn({ icon, label, onClick, danger, size = 30 }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} style={{
      width: size, height: size, padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
      borderRadius: 8, border: "1px solid " + THEME.line, background: THEME.paperRaised,
      color: danger ? THEME.danger : THEME.inkSoft,
    }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: size * 0.52 }} aria-hidden="true" />
    </button>
  );
}
function PrimaryBtn({ children, onClick, disabled, full, icon }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      width: full ? "100%" : undefined,
      background: disabled ? THEME.line : THEME.sageDeep,
      color: disabled ? THEME.inkFaint : "#FBF7EE",
      border: "none", borderRadius: 9, padding: "10px 18px", fontWeight: 600, fontSize: 14,
      cursor: disabled ? "default" : "pointer",
    }}>
      {icon && <i className={`ti ti-${icon}`} style={{ fontSize: 15 }} aria-hidden="true" />}
      {children}
    </button>
  );
}
function GhostBtn({ children, onClick, full, icon }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      width: full ? "100%" : undefined, background: "transparent", color: THEME.ink,
      border: "1px solid " + THEME.lineStrong, borderRadius: 9, padding: "10px 18px",
      fontWeight: 500, fontSize: 14,
    }}>
      {icon && <i className={`ti ti-${icon}`} style={{ fontSize: 15 }} aria-hidden="true" />}
      {children}
    </button>
  );
}
function HeaderCloseBtn({ label = "Close", icon = "x", onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, background: THEME.paperRaised, color: THEME.ink,
      border: "1px solid " + THEME.lineStrong, borderRadius: 9, padding: "6px 12px", fontSize: 13, fontWeight: 600,
    }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
      {label}
    </button>
  );
}
function ConfirmDeleteBtn({ label = "Delete", onConfirm }) {
  const [armed, setArmed] = useState(false);
  const timeoutRef = useRef(null);
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);
  function handle() {
    if (armed) { if (timeoutRef.current) clearTimeout(timeoutRef.current); onConfirm(); }
    else { setArmed(true); timeoutRef.current = setTimeout(() => setArmed(false), 4000); }
  }
  return (
    <button onClick={handle} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: armed ? THEME.danger : "transparent", color: armed ? "#FFF" : THEME.danger,
      border: "1px solid " + (armed ? THEME.danger : THEME.danger + "55"),
      borderRadius: 9, padding: "8px 14px", fontSize: 13, fontWeight: 600,
    }}>
      <i className={`ti ti-${armed ? "alert-triangle" : "trash"}`} style={{ fontSize: 14 }} aria-hidden="true" />
      {armed ? "Tap again to confirm" : label}
    </button>
  );
}
function ConfirmDeleteIconBtn({ onConfirm, label = "Delete" }) {
  const [armed, setArmed] = useState(false);
  const timeoutRef = useRef(null);
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);
  function handle(e) {
    e.stopPropagation();
    if (armed) { if (timeoutRef.current) clearTimeout(timeoutRef.current); onConfirm(); }
    else { setArmed(true); timeoutRef.current = setTimeout(() => setArmed(false), 4000); }
  }
  return (
    <button onClick={handle} aria-label={armed ? "Tap again to confirm delete" : label} style={{
      display: "inline-flex", alignItems: "center", gap: 4, height: 30, padding: armed ? "0 10px" : 0,
      minWidth: 30, justifyContent: "center",
      background: armed ? THEME.danger : THEME.paperRaised, color: armed ? "#FFF" : THEME.danger,
      border: "1px solid " + (armed ? THEME.danger : THEME.danger + "44"), borderRadius: 8,
      fontSize: 12, fontWeight: 600,
    }}>
      <i className={`ti ti-${armed ? "alert-triangle" : "trash"}`} style={{ fontSize: 14 }} aria-hidden="true" />
      {armed && <span>Sure?</span>}
    </button>
  );
}
function EmptyState({ icon, title, body }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: THEME.inkSoft }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: 32, opacity: 0.45, color: THEME.sageDeep }} aria-hidden="true" />
      <p style={{ fontWeight: 600, color: THEME.ink, margin: "12px 0 4px", fontSize: 15 }}>{title}</p>
      <p style={{ fontSize: 13, margin: 0 }}>{body}</p>
    </div>
  );
}
function inputStyle(extra) {
  return { border: "1px solid " + THEME.lineStrong, borderRadius: 9, padding: "8px 12px", fontSize: 14, background: THEME.paperRaised, color: THEME.ink, ...extra };
}

/* Image slot — real device camera via capture="environment" on mobile,
   falls back to the photo library / file picker on desktop. Shows an
   uploading spinner state while the file goes to Supabase Storage. */
function ImageSlot({ value, onChange, size = 96, editing = false, shape = "square" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const radius = shape === "circle" ? "50%" : 14;

  function openPicker() {
    if (!editing || busy) return;
    const el = inputRef.current;
    if (!el) return;
    el.value = "";
    el.click();
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      console.error("Image upload failed", err);
      alert("Photo upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div onClick={openPicker} role={editing ? "button" : undefined} aria-label={editing ? "Choose or take photo" : undefined} style={{
        width: size, height: size, borderRadius: radius, overflow: "hidden", cursor: editing ? "pointer" : "default",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: value ? "transparent" : (editing ? "transparent" : THEME.cream),
        border: editing ? `2px dashed ${value ? THEME.lineStrong : THEME.terracotta}` : `1px solid ${THEME.line}`,
      }}>
        {busy ? (
          <i className="ti ti-loader-2" style={{ fontSize: size * 0.28, color: THEME.terracotta, animation: "spin 0.8s linear infinite" }} aria-hidden="true" />
        ) : value ? (
          <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: editing ? THEME.terracotta : THEME.inkFaint, pointerEvents: "none" }}>
            <i className="ti ti-camera-plus" style={{ fontSize: size * 0.26 }} aria-hidden="true" />
            {editing && size > 70 && <span style={{ fontSize: 11, fontWeight: 600 }}>Add photo</span>}
          </div>
        )}
      </div>
      {editing && value && !busy && (
        <button onClick={(e) => { e.stopPropagation(); onChange(null); }} aria-label="Remove photo" style={{
          position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: "50%",
          background: THEME.paperRaised, border: "1.5px solid " + THEME.lineStrong, color: THEME.danger,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 0, fontSize: 14, fontWeight: 700,
        }}>×</button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ position: "absolute", left: 0, top: 0, width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
        onChange={handleFile}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ========================= APP ROOT ========================= */
export default function PantryApp() {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [plan, setPlan] = useState({});

  const [tab, setTab] = useState("foods");
  const [openFood, setOpenFood] = useState(null);
  const [foodMode, setFoodMode] = useState("view");
  const [showCatModal, setShowCatModal] = useState(false);
  const [openRecipe, setOpenRecipe] = useState(null);
  const [recipeMode, setRecipeMode] = useState("view");
  const [pickerForDay, setPickerForDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [cats, fds, recs, pl] = await Promise.all([
          fetchCategories(), fetchFoods(), fetchRecipes(), fetchPlan(),
        ]);
        setCategories(cats);
        setFoods(fds);
        setRecipes(recs);
        setPlan(pl);
      } catch (err) {
        console.error(err);
        setLoadError(err.message || "Failed to load data");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  function flashToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2000); }

  const catById = useMemo(() => {
    const m = {};
    categories.forEach((c) => (m[c.id] = { ...c, palette: categoryPalette(c) }));
    return m;
  }, [categories]);

  async function addOrUpdateFood(food) {
    const saved = await upsertFood(food);
    setFoods((prev) => (prev.some((f) => f.id === food.id) ? prev.map((f) => (f.id === food.id ? saved : f)) : [saved, ...prev]));
    return saved;
  }
  async function deleteFood(id) {
    await deleteFoodRow(id);
    setFoods((prev) => prev.filter((f) => f.id !== id));
    setOpenFood(null);
  }
  async function addCategory(name) {
    const used = new Set(categories.map((c) => c.colorId).filter(Boolean));
    const next = CATEGORY_PALETTE.find((p) => !used.has(p.id)) || CATEGORY_PALETTE[categories.length % CATEGORY_PALETTE.length];
    const saved = await insertCategory(name, next.id);
    setCategories((prev) => [...prev, saved]);
    return saved.id;
  }
  async function setCategoryColor(id, colorId) {
    await updateCategory(id, { colorId });
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, colorId } : c)));
  }
  async function renameCategory(id, name) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c))); // optimistic
    await updateCategory(id, { name });
  }
  async function deleteCategory(id) {
    await deleteCategoryRow(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setFoods((prev) => prev.map((f) => (f.category === id ? { ...f, category: null } : f)));
  }

  async function saveRecipe(recipe) {
    const saved = await upsertRecipe(recipe);
    setRecipes((prev) => (prev.some((r) => r.id === recipe.id) ? prev.map((r) => (r.id === recipe.id ? saved : r)) : [saved, ...prev]));
    return saved;
  }
  async function deleteRecipe(id) {
    await deleteRecipeRow(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setPlan((prev) => {
      const next = {};
      for (const day of Object.keys(prev)) next[day] = prev[day].filter((inst) => inst.recipeId !== id);
      return next;
    });
    setOpenRecipe(null);
  }
  async function duplicateRecipe(id) {
    const r = recipes.find((x) => x.id === id);
    if (!r) return;
    const saved = await upsertRecipe({ id: uid("rec"), name: r.name + " copy", image: r.image, ingredients: r.ingredients });
    setRecipes((prev) => [saved, ...prev]);
    flashToast("Recipe duplicated");
  }
  async function addRecipeToDay(day, recipeId) {
    const item = await insertPlanItem(day, recipeId);
    setPlan((prev) => ({ ...prev, [day]: [...(prev[day] || []), item] }));
    setPickerForDay(null);
    flashToast("Added to " + day);
  }
  async function removeFromDay(day, instanceId) {
    await deletePlanItem(instanceId);
    setPlan((prev) => ({ ...prev, [day]: (prev[day] || []).filter((i) => i.instanceId !== instanceId) }));
  }
  async function duplicateToDay(day, instanceId, targetDay) {
    const item = (plan[day] || []).find((i) => i.instanceId === instanceId);
    if (!item) return;
    const saved = await insertPlanItem(targetDay, item.recipeId);
    setPlan((prev) => ({ ...prev, [targetDay]: [...(prev[targetDay] || []), saved] }));
    flashToast("Duplicated to " + targetDay);
  }
  function recipeTotals(recipe) {
    let cal = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
    for (const ing of recipe.ingredients) {
      const n = scaleNutrition(ing.nutrition, ing.amount);
      cal += n.cal; protein += n.protein; carbs += n.carbs; fat += n.fat; fiber += n.fiber;
    }
    return { cal: round(cal), protein: round(protein, 1), carbs: round(carbs, 1), fat: round(fat, 1), fiber: round(fiber, 1) };
  }

  if (!loaded) {
    return <div style={{ padding: "3rem 1rem", textAlign: "center", color: THEME.inkSoft }}>Loading pantry…</div>;
  }

  if (loadError) {
    return (
      <div style={{ padding: "2rem 1.25rem", maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ marginTop: 0 }}>Couldn't connect</h2>
        <p style={{ color: THEME.inkSoft, fontSize: 14, lineHeight: 1.6 }}>
          {loadError}. Check that <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set correctly, and that the schema from <code>supabase_schema.sql</code> has been run in your project.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "1.25rem 1.25rem 2.5rem", minHeight: "100vh" }}>
      <Header tab={tab} setTab={setTab} />

      {tab === "foods" && (
        <PantryView
          foods={foods} categories={categories} catById={catById}
          onOpenFood={(f) => { setOpenFood(f); setFoodMode("view"); }}
          onAddFood={() => { setOpenFood({ id: uid("food"), name: "", category: null, image: null, nutrition: emptyNutrition(), createdAt: Date.now() }); setFoodMode("edit"); }}
          onManageCategories={() => setShowCatModal(true)}
        />
      )}

      {tab === "recipes" && (
        <RecipesTab
          recipes={recipes} recipeTotals={recipeTotals}
          onNew={() => { setOpenRecipe({ id: uid("rec"), name: "", image: null, ingredients: [] }); setRecipeMode("edit"); }}
          onOpen={(r) => { setOpenRecipe(r); setRecipeMode("view"); }}
          onDelete={deleteRecipe} onDuplicate={duplicateRecipe}
        />
      )}

      {tab === "plan" && (
        <PlanTab
          plan={plan} recipes={recipes} recipeTotals={recipeTotals}
          selectedDay={selectedDay} setSelectedDay={setSelectedDay}
          onAddClick={(day) => setPickerForDay(day)}
          onRemove={removeFromDay} onDuplicateToDay={duplicateToDay}
          onOpenRecipe={(r) => { setOpenRecipe(r); setRecipeMode("view"); }}
        />
      )}

      {openFood && (
        <FoodDetailModal
          food={openFood} mode={foodMode} categories={categories} catById={catById}
          onAddCategory={addCategory}
          onClose={() => setOpenFood(null)}
          onEdit={() => setFoodMode("edit")}
          onSave={async (f) => { const saved = await addOrUpdateFood(f); setOpenFood(saved); setFoodMode("view"); flashToast("Food saved"); }}
          onSaveAndClose={async (f) => { await addOrUpdateFood(f); setOpenFood(null); flashToast("Saved"); }}
          onDelete={() => deleteFood(openFood.id).then(() => flashToast("Food deleted"))}
        />
      )}

      {showCatModal && (
        <CategoryModal categories={categories} catById={catById} onClose={() => setShowCatModal(false)} onAdd={addCategory} onDelete={deleteCategory} onSetColor={setCategoryColor} onRename={renameCategory} />
      )}

      {openRecipe && (
        <RecipeModal
          recipe={openRecipe} mode={recipeMode} foods={foods} categories={categories} catById={catById} recipeTotals={recipeTotals}
          onClose={() => setOpenRecipe(null)}
          onEdit={() => setRecipeMode("edit")}
          onSave={async (r) => { const saved = await saveRecipe(r); setOpenRecipe(saved); setRecipeMode("view"); flashToast("Recipe saved"); }}
          onSaveAndClose={async (r) => { await saveRecipe(r); setOpenRecipe(null); flashToast("Saved"); }}
          onDelete={() => deleteRecipe(openRecipe.id).then(() => flashToast("Recipe deleted"))}
        />
      )}

      {pickerForDay && (
        <RecipePickerModal day={pickerForDay} recipes={recipes} onPick={(rid) => addRecipeToDay(pickerForDay, rid)} onClose={() => setPickerForDay(null)} />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: THEME.sageDeep, color: "#FBF7EE", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, zIndex: 50 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function Header({ tab, setTab }) {
  const items = [
    { id: "foods", label: "Pantry", icon: "apple" },
    { id: "recipes", label: "Recipes", icon: "tools-kitchen-2" },
    { id: "plan", label: "Plan", icon: "calendar" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Pantry</span>
        <span style={{ fontSize: 12, color: THEME.inkFaint, fontFamily: "var(--font-mono)" }}>nutrition planner</span>
      </div>
      <div style={{ display: "flex", gap: 4, background: THEME.cream, borderRadius: 11, padding: 4 }}>
        {items.map((it) => {
          const active = tab === it.id;
          return (
            <button key={it.id} onClick={() => setTab(it.id)} style={{
              display: "flex", alignItems: "center", gap: 6, border: "none",
              background: active ? THEME.paperRaised : "transparent", borderRadius: 8, padding: "7px 14px",
              fontWeight: 600, fontSize: 13, color: active ? THEME.sageDeep : THEME.inkSoft,
            }}>
              <i className={`ti ti-${it.icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function categoryIcon(name) {
  const n = name.toLowerCase();
  if (n.includes("meat")) return "meat";
  if (n.includes("fish") || n.includes("seafood")) return "fish";
  if (n.includes("protein")) return "egg";
  if (n.includes("veg")) return "carrot";
  if (n.includes("dairy")) return "milk";
  if (n.includes("grain")) return "wheat";
  if (n.includes("fruit")) return "apple";
  if (n.includes("season") || n.includes("spice")) return "pepper";
  if (n.includes("oil") || n.includes("fat")) return "droplet";
  return "tag";
}

/* ---------- Pantry view: flat grid of split-rectangle food cards ---------- */
function PantryView({ foods, categories, catById, onOpenFood, onAddFood, onManageCategories }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedCats, setSelectedCats] = useState(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = foods.filter((f) => {
      if (selectedCats.size > 0 && !selectedCats.has(f.category)) return false;
      if (q && !f.name.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sortBy === "alpha") arr = [...arr].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "recent") arr = [...arr].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return arr;
  }, [foods, search, selectedCats, sortBy]);

  const grouped = useMemo(() => {
    if (sortBy !== "category") return null;
    const map = new Map();
    categories.forEach((c) => map.set(c.id, []));
    map.set("__none", []);
    visible.forEach((f) => {
      const key = f.category && map.has(f.category) ? f.category : "__none";
      map.get(key).push(f);
    });
    for (const arr of map.values()) arr.sort((a, b) => a.name.localeCompare(b.name));
    return map;
  }, [visible, sortBy, categories]);

  function toggleCat(id) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <input placeholder="Search the pantry" value={search} onChange={(e) => setSearch(e.target.value)} style={inputStyle({ width: "100%", marginBottom: 10 })} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: filterOpen ? 10 : 16, flexWrap: "wrap" }}>
        <SegmentedSort value={sortBy} onChange={setSortBy} />
        <button onClick={() => setFilterOpen((o) => !o)} style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px",
          border: "1px solid " + (selectedCats.size > 0 ? THEME.sageDeep : THEME.lineStrong),
          background: selectedCats.size > 0 ? THEME.sage : "transparent",
          color: selectedCats.size > 0 ? THEME.sageDeep : THEME.ink,
          borderRadius: 9, fontSize: 13, fontWeight: 600,
        }}>
          <i className="ti ti-filter" style={{ fontSize: 14 }} aria-hidden="true" />
          Filter{selectedCats.size > 0 ? ` · ${selectedCats.size}` : ""}
          <i className={`ti ti-chevron-${filterOpen ? "up" : "down"}`} style={{ fontSize: 13, opacity: 0.6 }} aria-hidden="true" />
        </button>
        <div style={{ flex: 1 }} />
        <GhostBtn icon="settings" onClick={onManageCategories}>Categories</GhostBtn>
        <PrimaryBtn icon="plus" onClick={() => onAddFood()}>Add food</PrimaryBtn>
      </div>

      {filterOpen && (
        <div style={{ background: THEME.paperRaised, border: "1px solid " + THEME.line, borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }}>Filter by category — select one or more</span>
            {selectedCats.size > 0 && (
              <button onClick={() => setSelectedCats(new Set())} style={{ background: "transparent", border: "none", color: THEME.terracotta, fontSize: 12, fontWeight: 600 }}>Clear all</button>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {categories.map((c) => {
              const pal = catById[c.id].palette;
              const on = selectedCats.has(c.id);
              return (
                <button key={c.id} onClick={() => toggleCat(c.id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, fontWeight: 600,
                  border: on ? `1.5px solid ${pal.hex}` : "1px solid " + THEME.line,
                  background: on ? pal.soft : "transparent", color: on ? pal.deep : THEME.inkSoft, borderRadius: 18,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: pal.hex, display: "inline-block" }} />
                  {c.name}
                  {on && <i className="ti ti-check" style={{ fontSize: 13 }} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {foods.length === 0 ? (
        <EmptyState icon="apple-off" title="Your pantry is empty" body="Add your first food to get started." />
      ) : visible.length === 0 ? (
        <EmptyState icon="search-off" title="No matches" body="Try a different search or clear the filters." />
      ) : sortBy === "category" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {[...grouped.entries()]
            .filter(([key, arr]) => arr.length > 0 && (selectedCats.size === 0 || key === "__none" || selectedCats.has(key)))
            .map(([key, arr]) => {
              const cat = key === "__none" ? null : catById[key];
              const pal = cat ? cat.palette : { hex: THEME.inkFaint, soft: THEME.cream, deep: THEME.inkSoft };
              return (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 18, height: 4, borderRadius: 2, background: pal.hex }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: pal.deep, textTransform: "uppercase", letterSpacing: "0.04em" }}>{cat ? cat.name : "Uncategorized"}</span>
                    <span style={{ fontSize: 11.5, color: THEME.inkFaint, fontFamily: "var(--font-mono)" }}>· {arr.length}</span>
                  </div>
                  <FoodGrid foods={arr} catById={catById} onOpenFood={onOpenFood} />
                </div>
              );
            })}
        </div>
      ) : (
        <FoodGrid foods={visible} catById={catById} onOpenFood={onOpenFood} />
      )}
    </div>
  );
}

function SegmentedSort({ value, onChange }) {
  const opts = [
    { id: "recent", label: "Recent", icon: "clock" },
    { id: "alpha", label: "A–Z", icon: "sort-ascending" },
    { id: "category", label: "Category", icon: "category" },
  ];
  return (
    <div style={{ display: "inline-flex", background: THEME.cream, borderRadius: 9, padding: 3 }}>
      {opts.map((o) => {
        const active = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", border: "none", borderRadius: 7,
            fontSize: 12.5, fontWeight: 600, background: active ? THEME.paperRaised : "transparent",
            color: active ? THEME.sageDeep : THEME.inkSoft,
          }}>
            <i className={`ti ti-${o.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function FoodGrid({ foods, catById, onOpenFood }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
      {foods.map((f) => {
        const pal = f.category && catById[f.category] ? catById[f.category].palette : null;
        return <FoodCard key={f.id} food={f} pal={pal} catName={f.category && catById[f.category] ? catById[f.category].name : null} onClick={() => onOpenFood(f)} />;
      })}
    </div>
  );
}

function FoodCard({ food, pal, catName, onClick }) {
  const n = food.nutrition;
  const accent = pal ? pal.hex : THEME.lineStrong;
  return (
    <div onClick={onClick} style={{ background: THEME.paperRaised, border: "1px solid " + THEME.line, borderRadius: 14, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", minHeight: 120 }}>
        <div style={{ width: 120, aspectRatio: "1", flexShrink: 0, background: pal ? pal.soft : THEME.cream, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid " + THEME.line }}>
          {food.image ? <img src={food.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-photo" style={{ fontSize: 26, color: pal ? pal.hex + "99" : THEME.inkFaint }} aria-hidden="true" />}
        </div>
        <div style={{ flex: 1, padding: "10px 12px", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <p style={{ fontWeight: 700, fontSize: 14.5, margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{food.name || "Untitled"}</p>
          {catName && <p style={{ fontSize: 11, color: pal ? pal.deep : THEME.inkFaint, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{catName}</p>}
          <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 3, columnGap: 10 }}>
            <CardStat label="Per" value={(n.portion || 100) + n.unit} />
            <CardStat label="Cal" value={round(n.cal)} />
            <CardStat label="Protein" value={round(n.protein, 1) + "g"} />
            <CardStat label="Carbs" value={round(n.carbs, 1) + "g"} />
            <CardStat label="Fiber" value={round(n.fiber, 1) + "g"} />
            <CardStat label="Fat" value={round(n.fat, 1) + "g"} />
          </div>
        </div>
      </div>
      <div style={{ height: 4, background: accent }} />
    </div>
  );
}
function CardStat({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: 10, color: THEME.inkFaint, textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: THEME.ink }}>{value}</span>
    </div>
  );
}

/* ---------- Food detail / edit modal ---------- */
function FoodDetailModal({ food, mode, categories, catById, onAddCategory, onClose, onEdit, onSave, onSaveAndClose, onDelete }) {
  const editing = mode === "edit";
  const [name, setName] = useState(food.name);
  const [category, setCategory] = useState(food.category);
  const [image, setImage] = useState(food.image);
  const [nutrition, setNutrition] = useState({ ...food.nutrition });
  const [autofilled, setAutofilled] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(food.name); setCategory(food.category); setImage(food.image);
    setNutrition({ ...food.nutrition }); setAutofilled(false);
  }, [food.id, mode]);

  function handleNameBlur() {
    if (nutrition.cal !== "" && nutrition.cal !== undefined && nutrition.cal !== 0) return;
    const found = lookupNutrition(name);
    if (found) { setNutrition(found); setAutofilled(true); }
  }

  function buildFood() {
    return {
      id: food.id, name: name.trim(), category: category || null, image,
      createdAt: food.createdAt || Date.now(),
      nutrition: {
        cal: Number(nutrition.cal) || 0, protein: Number(nutrition.protein) || 0,
        carbs: Number(nutrition.carbs) || 0, fat: Number(nutrition.fat) || 0,
        fiber: Number(nutrition.fiber) || 0, unit: nutrition.unit || "g",
        portion: Number(nutrition.portion) || 100,
      },
    };
  }

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try { await onSave(buildFood()); } finally { setSaving(false); }
  }
  async function handleBackdropClose() {
    if (editing && name.trim()) await onSaveAndClose(buildFood());
    else onClose();
  }

  const pal = category && catById[category] ? catById[category].palette : null;
  const isNew = !food.name && editing;
  const hasName = !!name.trim();

  return (
    <ModalShell onClose={handleBackdropClose} width={620}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          {pal && !editing && <span style={{ width: 10, height: 10, borderRadius: "50%", background: pal.hex, display: "inline-block", flexShrink: 0 }} />}
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: THEME.inkFaint }}>
            {isNew ? "New food" : editing ? "Editing food" : "Food detail"}
          </span>
        </div>
        <HeaderCloseBtn label={editing ? (hasName ? "Done" : "Close") : "Close"} icon={editing && hasName ? "check" : "x"} onClick={handleBackdropClose} />
      </div>

      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: 168 }}>
          <ImageSlot value={image} onChange={setImage} size={168} editing={editing} />
          {!editing && pal && <span style={{ background: pal.soft, color: pal.deep, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 7 }}>{catById[category].name}</span>}
          {editing && <p style={{ fontSize: 11, color: THEME.inkFaint, margin: 0, textAlign: "center", lineHeight: 1.4 }}>{image ? "Tap the photo to change it" : "Tap to take a photo or choose one"}</p>}
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          {editing ? (
            <input autoFocus value={name} onChange={(e) => { setName(e.target.value); setAutofilled(false); }} onBlur={handleNameBlur} placeholder="Food name, e.g. Chicken - wings"
              style={inputStyle({ width: "100%", fontSize: 19, fontWeight: 700, padding: "8px 10px", marginBottom: 10 })} />
          ) : (
            <h2 style={{ margin: "0 0 10px" }}>{food.name}</h2>
          )}

          {editing && (
            <div style={{ marginBottom: 14 }}>
              <Label>Category</Label>
              {!showNewCat ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={category || ""} onChange={(e) => setCategory(e.target.value)} style={inputStyle({ flex: 1 })}>
                    <option value="">Uncategorized</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <GhostBtn icon="plus" onClick={() => setShowNewCat(true)}>New</GhostBtn>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input autoFocus placeholder="Category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} style={inputStyle({ flex: 1 })} />
                  <PrimaryBtn onClick={async () => { if (!newCatName.trim()) return; const id = await onAddCategory(newCatName.trim()); setCategory(id); setNewCatName(""); setShowNewCat(false); }}>Add</PrimaryBtn>
                  <GhostBtn onClick={() => { setShowNewCat(false); setNewCatName(""); }}>Cancel</GhostBtn>
                </div>
              )}
            </div>
          )}

          <div style={{ border: "2px solid " + THEME.ink, borderRadius: 10, padding: "12px 14px", background: editing ? THEME.terracottaSoft : THEME.paperRaised }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "8px solid " + THEME.ink, paddingBottom: 6, marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" }}>Nutrition facts</span>
              {editing ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: THEME.inkSoft }}>per</span>
                  <input type="number" value={nutrition.portion} onChange={(e) => setNutrition({ ...nutrition, portion: e.target.value })} style={inputStyle({ width: 56, padding: "4px 6px", fontSize: 12 })} />
                  <select value={nutrition.unit} onChange={(e) => setNutrition({ ...nutrition, unit: e.target.value })} style={inputStyle({ padding: "4px 6px", fontSize: 12 })}>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: THEME.inkSoft, fontFamily: "var(--font-mono)" }}>per {food.nutrition.portion}{food.nutrition.unit}</span>
              )}
            </div>
            <NutritionRow label="Calories" value={nutrition.cal} editing={editing} bold large onChange={(v) => setNutrition({ ...nutrition, cal: v })} />
            <NutritionRow label="Protein" value={nutrition.protein} unit="g" editing={editing} onChange={(v) => setNutrition({ ...nutrition, protein: v })} />
            <NutritionRow label="Carbohydrates" value={nutrition.carbs} unit="g" editing={editing} onChange={(v) => setNutrition({ ...nutrition, carbs: v })} />
            <NutritionRow label="Fiber" value={nutrition.fiber} unit="g" editing={editing} indent onChange={(v) => setNutrition({ ...nutrition, fiber: v })} />
            <NutritionRow label="Fat" value={nutrition.fat} unit="g" editing={editing} last onChange={(v) => setNutrition({ ...nutrition, fat: v })} />
            {editing && (
              <p style={{ fontSize: 11.5, color: THEME.inkSoft, margin: "10px 0 0", lineHeight: 1.5 }}>
                {autofilled ? "Values auto-filled from common foods — adjust anything that doesn't match." : "Type a recognized name (egg, chicken - wings, rice…) to auto-fill, or enter your own values."}
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingTop: 14, borderTop: "1px solid " + THEME.line, flexWrap: "wrap" }}>
        {!editing ? (
          <>
            <ConfirmDeleteBtn label="Delete food" onConfirm={onDelete} />
            <div style={{ display: "flex", gap: 8 }}>
              <GhostBtn icon="x" onClick={onClose}>Close</GhostBtn>
              <PrimaryBtn icon="edit" onClick={onEdit}>Edit food</PrimaryBtn>
            </div>
          </>
        ) : (
          <>
            {isNew ? <span /> : <ConfirmDeleteBtn label="Delete food" onConfirm={onDelete} />}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: THEME.inkFaint, marginRight: 4 }}>{hasName ? "Tap outside also saves" : "Add a name to save"}</span>
              <PrimaryBtn icon="check" disabled={!hasName || saving} onClick={handleSave}>{saving ? "Saving…" : "Save"}</PrimaryBtn>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  );
}

function Label({ children }) {
  return <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: THEME.inkSoft, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.03em" }}>{children}</label>;
}
function NutritionRow({ label, value, unit, editing, onChange, bold, large, indent, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: large ? "6px 0" : "5px 0", borderBottom: last ? "none" : "1px solid " + THEME.line }}>
      <span style={{ fontSize: large ? 16 : 14, fontWeight: bold ? 700 : 400, paddingLeft: indent ? 14 : 0 }}>{label}</span>
      {editing ? (
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle({ width: 72, padding: "4px 8px", fontSize: large ? 15 : 13, textAlign: "right", fontFamily: "var(--font-mono)" })} />
      ) : (
        <NutNum value={round(Number(value), unit ? 1 : 0)} unit={unit} size={large ? 18 : 14} />
      )}
    </div>
  );
}

/* ---------- Category manager ---------- */
function CategoryModal({ categories, catById, onClose, onAdd, onDelete, onSetColor, onRename }) {
  const [name, setName] = useState("");
  const [openSwatchFor, setOpenSwatchFor] = useState(null);
  return (
    <ModalShell onClose={onClose} width={460} title="Manage categories">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {categories.map((c) => {
          const pal = catById[c.id].palette;
          const swatchOpen = openSwatchFor === c.id;
          return (
            <div key={c.id} style={{ background: THEME.paperRaised, border: "1px solid " + THEME.line, borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setOpenSwatchFor(swatchOpen ? null : c.id)} aria-label={`Change color for ${c.name}`} style={{ width: 28, height: 28, borderRadius: 8, background: pal.hex, border: "2px solid " + (swatchOpen ? THEME.ink : "transparent"), padding: 0, flexShrink: 0 }} />
                <input value={c.name} onChange={(e) => onRename(c.id, e.target.value)} style={inputStyle({ flex: 1, padding: "6px 10px", fontSize: 13.5, fontWeight: 600, border: "1px solid transparent", background: "transparent" })} />
                <ConfirmDeleteIconBtn label={`Delete ${c.name}`} onConfirm={() => onDelete(c.id)} />
              </div>
              {swatchOpen && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid " + THEME.line, flexWrap: "wrap" }}>
                  {CATEGORY_PALETTE.map((p) => {
                    const selected = (c.colorId || pal.id) === p.id;
                    return <button key={p.id} onClick={() => { onSetColor(c.id, p.id); setOpenSwatchFor(null); }} aria-label={`Use ${p.id}`} style={{ width: 28, height: 28, borderRadius: "50%", background: p.hex, border: selected ? "2.5px solid " + THEME.ink : "1px solid " + THEME.line, padding: 0 }} />;
                  })}
                </div>
              )}
            </div>
          );
        })}
        {categories.length === 0 && <p style={{ fontSize: 13, color: THEME.inkSoft }}>No categories yet.</p>}
      </div>
      <div style={{ borderTop: "1px solid " + THEME.line, paddingTop: 14 }}>
        <Label>New category</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Spices" style={inputStyle({ flex: 1 })} />
          <PrimaryBtn onClick={() => { if (name.trim()) { onAdd(name.trim()); setName(""); } }}>Add</PrimaryBtn>
        </div>
        <p style={{ fontSize: 11.5, color: THEME.inkFaint, margin: "6px 0 0" }}>New categories get an unused color — change it anytime by tapping the swatch.</p>
      </div>
      <div style={{ marginTop: 18, textAlign: "right" }}>
        <GhostBtn onClick={onClose}>Done</GhostBtn>
      </div>
    </ModalShell>
  );
}

/* ---------- Recipes ---------- */
function RecipesTab({ recipes, recipeTotals, onNew, onOpen, onDelete, onDuplicate }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <PrimaryBtn icon="plus" onClick={onNew}>New recipe</PrimaryBtn>
      </div>
      {recipes.length === 0 ? (
        <EmptyState icon="tools-kitchen-2" title="No recipes yet" body="Combine pantry foods into a saved recipe." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
          {recipes.map((r) => {
            const t = recipeTotals(r);
            return (
              <div key={r.id} style={{ position: "relative" }}>
                <div onClick={() => onOpen(r)} style={{ background: THEME.paperRaised, border: "1px solid " + THEME.line, borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
                  <div style={{ width: "100%", aspectRatio: "1.15", background: THEME.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {r.image ? <img src={r.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-tools-kitchen-2" style={{ fontSize: 26, color: THEME.inkFaint }} aria-hidden="true" />}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <p style={{ fontWeight: 700, fontSize: 13.5, margin: "0 0 3px" }}>{r.name}</p>
                    <p style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: THEME.inkSoft, margin: 0 }}>{t.cal} cal · {r.ingredients.length} items</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 6, justifyContent: "flex-end" }}>
                  <IconBtn icon="copy" label="Duplicate" onClick={() => onDuplicate(r.id)} />
                  <ConfirmDeleteIconBtn label="Delete recipe" onConfirm={() => onDelete(r.id)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecipeModal({ recipe, mode, foods, categories, catById, recipeTotals, onClose, onEdit, onSave, onSaveAndClose, onDelete }) {
  const editing = mode === "edit";
  const [name, setName] = useState(recipe.name);
  const [image, setImage] = useState(recipe.image);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setName(recipe.name); setImage(recipe.image); setIngredients(recipe.ingredients); }, [recipe.id, mode]);

  const total = useMemo(() => {
    let cal = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
    ingredients.forEach((ing) => { const n = scaleNutrition(ing.nutrition, ing.amount); cal += n.cal; protein += n.protein; carbs += n.carbs; fat += n.fat; fiber += n.fiber; });
    return { cal: round(cal), protein: round(protein, 1), carbs: round(carbs, 1), fat: round(fat, 1), fiber: round(fiber, 1) };
  }, [ingredients]);

  function addIngredient(food) {
    setIngredients((prev) => [...prev, { foodId: food.id, name: food.name, image: food.image, nutrition: food.nutrition, amount: food.nutrition.portion || 100 }]);
    setShowPicker(false);
  }
  function updateAmount(idx, amount) { setIngredients((prev) => prev.map((ing, i) => (i === idx ? { ...ing, amount } : ing))); }
  function removeIngredient(idx) { setIngredients((prev) => prev.filter((_, i) => i !== idx)); }

  function buildRecipe() { return { id: recipe.id, name: name.trim(), image, ingredients }; }
  async function handleSave() {
    if (!name.trim() || ingredients.length === 0 || saving) return;
    setSaving(true);
    try { await onSave(buildRecipe()); } finally { setSaving(false); }
  }
  async function handleBackdropClose() {
    if (editing && name.trim() && ingredients.length > 0) await onSaveAndClose(buildRecipe());
    else onClose();
  }

  const isNew = !recipe.name && editing;
  const canSave = !!name.trim() && ingredients.length > 0;

  return (
    <ModalShell onClose={handleBackdropClose} width={560}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: THEME.inkFaint }}>{isNew ? "New recipe" : editing ? "Editing recipe" : "Recipe"}</span>
        <HeaderCloseBtn label={editing ? (canSave ? "Done" : "Close") : "Close"} icon={editing && canSave ? "check" : "x"} onClick={handleBackdropClose} />
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          <ImageSlot value={image} onChange={setImage} size={84} editing={editing} />
          {editing && <span style={{ fontSize: 10, color: THEME.inkFaint, textAlign: "center", lineHeight: 1.3, maxWidth: 84 }}>{image ? "Tap to change" : "Tap to add photo"}</span>}
        </div>
        <div style={{ flex: 1 }}>
          {editing ? (
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Recipe name" style={inputStyle({ width: "100%", fontSize: 17, fontWeight: 700, padding: "8px 10px", marginBottom: 10 })} />
          ) : (
            <h2 style={{ margin: "0 0 10px" }}>{recipe.name}</h2>
          )}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <TotalStat label="Calories" value={total.cal} />
            <TotalStat label="Protein" value={total.protein + "g"} />
            <TotalStat label="Carbs" value={total.carbs + "g"} />
            <TotalStat label="Fiber" value={total.fiber + "g"} />
            <TotalStat label="Fat" value={total.fat + "g"} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Ingredients</p>
        {editing && <GhostBtn icon="plus" onClick={() => setShowPicker(true)}>Add ingredient</GhostBtn>}
      </div>

      {ingredients.length === 0 ? (
        <div style={{ padding: "1.5rem 0", textAlign: "center", color: THEME.inkFaint, fontSize: 13 }}>No ingredients added yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
          {ingredients.map((ing, idx) => {
            const n = scaleNutrition(ing.nutrition, ing.amount);
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid " + THEME.line, borderRadius: 10, padding: 8, background: THEME.paperRaised }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: THEME.cream, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {ing.image ? <img src={ing.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-apple" style={{ fontSize: 16, color: THEME.inkFaint }} aria-hidden="true" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ing.name}</p>
                  <p style={{ fontSize: 11.5, color: THEME.inkSoft, margin: 0, fontFamily: "var(--font-mono)" }}>{round(n.cal)} cal</p>
                </div>
                {editing ? (
                  <>
                    <input type="number" value={ing.amount} onChange={(e) => updateAmount(idx, Number(e.target.value) || 0)} style={inputStyle({ width: 60, padding: "5px 6px", fontFamily: "var(--font-mono)" })} />
                    <span style={{ fontSize: 12, color: THEME.inkFaint, width: 14 }}>{ing.nutrition.unit}</span>
                    <button onClick={() => removeIngredient(idx)} aria-label="Remove ingredient" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid " + THEME.danger + "44", background: "transparent", color: THEME.danger, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                      <i className="ti ti-trash" style={{ fontSize: 14 }} aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <NutNum value={ing.amount} unit={ing.nutrition.unit} size={13} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingTop: 14, borderTop: "1px solid " + THEME.line, flexWrap: "wrap" }}>
        {!editing ? (
          <>
            <ConfirmDeleteBtn label="Delete recipe" onConfirm={onDelete} />
            <div style={{ display: "flex", gap: 8 }}>
              <GhostBtn icon="x" onClick={onClose}>Close</GhostBtn>
              <PrimaryBtn icon="edit" onClick={onEdit}>Edit recipe</PrimaryBtn>
            </div>
          </>
        ) : (
          <>
            {isNew ? <span /> : <ConfirmDeleteBtn label="Delete recipe" onConfirm={onDelete} />}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: THEME.inkFaint, marginRight: 4 }}>{canSave ? "Tap outside also saves" : !name.trim() ? "Add a name to save" : "Add at least one ingredient"}</span>
              <PrimaryBtn icon="check" disabled={!canSave || saving} onClick={handleSave}>{saving ? "Saving…" : "Save"}</PrimaryBtn>
            </div>
          </>
        )}
      </div>

      {showPicker && <IngredientPickerModal foods={foods} categories={categories} catById={catById} onPick={addIngredient} onClose={() => setShowPicker(false)} />}
    </ModalShell>
  );
}

function TotalStat({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 10.5, color: THEME.inkFaint, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.03em" }}>{label}</p>
      <NutNum value={value} size={15} />
    </div>
  );
}

function IngredientPickerModal({ foods, categories, catById, onPick, onClose }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = foods.filter((f) => (filter === "all" || f.category === filter) && f.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <ModalShell onClose={onClose} width={420} title="Add ingredient" overlayLevel={2}>
      <input autoFocus placeholder="Search foods" value={search} onChange={(e) => setSearch(e.target.value)} style={inputStyle({ width: "100%", marginBottom: 10 })} />
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 10 }}>
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        {categories.map((c) => <FilterChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={c.name} pal={catById[c.id].palette} />)}
      </div>
      <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.length === 0 && <p style={{ fontSize: 13, color: THEME.inkFaint, textAlign: "center", padding: "1rem 0" }}>No foods match.</p>}
        {filtered.map((f) => (
          <div key={f.id} onClick={() => onPick(f)} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 9, cursor: "pointer", border: "1px solid " + THEME.line }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: THEME.cream, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {f.image ? <img src={f.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-apple" style={{ fontSize: 14, color: THEME.inkFaint }} aria-hidden="true" />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{f.name}</p>
              <p style={{ fontSize: 11.5, color: THEME.inkSoft, margin: 0, fontFamily: "var(--font-mono)" }}>{round(f.nutrition.cal)} cal / {f.nutrition.portion}{f.nutrition.unit}</p>
            </div>
            {catById[f.category] && <span style={{ background: catById[f.category].palette.soft, color: catById[f.category].palette.deep, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>{catById[f.category].name}</span>}
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function FilterChip({ active, onClick, label, pal }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: 20,
      border: active ? `1px solid ${pal ? pal.hex : THEME.lineStrong}` : "1px solid " + THEME.line,
      background: active ? (pal ? pal.soft : THEME.cream) : "transparent",
      color: active ? (pal ? pal.deep : THEME.ink) : THEME.inkSoft,
    }}>{label}</button>
  );
}

/* ---------- Plan ---------- */
function PlanTab({ plan, recipes, recipeTotals, selectedDay, setSelectedDay, onAddClick, onRemove, onDuplicateToDay, onOpenRecipe }) {
  const recipeById = useMemo(() => { const m = {}; recipes.forEach((r) => (m[r.id] = r)); return m; }, [recipes]);
  const dayItems = plan[selectedDay] || [];
  const dayTotals = useMemo(() => {
    let cal = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
    dayItems.forEach((inst) => { const r = recipeById[inst.recipeId]; if (!r) return; const t = recipeTotals(r); cal += t.cal; protein += t.protein; carbs += t.carbs; fat += t.fat; fiber += t.fiber; });
    return { cal: round(cal), protein: round(protein, 1), carbs: round(carbs, 1), fat: round(fat, 1), fiber: round(fiber, 1) };
  }, [dayItems, recipeById, recipeTotals]);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
        {DAYS.map((d) => {
          const count = (plan[d] || []).length;
          const active = d === selectedDay;
          return (
            <button key={d} onClick={() => setSelectedDay(d)} style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 11, border: active ? "1px solid " + THEME.sageDeep : "1px solid " + THEME.line, background: active ? THEME.sage : "transparent", color: active ? THEME.sageDeep : THEME.inkSoft }}>
              {d}{count > 0 && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      <div style={{ background: THEME.cream, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <TotalStat label={`${selectedDay} · calories`} value={dayTotals.cal} />
        <TotalStat label="Protein" value={dayTotals.protein + "g"} />
        <TotalStat label="Carbs" value={dayTotals.carbs + "g"} />
        <TotalStat label="Fiber" value={dayTotals.fiber + "g"} />
        <TotalStat label="Fat" value={dayTotals.fat + "g"} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <PrimaryBtn icon="plus" disabled={recipes.length === 0} onClick={() => onAddClick(selectedDay)}>Add recipe to {selectedDay}</PrimaryBtn>
      </div>

      {recipes.length === 0 ? (
        <EmptyState icon="calendar-event" title="No recipes to plan yet" body="Save a recipe first, then add it to a day." />
      ) : dayItems.length === 0 ? (
        <EmptyState icon="calendar-plus" title={`Nothing planned for ${selectedDay}`} body="Add a saved recipe to this day." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
          {dayItems.map((inst) => {
            const r = recipeById[inst.recipeId];
            if (!r) return null;
            const t = recipeTotals(r);
            return <PlanCard key={inst.instanceId} recipe={r} totals={t} onOpen={() => onOpenRecipe(r)} onRemove={() => onRemove(selectedDay, inst.instanceId)} onDuplicate={(targetDay) => onDuplicateToDay(selectedDay, inst.instanceId, targetDay)} />;
          })}
        </div>
      )}
    </div>
  );
}

function PlanCard({ recipe, totals, onOpen, onRemove, onDuplicate }) {
  const [showDup, setShowDup] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div onClick={onOpen} style={{ background: THEME.paperRaised, border: "1px solid " + THEME.line, borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
        <div style={{ width: "100%", aspectRatio: "1.15", background: THEME.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {recipe.image ? <img src={recipe.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-tools-kitchen-2" style={{ fontSize: 24, color: THEME.inkFaint }} aria-hidden="true" />}
        </div>
        <div style={{ padding: "8px 10px" }}>
          <p style={{ fontWeight: 700, fontSize: 13.5, margin: "0 0 3px" }}>{recipe.name}</p>
          <p style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: THEME.inkSoft, margin: 0 }}>{totals.cal} cal</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 6, justifyContent: "flex-end", position: "relative" }}>
        <IconBtn icon="copy" label="Duplicate to another day" onClick={() => setShowDup((s) => !s)} />
        <ConfirmDeleteIconBtn label="Remove" onConfirm={onRemove} />
        {showDup && (
          <div style={{ position: "absolute", top: 36, right: 0, background: THEME.paperRaised, border: "1px solid " + THEME.lineStrong, borderRadius: 9, padding: 6, zIndex: 5, display: "flex", flexDirection: "column", gap: 2, minWidth: 90 }}>
            {DAYS.map((d) => <button key={d} onClick={() => { onDuplicate(d); setShowDup(false); }} style={{ fontSize: 12, padding: "4px 8px", textAlign: "left", border: "none", background: "transparent" }}>{d}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

function RecipePickerModal({ day, recipes, onPick, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <ModalShell onClose={onClose} width={400} title={`Add recipe to ${day}`}>
      <input autoFocus placeholder="Search recipes" value={search} onChange={(e) => setSearch(e.target.value)} style={inputStyle({ width: "100%", marginBottom: 10 })} />
      <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.length === 0 && <p style={{ fontSize: 13, color: THEME.inkFaint, textAlign: "center", padding: "1rem 0" }}>No recipes match.</p>}
        {filtered.map((r) => (
          <div key={r.id} onClick={() => onPick(r.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 9, cursor: "pointer", border: "1px solid " + THEME.line }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: THEME.cream, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {r.image ? <img src={r.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-tools-kitchen-2" style={{ fontSize: 14, color: THEME.inkFaint }} aria-hidden="true" />}
            </div>
            <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{r.name}</p>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

/* ---------- Modal shell ---------- */
function ModalShell({ title, children, onClose, width = 420, overlayLevel = 1 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(35,30,20,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 + overlayLevel, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: THEME.bg, borderRadius: 18, border: "1px solid " + THEME.line, padding: "1.4rem 1.4rem 1.1rem", width: "100%", maxWidth: width, maxHeight: "88vh", overflowY: "auto" }}>
        {title && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>{title}</h3>
            <HeaderCloseBtn label="Close" icon="x" onClick={onClose} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
