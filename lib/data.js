import { supabase } from "./supabaseClient";

const BUCKET = "pantry-images";

/* ---------- Images ---------- */
export async function uploadImage(file) {
  const ext = file.name?.split(".").pop() || "jpg";
  const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/* ---------- Categories ---------- */
export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map((c) => ({ id: c.id, name: c.name, colorId: c.color_id }));
}

export async function insertCategory(name, colorId) {
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, color_id: colorId })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, name: data.name, colorId: data.color_id };
}

export async function updateCategory(id, fields) {
  const payload = {};
  if (fields.name !== undefined) payload.name = fields.name;
  if (fields.colorId !== undefined) payload.color_id = fields.colorId;
  const { error } = await supabase.from("categories").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteCategoryRow(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Foods ---------- */
export async function fetchFoods() {
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(rowToFood);
}

function rowToFood(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category_id,
    image: row.image_url,
    createdAt: new Date(row.created_at).getTime(),
    nutrition: {
      cal: row.cal,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      fiber: row.fiber,
      unit: row.unit,
      portion: row.portion,
    },
  };
}

export async function upsertFood(food) {
  const payload = {
    name: food.name,
    category_id: food.category || null,
    image_url: food.image || null,
    cal: food.nutrition.cal,
    protein: food.nutrition.protein,
    carbs: food.nutrition.carbs,
    fat: food.nutrition.fat,
    fiber: food.nutrition.fiber,
    unit: food.nutrition.unit,
    portion: food.nutrition.portion,
  };
  if (food.id && !food.id.startsWith("local_")) payload.id = food.id;

  const { data, error } = await supabase.from("foods").upsert(payload).select().single();
  if (error) throw error;
  return rowToFood(data);
}

export async function deleteFoodRow(id) {
  const { error } = await supabase.from("foods").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Recipes ---------- */
export async function fetchRecipes() {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    image: row.image_url,
    ingredients: row.ingredients || [],
  }));
}

export async function upsertRecipe(recipe) {
  const payload = {
    name: recipe.name,
    image_url: recipe.image || null,
    ingredients: recipe.ingredients,
  };
  if (recipe.id && !recipe.id.startsWith("local_")) payload.id = recipe.id;

  const { data, error } = await supabase.from("recipes").upsert(payload).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, image: data.image_url, ingredients: data.ingredients || [] };
}

export async function deleteRecipeRow(id) {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Plan ---------- */
export async function fetchPlan() {
  const { data, error } = await supabase.from("plan_items").select("*");
  if (error) throw error;
  const plan = {};
  for (const row of data) {
    if (!plan[row.day]) plan[row.day] = [];
    plan[row.day].push({ instanceId: row.id, recipeId: row.recipe_id });
  }
  return plan;
}

export async function insertPlanItem(day, recipeId) {
  const { data, error } = await supabase
    .from("plan_items")
    .insert({ day, recipe_id: recipeId })
    .select()
    .single();
  if (error) throw error;
  return { instanceId: data.id, recipeId: data.recipe_id };
}

export async function deletePlanItem(instanceId) {
  const { error } = await supabase.from("plan_items").delete().eq("id", instanceId);
  if (error) throw error;
}
