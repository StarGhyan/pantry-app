"use client";
import { useState, useEffect, useMemo, useRef } from "react";


/* ── palette ── */
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
function pal(cat) {
  if (!cat) return CATEGORY_PALETTE[0];
  return CATEGORY_PALETTE.find((x) => x.id === cat.colorId) || CATEGORY_PALETTE[0];
}

const T = {
  bg: "#F1EDE0", paper: "#FBF7EE", raised: "#FFFFFF",
  ink: "#2E3324", soft: "#5C6650", faint: "#8C9480",
  line: "#DDD8C6", lineS: "#C7C1AA",
  sage: "#E7EBDA", sageD: "#3D4A2E",
  tc: "#C4683D", tcSoft: "#F3E3D8",
  cream: "#F3EEE0", danger: "#A23B2E",
};

const DEFAULT_CATEGORIES = [
  { id: "meat",     name: "Meat",           colorId: "p7" },
  { id: "fish",     name: "Fish & seafood",  colorId: "p8" },
  { id: "protein",  name: "Protein",         colorId: "p1" },
  { id: "veg",      name: "Vegetables",      colorId: "p2" },
  { id: "dairy",    name: "Dairy",           colorId: "p3" },
  { id: "milk",     name: "Milk",            colorId: "p9" },
  { id: "grain",    name: "Grains",          colorId: "p4" },
  { id: "fruit",    name: "Fruit",           colorId: "p5" },
  { id: "berries",  name: "Berries",         colorId: "p5" },
  { id: "seasoning",name: "Seasoning & herbs",colorId: "p6" },
  { id: "oil",      name: "Oils",            colorId: "p6" },
  { id: "hifiber",  name: "High fiber",      colorId: "p2" },
  { id: "lowcal",   name: "Low calorie",     colorId: "p8" },
  { id: "baking",   name: "Baking",          colorId: "p4" },
  { id: "canned",   name: "Canned goods",    colorId: "p6" },
  { id: "supplement",name:"Supplements",     colorId: "p1" },
  { id: "beverage", name: "Beverages",       colorId: "p9" },
];

/* Subcategories shown when a main category is selected.
   Each entry is { label, emoji, match } where match is a substring
   of the food name (case-insensitive). Tapping a subcategory
   additionally filters the grid to only matching names. */
const SUBCATS = {
  meat: [
    { id: "chicken", label: "Chicken", emoji: "🍗" },
    { id: "beef",    label: "Beef",    emoji: "🥩" },
    { id: "ground",  label: "Ground beef", emoji: "🍔", names: ["ground beef"] },
    { id: "pork",    label: "Pork",    emoji: "🥓" },
    { id: "turkey",  label: "Turkey",  emoji: "🦃" },
    { id: "lamb",    label: "Lamb",    emoji: "🍖" },
  ],
  fish: [
    { id: "salmon",  label: "Salmon",  emoji: "🐟" },
    { id: "tuna",    label: "Tuna",    emoji: "🐟" },
    { id: "shrimp",  label: "Shrimp",  emoji: "🦐" },
    { id: "cod",     label: "Cod",     emoji: "🐠" },
    { id: "tilapia", label: "Tilapia", emoji: "🐠" },
    { id: "sardines",label: "Sardines",emoji: "🐟" },
  ],
  protein: [
    { id: "egg",          label: "Eggs",         emoji: "🥚" },
    { id: "tofu",         label: "Tofu",         emoji: "🟦" },
    { id: "beans",        label: "Beans & lentils",emoji: "🫘" },
    { id: "nuts",         label: "Nuts & nut butters",emoji: "🥜" },
    { id: "greek yogurt", label: "Greek yogurt", emoji: "🥛" },
    { id: "cottage",      label: "Cottage cheese",emoji: "🧀" },
  ],
  veg: [
    { id: "leafy",    label: "Leafy greens", emoji: "🥬", names: ["spinach","kale","lettuce"] },
    { id: "crucifer", label: "Cruciferous",  emoji: "🥦", names: ["broccoli","cauliflower"] },
    { id: "root",     label: "Root veg",     emoji: "🥕", names: ["carrot","potato","sweet potato","jicama","yellow potato"] },
    { id: "allium",   label: "Alliums",      emoji: "🧅", names: ["onion","garlic"] },
    { id: "pepper",   label: "Peppers",      emoji: "🫑", names: ["bell pepper","jalapeño"] },
    { id: "other_veg",label: "Other",        emoji: "🥒", names: ["cucumber","zucchini","mushroom","celery","asparagus","green beans","tomato"] },
  ],
  milk: [
    { id: "dairy_milk",  label: "Dairy milk",   emoji: "🥛", names: ["whole milk","milk 2%","milk 1%","skim milk"] },
    { id: "nondairy",    label: "Non-dairy",    emoji: "🌾", names: ["oat milk","almond milk","soy milk","coconut milk"] },
  ],
  dairy: [
    { id: "cheese",  label: "Cheese",       emoji: "🧀", names: ["cheddar","mozzarella","cream cheese","cottage cheese"] },
    { id: "cream",   label: "Cream & butter",emoji: "🧈", names: ["butter","heavy cream"] },
    { id: "yogurt",  label: "Yogurt",       emoji: "🥛", names: ["greek yogurt"] },
  ],
  fruit: [
    { id: "tropical",label: "Tropical",    emoji: "🥭", names: ["mango","pineapple","banana","watermelon","coconut"] },
    { id: "citrus",  label: "Citrus",      emoji: "🍊", names: ["orange","lemon"] },
    { id: "stone",   label: "Stone & pome",emoji: "🍎", names: ["apple","pear","grapes"] },
    { id: "avocado", label: "Avocado",     emoji: "🥑", names: ["avocado"] },
  ],
  berries: [
    { id: "strawberry", label: "Strawberry", emoji: "🍓" },
    { id: "blueberry",  label: "Blueberry",  emoji: "🫐" },
    { id: "raspberry",  label: "Raspberry",  emoji: "🍓" },
    { id: "blackberry", label: "Blackberry", emoji: "🍇" },
    { id: "cranberry",  label: "Cranberry",  emoji: "🔴" },
  ],
  grain: [
    { id: "rice",    label: "Rice",       emoji: "🍚", names: ["white rice","brown rice"] },
    { id: "oats",    label: "Oats & quinoa",emoji:"🌾",names: ["oats","quinoa"] },
    { id: "bread",   label: "Bread & wraps",emoji:"🍞",names: ["bread","tortilla"] },
    { id: "pasta",   label: "Pasta",      emoji: "🍝", names: ["pasta"] },
  ],
  seasoning: [
    { id: "herbs",   label: "Fresh herbs",  emoji: "🌿", names: ["cilantro","basil","oregano"] },
    { id: "spices",  label: "Spices",       emoji: "🌶️", names: ["paprika","cumin","turmeric","chili powder","cinnamon","black pepper","ginger","garlic powder"] },
    { id: "basics",  label: "Basics",       emoji: "🧂", names: ["salt"] },
  ],
  oil: [
    { id: "olive",   label: "Olive oil",   emoji: "🫒" },
    { id: "coconut_oil", label: "Coconut", emoji: "🥥" },
    { id: "sesame",  label: "Sesame",      emoji: "🌰" },
    { id: "avocado_oil",label:"Avocado",   emoji: "🥑" },
  ],
  baking: [
    { id: "flour",   label: "Flours",      emoji: "🌾", names: ["flour"] },
    { id: "yeast",   label: "Yeast",       emoji: "🧫", names: ["yeast"] },
    { id: "leavening",label:"Leavening",   emoji: "🥄", names: ["baking powder","baking soda","cornstarch"] },
    { id: "sweetener",label:"Sweeteners",  emoji: "🍬", names: ["sugar","powdered sugar"] },
    { id: "cacao_bake",label:"Cacao & chocolate",emoji:"🍫", names: ["cacao","chocolate"] },
  ],
  canned: [
    { id: "canned_beans",label:"Beans",    emoji: "🫘", names: ["beans","chickpeas"] },
    { id: "canned_veg",  label:"Vegetables",emoji:"🥫", names: ["corn","tomato","green beans"] },
    { id: "canned_tomato",label:"Tomato products",emoji:"🍅", names: ["tomato"] },
  ],
  supplement: [
    { id: "protein_powder",label:"Protein powder",emoji:"💪", names: ["protein powder"] },
    { id: "collagen_sup",label:"Collagen",emoji:"✨", names: ["collagen"] },
    { id: "creatine_sup",label:"Creatine",emoji:"⚡", names: ["creatine"] },
  ],
  beverage: [
    { id: "tea",label:"Tea",emoji:"🍵", names: ["tea","matcha","earl grey","chamomile","mint tea","oolong"] },
    { id: "coffee_bev",label:"Coffee",emoji:"☕", names: ["coffee"] },
    { id: "juice",label:"Juice & drinks",emoji:"🧃", names: ["juice","lemonade","coconut water"] },
  ],
};

const NDB = {
  "chicken - breast":    {cal:165,protein:31,  carbs:0,   sugar:0,   fiber:0,   fat:3.6, unit:"g", portion:150},
  "chicken - thigh":     {cal:209,protein:26,  carbs:0,   sugar:0,   fiber:0,   fat:11,  unit:"g", portion:130},
  "chicken - wings":     {cal:203,protein:30,  carbs:0,   sugar:0,   fiber:0,   fat:8,   unit:"g", portion:90},
  "chicken - drumstick": {cal:172,protein:28,  carbs:0,   sugar:0,   fiber:0,   fat:5.7, unit:"g", portion:110},
  "beef - ground":       {cal:250,protein:26,  carbs:0,   sugar:0,   fiber:0,   fat:17,  unit:"g", portion:150},
  "beef - steak":        {cal:207,protein:26,  carbs:0,   sugar:0,   fiber:0,   fat:11,  unit:"g", portion:200},
  "beef - ribs":         {cal:291,protein:24,  carbs:0,   sugar:0,   fiber:0,   fat:22,  unit:"g", portion:200},
  "pork - chop":         {cal:231,protein:25,  carbs:0,   sugar:0,   fiber:0,   fat:14,  unit:"g", portion:150},
  "pork - bacon":        {cal:541,protein:37,  carbs:1.4, sugar:0,   fiber:0,   fat:42,  unit:"g", portion:16},
  "turkey - breast":     {cal:135,protein:30,  carbs:0,   sugar:0,   fiber:0,   fat:0.7, unit:"g", portion:150},
  "lamb - chop":         {cal:294,protein:25,  carbs:0,   sugar:0,   fiber:0,   fat:21,  unit:"g", portion:150},
  "salmon":              {cal:208,protein:20,  carbs:0,   sugar:0,   fiber:0,   fat:13,  unit:"g", portion:150},
  "tuna":                {cal:132,protein:28,  carbs:0,   sugar:0,   fiber:0,   fat:1.3, unit:"g", portion:150},
  "shrimp":              {cal:99, protein:24,  carbs:0.2, sugar:0,   fiber:0,   fat:0.3, unit:"g", portion:100},
  "cod":                 {cal:82, protein:18,  carbs:0,   sugar:0,   fiber:0,   fat:0.7, unit:"g", portion:150},
  "tilapia":             {cal:96, protein:20,  carbs:0,   sugar:0,   fiber:0,   fat:1.7, unit:"g", portion:150},
  "sardines":            {cal:208,protein:25,  carbs:0,   sugar:0,   fiber:0,   fat:11,  unit:"g", portion:100},
  "egg":                 {cal:155,protein:13,  carbs:1.1, sugar:1.1, fiber:0,   fat:11,  unit:"g", portion:50},
  "tofu":                {cal:76, protein:8,   carbs:1.9, sugar:0.5, fiber:0.3, fat:4.8, unit:"g", portion:100},
  "lentils":             {cal:116,protein:9,   carbs:20,  sugar:1.8, fiber:7.9, fat:0.4, unit:"g", portion:100},
  "chickpeas":           {cal:164,protein:8.9, carbs:27,  sugar:4.8, fiber:7.6, fat:2.6, unit:"g", portion:120},
  "black beans":         {cal:132,protein:8.9, carbs:24,  sugar:0.3, fiber:8.7, fat:0.5, unit:"g", portion:120},
  "edamame":             {cal:122,protein:11,  carbs:9.9, sugar:2.2, fiber:5.2, fat:5.2, unit:"g", portion:100},
  "almonds":             {cal:579,protein:21,  carbs:22,  sugar:4.4, fiber:12.5,fat:50,  unit:"g", portion:28},
  "peanut butter":       {cal:588,protein:25,  carbs:20,  sugar:9,   fiber:6,   fat:50,  unit:"g", portion:32},
  "greek yogurt":        {cal:59, protein:10,  carbs:3.6, sugar:3.2, fiber:0,   fat:0.4, unit:"g", portion:170},
  "cottage cheese":      {cal:98, protein:11,  carbs:3.4, sugar:2.7, fiber:0,   fat:4.3, unit:"g", portion:110},
  "broccoli":            {cal:34, protein:2.8, carbs:7,   sugar:1.7, fiber:2.6, fat:0.4, unit:"g", portion:90},
  "spinach":             {cal:23, protein:2.9, carbs:3.6, sugar:0.4, fiber:2.2, fat:0.4, unit:"g", portion:60},
  "kale":                {cal:49, protein:4.3, carbs:8.8, sugar:2.3, fiber:3.6, fat:0.9, unit:"g", portion:67},
  "tomato":              {cal:18, protein:0.9, carbs:3.9, sugar:2.6, fiber:1.2, fat:0.2, unit:"g", portion:120},
  "onion":               {cal:40, protein:1.1, carbs:9.3, sugar:4.2, fiber:1.7, fat:0.1, unit:"g", portion:80},
  "garlic":              {cal:149,protein:6.4, carbs:33,  sugar:1,   fiber:2.1, fat:0.5, unit:"g", portion:6},
  "carrot":              {cal:41, protein:0.9, carbs:10,  sugar:4.7, fiber:2.8, fat:0.2, unit:"g", portion:60},
  "bell pepper":         {cal:31, protein:1,   carbs:6,   sugar:4.2, fiber:2.1, fat:0.3, unit:"g", portion:120},
  "jalapeño":            {cal:29, protein:0.9, carbs:6.5, sugar:4.1, fiber:2.8, fat:0.4, unit:"g", portion:45},
  "cucumber":            {cal:15, protein:0.7, carbs:3.6, sugar:1.7, fiber:0.5, fat:0.1, unit:"g", portion:120},
  "zucchini":            {cal:17, protein:1.2, carbs:3.1, sugar:2.5, fiber:1,   fat:0.3, unit:"g", portion:120},
  "mushroom":            {cal:22, protein:3.1, carbs:3.3, sugar:2,   fiber:1,   fat:0.3, unit:"g", portion:70},
  "sweet potato":        {cal:86, protein:1.6, carbs:20,  sugar:4.2, fiber:3,   fat:0.1, unit:"g", portion:130},
  "yellow potato":       {cal:77, protein:2,   carbs:17,  sugar:0.8, fiber:2.2, fat:0.1, unit:"g", portion:170},
  "jicama":              {cal:38, protein:0.7, carbs:8.8, sugar:1.8, fiber:4.9, fat:0.1, unit:"g", portion:120},
  "cauliflower":         {cal:25, protein:1.9, carbs:5,   sugar:1.9, fiber:2,   fat:0.3, unit:"g", portion:100},
  "lettuce":             {cal:17, protein:1.2, carbs:3.3, sugar:1.2, fiber:2.1, fat:0.3, unit:"g", portion:80},
  "celery":              {cal:16, protein:0.7, carbs:3,   sugar:1.3, fiber:1.6, fat:0.2, unit:"g", portion:80},
  "green beans":         {cal:31, protein:1.8, carbs:7,   sugar:3.3, fiber:3.4, fat:0.2, unit:"g", portion:100},
  "asparagus":           {cal:20, protein:2.2, carbs:3.9, sugar:1.9, fiber:2.1, fat:0.1, unit:"g", portion:90},
  "banana":              {cal:89, protein:1.1, carbs:23,  sugar:12,  fiber:2.6, fat:0.3, unit:"g", portion:120},
  "apple":               {cal:52, protein:0.3, carbs:14,  sugar:10,  fiber:2.4, fat:0.2, unit:"g", portion:180},
  "avocado":             {cal:160,protein:2,   carbs:8.5, sugar:0.7, fiber:6.7, fat:14.7,unit:"g", portion:100},
  "orange":              {cal:47, protein:0.9, carbs:12,  sugar:9.4, fiber:2.4, fat:0.1, unit:"g", portion:130},
  "mango":               {cal:60, protein:0.8, carbs:15,  sugar:13.7,fiber:1.6, fat:0.4, unit:"g", portion:165},
  "watermelon":          {cal:30, protein:0.6, carbs:7.6, sugar:6.2, fiber:0.4, fat:0.2, unit:"g", portion:280},
  "grapes":              {cal:69, protein:0.7, carbs:18,  sugar:15.5,fiber:0.9, fat:0.2, unit:"g", portion:150},
  "lemon":               {cal:29, protein:1.1, carbs:9.3, sugar:2.5, fiber:2.8, fat:0.3, unit:"g", portion:60},
  "pineapple":           {cal:50, protein:0.5, carbs:13,  sugar:9.9, fiber:1.4, fat:0.1, unit:"g", portion:165},
  "pear":                {cal:57, protein:0.4, carbs:15,  sugar:9.8, fiber:3.1, fat:0.1, unit:"g", portion:180},
  "strawberry":          {cal:32, protein:0.7, carbs:7.7, sugar:4.9, fiber:2,   fat:0.3, unit:"g", portion:150},
  "blueberry":           {cal:57, protein:0.7, carbs:14,  sugar:10,  fiber:2.4, fat:0.3, unit:"g", portion:145},
  "raspberry":           {cal:52, protein:1.2, carbs:11.9,sugar:4.4, fiber:6.5, fat:0.7, unit:"g", portion:125},
  "blackberry":          {cal:43, protein:1.4, carbs:9.6, sugar:4.9, fiber:5.3, fat:0.5, unit:"g", portion:145},
  "cranberry":           {cal:46, protein:0.4, carbs:12,  sugar:4,   fiber:4.6, fat:0.1, unit:"g", portion:100},
  "cheddar cheese":      {cal:402,protein:25,  carbs:1.3, sugar:0.5, fiber:0,   fat:33,  unit:"g", portion:30},
  "mozzarella":          {cal:280,protein:28,  carbs:2.2, sugar:0.5, fiber:0,   fat:17,  unit:"g", portion:30},
  "cream cheese":        {cal:342,protein:6,   carbs:4,   sugar:3.2, fiber:0,   fat:34,  unit:"g", portion:30},
  "heavy cream":         {cal:345,protein:2.1, carbs:2.8, sugar:2.8, fiber:0,   fat:37,  unit:"g", portion:30},
  "butter":              {cal:717,protein:0.9, carbs:0.1, sugar:0.1, fiber:0,   fat:81,  unit:"g", portion:14},
  "whole milk":          {cal:61, protein:3.2, carbs:4.8, sugar:5.1, fiber:0,   fat:3.3, unit:"ml",portion:240},
  "milk 2%":             {cal:50, protein:3.4, carbs:4.9, sugar:5.1, fiber:0,   fat:2,   unit:"ml",portion:240},
  "milk 1%":             {cal:42, protein:3.4, carbs:5,   sugar:5.1, fiber:0,   fat:1,   unit:"ml",portion:240},
  "skim milk":           {cal:34, protein:3.4, carbs:5,   sugar:5.1, fiber:0,   fat:0.1, unit:"ml",portion:240},
  "oat milk":            {cal:45, protein:1,   carbs:6.6, sugar:4,   fiber:0.5, fat:1.5, unit:"ml",portion:240},
  "almond milk":         {cal:15, protein:0.6, carbs:0.6, sugar:0,   fiber:0.3, fat:1.2, unit:"ml",portion:240},
  "soy milk":            {cal:43, protein:3.3, carbs:4.9, sugar:3.9, fiber:0.3, fat:1.6, unit:"ml",portion:240},
  "coconut milk":        {cal:230,protein:2.3, carbs:5.5, sugar:3.3, fiber:0,   fat:24,  unit:"ml",portion:120},
  "white rice":          {cal:130,protein:2.7, carbs:28,  sugar:0,   fiber:0.4, fat:0.3, unit:"g", portion:150},
  "brown rice":          {cal:123,protein:2.7, carbs:26,  sugar:0.4, fiber:1.6, fat:1,   unit:"g", portion:150},
  "oats":                {cal:389,protein:17,  carbs:66,  sugar:0.8, fiber:10.6,fat:7,   unit:"g", portion:40},
  "quinoa":              {cal:120,protein:4.4, carbs:21,  sugar:0.9, fiber:2.8, fat:1.9, unit:"g", portion:90},
  "bread":               {cal:247,protein:13,  carbs:41,  sugar:5.7, fiber:6,   fat:3.4, unit:"g", portion:35},
  "pasta":               {cal:131,protein:5,   carbs:25,  sugar:0.6, fiber:1.8, fat:1.1, unit:"g", portion:140},
  "tortilla":            {cal:218,protein:5.7, carbs:36,  sugar:1.9, fiber:2.2, fat:5.4, unit:"g", portion:45},
  "salt":                {cal:0,  protein:0,   carbs:0,   sugar:0,   fiber:0,   fat:0,   unit:"g", portion:2},
  "black pepper":        {cal:251,protein:10,  carbs:64,  sugar:0.6, fiber:25,  fat:3.3, unit:"g", portion:2},
  "cinnamon":            {cal:247,protein:4,   carbs:80.6,sugar:2.2, fiber:53,  fat:1.2, unit:"g", portion:2},
  "cumin":               {cal:375,protein:18,  carbs:44,  sugar:2.3, fiber:11,  fat:22,  unit:"g", portion:2},
  "paprika":             {cal:282,protein:14,  carbs:54,  sugar:10,  fiber:35,  fat:13,  unit:"g", portion:2},
  "turmeric":            {cal:312,protein:9.7, carbs:67,  sugar:3.2, fiber:22,  fat:3.3, unit:"g", portion:2},
  "ginger":              {cal:80, protein:1.8, carbs:18,  sugar:1.7, fiber:2,   fat:0.8, unit:"g", portion:5},
  "cilantro":            {cal:23, protein:2.1, carbs:3.7, sugar:0.9, fiber:2.8, fat:0.5, unit:"g", portion:4},
  "garlic powder":       {cal:331,protein:16,  carbs:73,  sugar:2.4, fiber:9,   fat:0.7, unit:"g", portion:3},
  "oregano":             {cal:265,protein:9,   carbs:69,  sugar:4.1, fiber:42,  fat:4.3, unit:"g", portion:1},
  "chili powder":        {cal:282,protein:13,  carbs:50,  sugar:7.5, fiber:34,  fat:14,  unit:"g", portion:3},
  "basil":               {cal:23, protein:3.2, carbs:2.7, sugar:0.3, fiber:1.6, fat:0.6, unit:"g", portion:2},
  /* PROTEIN POWDERS & SUPPLEMENTS */
  "whey protein powder":     {cal:400,protein:80,  carbs:8,   sugar:3,   fiber:0,   fat:6,   unit:"g", portion:32},
  "plant protein powder":    {cal:370,protein:75,  carbs:10,  sugar:2,   fiber:3,   fat:5,   unit:"g", portion:32},
  "casein protein powder":   {cal:370,protein:80,  carbs:6,   sugar:2,   fiber:0,   fat:3,   unit:"g", portion:32},
  /* CACAO & CHOCOLATE */
  "cacao powder":            {cal:229,protein:20,  carbs:42,  sugar:1.8, fiber:33,  fat:12,  unit:"g", portion:10},
  "cacao nibs":              {cal:480,protein:15,  carbs:36,  sugar:2,   fiber:28,  fat:38,  unit:"g", portion:14},
  "dark chocolate":          {cal:546,protein:5,   carbs:60,  sugar:48,  fiber:7,   fat:31,  unit:"g", portion:30},
  /* CANNED VEGETABLES & LEGUMES */
  "corn - canned":           {cal:86, protein:3.2, carbs:19,  sugar:3.8, fiber:2.4, fat:0.9, unit:"g", portion:125},
  "chickpeas - canned":      {cal:119,protein:7,   carbs:20,  sugar:3.5, fiber:5.3, fat:2,   unit:"g", portion:130},
  "black beans - canned":    {cal:91, protein:6,   carbs:17,  sugar:0.3, fiber:6,   fat:0.3, unit:"g", portion:130},
  "kidney beans - red canned":{cal:90,protein:6.2, carbs:16,  sugar:0.3, fiber:4.3, fat:0.4, unit:"g", portion:130},
  "kidney beans - dark canned":{cal:92,protein:6.4,carbs:16.5,sugar:0.3, fiber:5,   fat:0.4, unit:"g", portion:130},
  "green beans - canned":    {cal:21, protein:1.2, carbs:4.9, sugar:2.5, fiber:1.8, fat:0.1, unit:"g", portion:120},
  "pinto beans - canned":    {cal:88, protein:5.5, carbs:16,  sugar:0.3, fiber:5.5, fat:0.4, unit:"g", portion:130},
  "navy beans - canned":     {cal:79, protein:5.3, carbs:15,  sugar:0.3, fiber:5.3, fat:0.3, unit:"g", portion:130},
  "tomato - canned":         {cal:17, protein:0.9, carbs:3.5, sugar:2.4, fiber:1.1, fat:0.2, unit:"g", portion:240},
  "tomato paste":            {cal:82, protein:4.3, carbs:19,  sugar:12,  fiber:4.1, fat:0.5, unit:"g", portion:30},
  "tomato sauce":            {cal:29, protein:1.3, carbs:6.9, sugar:4.3, fiber:1.5, fat:0.2, unit:"g", portion:120},
  /* BAKING */
  "all-purpose flour":       {cal:364,protein:10,  carbs:76,  sugar:0.3, fiber:2.7, fat:1,   unit:"g", portion:120},
  "whole wheat flour":       {cal:340,protein:13,  carbs:72,  sugar:0.4, fiber:10.7,fat:2.5, unit:"g", portion:120},
  "almond flour":            {cal:571,protein:21,  carbs:21,  sugar:4.5, fiber:12,  fat:50,  unit:"g", portion:96},
  "coconut flour":           {cal:400,protein:16,  carbs:60,  sugar:8,   fiber:40,  fat:13,  unit:"g", portion:30},
  "active dry yeast":        {cal:325,protein:40,  carbs:41,  sugar:0,   fiber:26,  fat:4.6, unit:"g", portion:7},
  "instant yeast":           {cal:325,protein:40,  carbs:41,  sugar:0,   fiber:26,  fat:4.6, unit:"g", portion:7},
  "baking powder":           {cal:53, protein:0,   carbs:28,  sugar:0,   fiber:0.2, fat:0,   unit:"g", portion:4},
  "baking soda":             {cal:0,  protein:0,   carbs:0,   sugar:0,   fiber:0,   fat:0,   unit:"g", portion:4},
  "cornstarch":              {cal:381,protein:0.3, carbs:91,  sugar:0,   fiber:0.9, fat:0.1, unit:"g", portion:8},
  "sugar - white":           {cal:387,protein:0,   carbs:100, sugar:100, fiber:0,   fat:0,   unit:"g", portion:12},
  "sugar - brown":           {cal:380,protein:0.1, carbs:98,  sugar:97,  fiber:0,   fat:0,   unit:"g", portion:12},
  "powdered sugar":          {cal:389,protein:0,   carbs:100, sugar:97,  fiber:0,   fat:0,   unit:"g", portion:8},
  /* VANILLA & EXTRACTS */
  "vanilla extract":         {cal:288,protein:0.1, carbs:13,  sugar:13,  fiber:0,   fat:0.1, unit:"tsp", portion:1},
  /* GROUND BEEF (raw) */
  "ground beef - 80/20":     {cal:254,protein:17,  carbs:0,   sugar:0,   fiber:0,   fat:20,  unit:"g", portion:113},
  "ground beef - 85/15":     {cal:215,protein:19,  carbs:0,   sugar:0,   fiber:0,   fat:15,  unit:"g", portion:113},
  "ground beef - 90/10":     {cal:176,protein:20,  carbs:0,   sugar:0,   fiber:0,   fat:10,  unit:"g", portion:113},
  "ground beef - 93/7":      {cal:152,protein:21,  carbs:0,   sugar:0,   fiber:0,   fat:7,   unit:"g", portion:113},
  /* WHOLE CHICKEN */
  "whole chicken":           {cal:215,protein:19,  carbs:0,   sugar:0,   fiber:0,   fat:15,  unit:"g", portion:140},
  /* SUPPLEMENTS */
  "collagen peptides":       {cal:350,protein:90,  carbs:0,   sugar:0,   fiber:0,   fat:0,   unit:"g", portion:20},
  "creatine monohydrate":    {cal:0,  protein:0,   carbs:0,   sugar:0,   fiber:0,   fat:0,   unit:"g", portion:5},
  /* TEA & BEVERAGES (brewed, per 100ml) */
  "green tea":               {cal:1,  protein:0.2, carbs:0,   sugar:0,   fiber:0,   fat:0,   unit:"ml", portion:240},
  "black tea":               {cal:1,  protein:0.2, carbs:0.3, sugar:0,   fiber:0,   fat:0,   unit:"ml", portion:240},
  "chamomile tea":           {cal:1,  protein:0,   carbs:0.2, sugar:0,   fiber:0,   fat:0,   unit:"ml", portion:240},
  "mint tea":                {cal:0,  protein:0,   carbs:0,   sugar:0,   fiber:0,   fat:0,   unit:"ml", portion:240},
  "matcha powder":           {cal:324,protein:29,  carbs:39,  sugar:0,   fiber:39,  fat:5,   unit:"g", portion:2},
  "earl grey tea":           {cal:1,  protein:0.2, carbs:0.3, sugar:0,   fiber:0,   fat:0,   unit:"ml", portion:240},
  "oolong tea":              {cal:1,  protein:0.1, carbs:0.1, sugar:0,   fiber:0,   fat:0,   unit:"ml", portion:240},
  "coffee - black":          {cal:1,  protein:0.1, carbs:0,   sugar:0,   fiber:0,   fat:0,   unit:"ml", portion:240},
  "orange juice":            {cal:45, protein:0.7, carbs:10,  sugar:8.4, fiber:0.2, fat:0.2, unit:"ml", portion:240},
  "coconut water":           {cal:19, protein:0.7, carbs:3.7, sugar:2.6, fiber:0,   fat:0.2, unit:"ml", portion:240},
  "lemonade":                {cal:40, protein:0.1, carbs:11,  sugar:10,  fiber:0,   fat:0,   unit:"ml", portion:240},
  /* STAPLES */
  "peanut butter":           {cal:588,protein:25,  carbs:20,  sugar:9,   fiber:6,   fat:50,  unit:"g", portion:32},
  "honey":                   {cal:304,protein:0.3, carbs:82,  sugar:82,  fiber:0,   fat:0,   unit:"g", portion:21},
  "butter":                  {cal:717,protein:0.9, carbs:0.1, sugar:0.1, fiber:0,   fat:81,  unit:"g", portion:14},
  "cream cheese":            {cal:342,protein:6,   carbs:4,   sugar:3.8, fiber:0,   fat:34,  unit:"g", portion:28},
  "sour cream":              {cal:193,protein:2.4, carbs:4.6, sugar:3.5, fiber:0,   fat:19,  unit:"g", portion:30},
  "tortilla - flour":        {cal:312,protein:8.2, carbs:52,  sugar:3,   fiber:2.1, fat:8.4, unit:"g", portion:45},
  "bread - whole wheat":     {cal:247,protein:13,  carbs:41,  sugar:6,   fiber:7,   fat:3.4, unit:"g", portion:28},
  "pasta - dry":             {cal:371,protein:13,  carbs:75,  sugar:2.7, fiber:3.2, fat:1.5, unit:"g", portion:56},
  "bacon":                   {cal:541,protein:37,  carbs:1.4, sugar:0,   fiber:0,   fat:42,  unit:"g", portion:28},
  "ham":                     {cal:145,protein:21,  carbs:1.5, sugar:0,   fiber:0,   fat:5.5, unit:"g", portion:85},
  "turkey breast - deli":    {cal:104,protein:18,  carbs:4,   sugar:2,   fiber:0,   fat:1.6, unit:"g", portion:56},
  "coconut oil":         {cal:862,protein:0,   carbs:0,   sugar:0,   fiber:0,   fat:99,  unit:"g", portion:14},
  "sesame oil":          {cal:884,protein:0,   carbs:0,   sugar:0,   fiber:0,   fat:100, unit:"g", portion:14},
  "avocado oil":         {cal:884,protein:0,   carbs:0,   sugar:0,   fiber:0,   fat:100, unit:"g", portion:14},
  /* NEW */
  "green peas":          {cal:81, protein:5.4, carbs:14.5,sugar:5.7, fiber:5.1, fat:0.4, unit:"g", portion:100},
  "green onion":         {cal:32, protein:1.8, carbs:7.3, sugar:2.3, fiber:2.6, fat:0.2, unit:"g", portion:30},
  "cabbage":             {cal:25, protein:1.3, carbs:5.8, sugar:3.2, fiber:2.5, fat:0.1, unit:"g", portion:100},
  "vinegar":             {cal:3,  protein:0,   carbs:0.1, sugar:0,   fiber:0,   fat:0,   unit:"tbsp",portion:1},
  "olive oil":           {cal:884,protein:0,   carbs:0,   sugar:0,   fiber:0,   fat:100, unit:"g", portion:14},
};

/* Default cooking methods per food (keyed by normalised name) */
const COOK_METHODS_MAP = {
  /* EGGS */
  "egg":                   ["Raw","Scrambled","Boiled","Fried","Poached","Omelette","Baked"],
  /* MEAT */
  "chicken - breast":      ["Raw","Grilled","Baked","Sautéed","Boiled","Pan-fried"],
  "chicken - thigh":       ["Raw","Grilled","Baked","Sautéed","Braised"],
  "chicken - wings":       ["Raw","Baked","Fried","Grilled"],
  "chicken - drumstick":   ["Raw","Baked","Grilled","Fried"],
  "whole chicken":         ["Raw","Roasted","Baked"],
  "beef - ground":         ["Raw","Pan-fried","Baked","Grilled"],
  "beef - steak":          ["Raw","Grilled","Pan-fried","Roasted"],
  "beef - ribs":           ["Raw","Slow-cooked","Grilled","Baked"],
  "pork - chop":           ["Raw","Grilled","Pan-fried","Baked"],
  "pork - bacon":          ["Raw","Pan-fried","Baked","Crispy"],
  "turkey - breast":       ["Raw","Roasted","Grilled","Baked"],
  "lamb - chop":           ["Raw","Grilled","Pan-fried","Roasted"],
  "ham":                   ["As-is","Pan-fried","Baked"],
  "bacon":                 ["Raw","Pan-fried","Baked","Crispy"],
  "turkey breast - deli":  ["As-is","Heated"],
  "ground beef - 80/20":   ["Raw","Pan-fried","Baked","Grilled"],
  "ground beef - 85/15":   ["Raw","Pan-fried","Baked","Grilled"],
  "ground beef - 90/10":   ["Raw","Pan-fried","Baked","Grilled"],
  "ground beef - 93/7":    ["Raw","Pan-fried","Baked","Grilled"],
  /* FISH */
  "salmon":                ["Raw","Grilled","Baked","Pan-fried","Poached"],
  "tuna":                  ["Raw","Baked","Pan-fried","Grilled"],
  "shrimp":                ["Raw","Grilled","Sautéed","Boiled","Fried"],
  "cod":                   ["Raw","Baked","Pan-fried","Grilled","Poached"],
  "tilapia":               ["Raw","Baked","Pan-fried","Grilled"],
  "sardines":              ["As-is","Grilled","Pan-fried"],
  /* DAIRY */
  "cheddar cheese":        ["As-is","Melted","Shredded"],
  "mozzarella":            ["As-is","Melted","Fresh"],
  "cream cheese":          ["As-is","Spread","Whipped"],
  "heavy cream":           ["As-is","Whipped"],
  "butter":                ["As-is","Melted","Browned"],
  "whole milk":            ["As-is","Warm","Cold"],
  "milk 2%":               ["As-is","Warm","Cold"],
  "milk 1%":               ["As-is","Warm","Cold"],
  "skim milk":             ["As-is","Warm","Cold"],
  "oat milk":              ["As-is","Warm","Cold"],
  "almond milk":           ["As-is","Warm","Cold"],
  "soy milk":              ["As-is","Warm","Cold"],
  "coconut milk":          ["As-is","Heated"],
  "greek yogurt":          ["As-is","Mixed","Frozen"],
  "cottage cheese":        ["As-is","Mixed"],
  "sour cream":            ["As-is"],
  /* VEGETABLES */
  "tomato":                ["Raw","Roasted","Sautéed","Grilled"],
  "onion":                 ["Raw","Caramelised","Sautéed","Roasted","Pickled"],
  "garlic":                ["Raw","Roasted","Minced","Sautéed"],
  "carrot":                ["Raw","Cooked","Roasted","Steamed"],
  "bell pepper":           ["Raw","Roasted","Sautéed","Grilled"],
  "jalapeño":              ["Raw","Roasted","Pickled"],
  "cucumber":              ["Raw","Pickled"],
  "zucchini":              ["Raw","Sautéed","Grilled","Roasted"],
  "mushroom":              ["Raw","Sautéed","Roasted","Grilled"],
  "broccoli":              ["Raw","Steamed","Roasted","Sautéed"],
  "spinach":               ["Raw","Sautéed","Steamed"],
  "kale":                  ["Raw","Sautéed","Baked","Steamed"],
  "lettuce":               ["Raw"],
  "sweet potato":          ["Raw","Baked","Boiled","Roasted","Mashed"],
  "yellow potato":         ["Raw","Boiled","Baked","Roasted","Mashed"],
  "cauliflower":           ["Raw","Roasted","Steamed","Sautéed","Mashed"],
  "green beans":           ["Raw","Steamed","Sautéed","Blanched"],
  "green beans - canned":  ["Drained","Sautéed","Steamed"],
  "green peas":            ["Raw","Boiled","Steamed","Sautéed"],
  "cabbage":               ["Raw","Shredded","Sautéed","Braised","Pickled"],
  "celery":                ["Raw","Cooked"],
  "asparagus":             ["Raw","Roasted","Steamed","Grilled"],
  "jicama":                ["Raw","Shredded"],
  "corn - canned":         ["As-is","Sautéed","Roasted"],
  "tomato - canned":       ["As-is","Cooked","Stewed"],
  "tomato paste":          ["As-is","Cooked"],
  "tomato sauce":          ["As-is","Heated"],
  "green onion":           ["Raw","Sautéed","Grilled"],
  /* FRUITS */
  "banana":                ["Raw","Blended","Frozen","Baked"],
  "apple":                 ["Raw","Baked","Cooked"],
  "avocado":               ["Raw","Mashed","Sliced"],
  "orange":                ["Raw","Juiced"],
  "mango":                 ["Raw","Blended","Grilled"],
  "watermelon":            ["Raw","Chilled"],
  "grapes":                ["Raw","Frozen"],
  "lemon":                 ["Juiced","Zested","As-is"],
  "pineapple":             ["Raw","Grilled"],
  "pear":                  ["Raw","Baked","Poached"],
  /* BERRIES */
  "strawberry":            ["Raw","Blended","Frozen"],
  "blueberry":             ["Raw","Blended","Frozen","Baked"],
  "raspberry":             ["Raw","Blended","Frozen"],
  "blackberry":            ["Raw","Blended","Frozen"],
  "cranberry":             ["Raw","Dried","Cooked"],
  /* LEGUMES & PLANT PROTEIN */
  "tofu":                  ["Raw","Pan-fried","Baked","Scrambled","Grilled"],
  "lentils":               ["Cooked","Boiled"],
  "chickpeas":             ["Cooked","Roasted"],
  "black beans":           ["Cooked"],
  "edamame":               ["Raw","Boiled","Steamed"],
  "almonds":               ["Raw","Roasted","Toasted"],
  "peanut butter":         ["As-is","Melted"],
  "chickpeas - canned":    ["As-is","Roasted","Sautéed"],
  "black beans - canned":  ["As-is","Cooked"],
  "kidney beans - red canned":  ["As-is","Cooked"],
  "kidney beans - dark canned": ["As-is","Cooked"],
  "pinto beans - canned":  ["As-is","Cooked"],
  "navy beans - canned":   ["As-is","Cooked"],
  /* GRAINS */
  "white rice":            ["Cooked","Steamed","Fried"],
  "brown rice":            ["Cooked","Steamed"],
  "oats":                  ["Raw","Cooked","Overnight","Baked"],
  "quinoa":                ["Cooked"],
  "bread":                 ["Plain","Toasted"],
  "bread - whole wheat":   ["Plain","Toasted"],
  "pasta":                 ["Cooked","Al dente"],
  "pasta - dry":           ["Cooked","Al dente"],
  "tortilla":              ["As-is","Heated","Toasted"],
  "tortilla - flour":      ["As-is","Heated","Toasted"],
  /* OILS & FATS */
  "olive oil":             ["As-is","Heated"],
  "coconut oil":           ["As-is","Melted","Heated"],
  "sesame oil":            ["As-is","Heated"],
  "avocado oil":           ["As-is","Heated"],
  /* SEASONINGS */
  "salt":                  ["As-is"],
  "black pepper":          ["Ground","Cracked"],
  "cumin":                 ["Ground","Toasted"],
  "paprika":               ["As-is","Smoked"],
  "turmeric":              ["As-is","Cooked"],
  "ginger":                ["Raw","Grated","Dried"],
  "cilantro":              ["Fresh","Dried","Chopped"],
  "garlic powder":         ["As-is"],
  "oregano":               ["Dried","Fresh"],
  "chili powder":          ["As-is"],
  "basil":                 ["Fresh","Dried","Chopped"],
  "cinnamon":              ["Ground","As-is"],
  "vanilla extract":       ["As-is"],
  "vinegar":               ["As-is"],
  /* SUPPLEMENTS */
  "whey protein powder":   ["Mixed with water","Mixed with milk","Blended"],
  "plant protein powder":  ["Mixed with water","Mixed with milk","Blended"],
  "casein protein powder": ["Mixed","Overnight"],
  "collagen peptides":     ["Mixed","As-is"],
  "creatine monohydrate":  ["Mixed","As-is"],
  "matcha powder":         ["Mixed","Brewed","Blended"],
  /* BAKING */
  "all-purpose flour":     ["As-is"],
  "whole wheat flour":     ["As-is"],
  "almond flour":          ["As-is"],
  "coconut flour":         ["As-is"],
  "baking powder":         ["As-is"],
  "baking soda":           ["As-is"],
  "cornstarch":            ["As-is","Dissolved"],
  "sugar - white":         ["As-is","Caramelised"],
  "sugar - brown":         ["As-is"],
  "powdered sugar":        ["As-is"],
  "honey":                 ["As-is","Warm"],
  "cacao powder":          ["As-is","Mixed"],
  "cacao nibs":            ["As-is","Toasted"],
  "dark chocolate":        ["As-is","Melted"],
  /* BEVERAGES */
  "green tea":             ["Brewed","Iced"],
  "black tea":             ["Brewed","Iced"],
  "chamomile tea":         ["Brewed"],
  "mint tea":              ["Brewed","Iced"],
  "earl grey tea":         ["Brewed"],
  "oolong tea":            ["Brewed"],
  "coffee - black":        ["Brewed","Iced","Espresso"],
  "orange juice":          ["As-is","Fresh-squeezed","Chilled"],
  "coconut water":         ["As-is","Chilled"],
  "lemonade":              ["As-is","Chilled"],
};

/* Count-based portions: 1 egg = 50g, 1 carrot = 60g, etc.
   countLabel = what to call one unit; countGrams = grams per one unit */
const COUNT_LABELS = {
  "egg":                   {label:"egg",       grams:50},
  "tomato":                {label:"tomato",    grams:120},
  "onion":                 {label:"onion",     grams:80},
  "carrot":                {label:"carrot",    grams:60},
  "bell pepper":           {label:"pepper",    grams:120},
  "jalapeño":              {label:"jalapeño",  grams:45},
  "cucumber":              {label:"cucumber",  grams:300},
  "zucchini":              {label:"zucchini",  grams:200},
  "garlic":                {label:"clove",     grams:6},
  "mushroom":              {label:"mushroom",  grams:15},
  "sweet potato":          {label:"potato",    grams:130},
  "yellow potato":         {label:"potato",    grams:170},
  "avocado":               {label:"avocado",   grams:200},
  "banana":                {label:"banana",    grams:120},
  "apple":                 {label:"apple",     grams:180},
  "orange":                {label:"orange",    grams:130},
  "lemon":                 {label:"lemon",     grams:60},
  "pear":                  {label:"pear",      grams:180},
  "mango":                 {label:"mango",     grams:300},
  "chicken - breast":      {label:"breast",    grams:150},
  "chicken - thigh":       {label:"thigh",     grams:130},
  "chicken - wings":       {label:"wing",      grams:45},
  "chicken - drumstick":   {label:"drumstick", grams:110},
  "egg":                   {label:"egg",       grams:50},
  "whey protein powder":   {label:"scoop",     grams:32},
  "plant protein powder":  {label:"scoop",     grams:32},
  "casein protein powder": {label:"scoop",     grams:32},
  "creatine monohydrate":  {label:"scoop",     grams:5},
  "collagen peptides":     {label:"scoop",     grams:20},
  "butter":                {label:"tbsp",      grams:14},
  "olive oil":             {label:"tbsp",      grams:14},
  "coconut oil":           {label:"tbsp",      grams:14},
  "honey":                 {label:"tbsp",      grams:21},
  "peanut butter":         {label:"tbsp",      grams:32},
  "bread":                 {label:"slice",     grams:35},
  "bread - whole wheat":   {label:"slice",     grams:28},
  "green onion":           {label:"stalk",     grams:15},
};

const SEED = [
  {n:"Chicken - breast",    e:"🍗", t:["meat","protein"]},
  {n:"Chicken - thigh",     e:"🍗", t:["meat","protein"]},
  {n:"Chicken - wings",     e:"🍗", t:["meat"]},
  {n:"Chicken - drumstick", e:"🍗", t:["meat"]},
  {n:"Beef - ground",       e:"🥩", t:["meat","protein"]},
  {n:"Beef - steak",        e:"🥩", t:["meat","protein"]},
  {n:"Beef - ribs",         e:"🥩", t:["meat"]},
  {n:"Pork - chop",         e:"🥩", t:["meat"]},
  {n:"Pork - bacon",        e:"🥓", t:["meat"]},
  {n:"Turkey - breast",     e:"🦃", t:["meat","protein"]},
  {n:"Lamb - chop",         e:"🍖", t:["meat"]},
  {n:"Salmon",              e:"🐟", t:["fish","protein"]},
  {n:"Tuna",                e:"🐟", t:["fish","protein"]},
  {n:"Shrimp",              e:"🦐", t:["fish","protein"]},
  {n:"Cod",                 e:"🐠", t:["fish","protein"]},
  {n:"Tilapia",             e:"🐠", t:["fish","protein"]},
  {n:"Sardines",            e:"🐟", t:["fish","protein"]},
  {n:"Egg",                 e:"🥚", t:["protein"]},
  {n:"Tofu",                e:"🟦", t:["protein"]},
  {n:"Lentils",             e:"🫘", t:["protein","hifiber"]},
  {n:"Chickpeas",           e:"🫘", t:["protein","hifiber"]},
  {n:"Black beans",         e:"🫘", t:["protein","hifiber"]},
  {n:"Edamame",             e:"🫛", t:["protein","hifiber"]},
  {n:"Almonds",             e:"🌰", t:["protein","hifiber"]},
  {n:"Peanut butter",       e:"🥜", t:["protein"]},
  {n:"Greek yogurt",        e:"🥛", t:["protein","dairy","protein"]},
  {n:"Cottage cheese",      e:"🧀", t:["protein","dairy","protein"]},
  {n:"Broccoli",            e:"🥦", t:["veg","hifiber","lowcal"]},
  {n:"Spinach",             e:"🥬", t:["veg","hifiber","lowcal"]},
  {n:"Kale",                e:"🥬", t:["veg","hifiber","lowcal"]},
  {n:"Tomato",              e:"🍅", t:["veg","lowcal"]},
  {n:"Onion",               e:"🧅", t:["veg","lowcal"]},
  {n:"Garlic",              e:"🧄", t:["veg","seasoning"]},
  {n:"Carrot",              e:"🥕", t:["veg","hifiber","lowcal"]},
  {n:"Bell pepper",         e:"🫑", t:["veg","lowcal"]},
  {n:"Jalapeño",            e:"🌶️", t:["veg","seasoning","lowcal"]},
  {n:"Cucumber",            e:"🥒", t:["veg","lowcal"]},
  {n:"Zucchini",            e:"🥒", t:["veg","lowcal"]},
  {n:"Mushroom",            e:"🍄", t:["veg","lowcal"]},
  {n:"Sweet potato",        e:"🍠", t:["veg","hifiber"]},
  {n:"Yellow potato",       e:"🥔", t:["veg"]},
  {n:"Jicama",              e:"🫚", t:["veg","hifiber"]},
  {n:"Cauliflower",         e:"🥦", t:["veg","hifiber"]},
  {n:"Lettuce",             e:"🥬", t:["veg","lowcal"]},
  {n:"Celery",              e:"🌿", t:["veg","hifiber","lowcal"]},
  {n:"Green beans",         e:"🫛", t:["veg","hifiber","lowcal"]},
  {n:"Asparagus",           e:"🌿", t:["veg","hifiber","lowcal"]},
  {n:"Banana",              e:"🍌", t:["fruit"]},
  {n:"Apple",               e:"🍎", t:["fruit","hifiber"]},
  {n:"Avocado",             e:"🥑", t:["fruit","hifiber"]},
  {n:"Orange",              e:"🍊", t:["fruit"]},
  {n:"Mango",               e:"🥭", t:["fruit"]},
  {n:"Watermelon",          e:"🍉", t:["fruit"]},
  {n:"Grapes",              e:"🍇", t:["fruit"]},
  {n:"Lemon",               e:"🍋", t:["fruit"]},
  {n:"Pineapple",           e:"🍍", t:["fruit"]},
  {n:"Pear",                e:"🍐", t:["fruit","hifiber"]},
  {n:"Strawberry",          e:"🍓", t:["berries","fruit","hifiber","lowcal"]},
  {n:"Blueberry",           e:"🫐", t:["berries","fruit","hifiber","lowcal"]},
  {n:"Raspberry",           e:"🍓", t:["berries","fruit","hifiber","lowcal"]},
  {n:"Blackberry",          e:"🍇", t:["berries","fruit","hifiber","lowcal"]},
  {n:"Cranberry",           e:"🔴", t:["berries","fruit","hifiber","lowcal"]},
  {n:"Cheddar cheese",      e:"🧀", t:["dairy","protein"]},
  {n:"Mozzarella",          e:"🧀", t:["dairy","protein"]},
  {n:"Cream cheese",        e:"🧀", t:["dairy"]},
  {n:"Heavy cream",         e:"🥛", t:["dairy"]},
  {n:"Butter",              e:"🧈", t:["dairy","oil"]},
  {n:"Whole milk",          e:"🥛", t:["milk","dairy"]},
  {n:"Milk 2%",             e:"🥛", t:["milk","dairy"]},
  {n:"Milk 1%",             e:"🥛", t:["milk","dairy"]},
  {n:"Skim milk",           e:"🥛", t:["milk","dairy"]},
  {n:"Oat milk",            e:"🌾", t:["milk"]},
  {n:"Almond milk",         e:"🌰", t:["milk","lowcal"]},
  {n:"Soy milk",            e:"🫘", t:["milk","protein"]},
  {n:"Coconut milk",        e:"🥥", t:["milk"]},
  {n:"White rice",          e:"🍚", t:["grain"]},
  {n:"Brown rice",          e:"🍚", t:["grain","hifiber"]},
  {n:"Oats",                e:"🌾", t:["grain","hifiber","protein"]},
  {n:"Quinoa",              e:"🌾", t:["grain","protein","hifiber"]},
  {n:"Bread",               e:"🍞", t:["grain","hifiber"]},
  {n:"Pasta",               e:"🍝", t:["grain"]},
  {n:"Tortilla",            e:"🫓", t:["grain"]},
  {n:"Salt",                e:"🧂", t:["seasoning"]},
  {n:"Black pepper",        e:"🌑", t:["seasoning"]},
  {n:"Cinnamon",            e:"🟤", t:["seasoning"]},
  {n:"Cumin",               e:"🌰", t:["seasoning"]},
  {n:"Paprika",             e:"🔴", t:["seasoning"]},
  {n:"Turmeric",            e:"🟡", t:["seasoning"]},
  {n:"Ginger",              e:"🫚", t:["seasoning"]},
  {n:"Cilantro",            e:"🌿", t:["seasoning"]},
  {n:"Garlic powder",       e:"🧄", t:["seasoning"]},
  {n:"Oregano",             e:"🌿", t:["seasoning"]},
  {n:"Chili powder",        e:"🌶️", t:["seasoning"]},
  {n:"Basil",               e:"🌿", t:["seasoning"]},
  /* PROTEIN POWDERS */
  {n:"Whey protein powder",        e:"💪", t:["protein","supplement"]},
  {n:"Plant protein powder",       e:"🌱", t:["protein","supplement"]},
  {n:"Casein protein powder",      e:"💪", t:["protein","supplement"]},
  /* CACAO & CHOCOLATE */
  {n:"Cacao powder",               e:"🍫", t:["baking","seasoning"]},
  {n:"Cacao nibs",                 e:"🍫", t:["baking"]},
  {n:"Dark chocolate",             e:"🍫", t:["baking"]},
  /* CANNED GOODS */
  {n:"Corn - canned",              e:"🌽", t:["canned","veg"]},
  {n:"Chickpeas - canned",         e:"🫘", t:["canned","protein","hifiber"]},
  {n:"Black beans - canned",       e:"🫘", t:["canned","protein","hifiber"]},
  {n:"Kidney beans - red canned",  e:"🫘", t:["canned","protein","hifiber"]},
  {n:"Kidney beans - dark canned", e:"🫘", t:["canned","protein","hifiber"]},
  {n:"Green beans - canned",       e:"🥫", t:["canned","veg","lowcal"]},
  {n:"Pinto beans - canned",       e:"🫘", t:["canned","protein","hifiber"]},
  {n:"Navy beans - canned",        e:"🫘", t:["canned","protein","hifiber"]},
  {n:"Tomato - canned",            e:"🥫", t:["canned","veg"]},
  {n:"Tomato paste",               e:"🍅", t:["canned","veg","seasoning"]},
  {n:"Tomato sauce",               e:"🍅", t:["canned","veg"]},
  /* BAKING */
  {n:"All-purpose flour",          e:"🌾", t:["baking","grain"]},
  {n:"Whole wheat flour",          e:"🌾", t:["baking","grain","hifiber"]},
  {n:"Almond flour",               e:"🌰", t:["baking","grain"]},
  {n:"Coconut flour",              e:"🥥", t:["baking","grain","hifiber"]},
  {n:"Active dry yeast",           e:"🧫", t:["baking"]},
  {n:"Instant yeast",              e:"🧫", t:["baking"]},
  {n:"Baking powder",              e:"🥄", t:["baking","seasoning"]},
  {n:"Baking soda",                e:"🥄", t:["baking","seasoning"]},
  {n:"Cornstarch",                 e:"🌽", t:["baking"]},
  {n:"Sugar - white",              e:"🍬", t:["baking"]},
  {n:"Sugar - brown",              e:"🍬", t:["baking"]},
  {n:"Powdered sugar",             e:"🍬", t:["baking"]},
  /* VANILLA */
  {n:"Vanilla extract",             e:"🧴", t:["baking","seasoning"]},
  /* GROUND BEEF */
  {n:"Ground beef - 80/20",         e:"🍔", t:["meat","protein"]},
  {n:"Ground beef - 85/15",         e:"🍔", t:["meat","protein"]},
  {n:"Ground beef - 90/10",         e:"🍔", t:["meat","protein"]},
  {n:"Ground beef - 93/7",          e:"🍔", t:["meat","protein"]},
  /* WHOLE CHICKEN */
  {n:"Whole chicken",               e:"🍗", t:["meat","protein"]},
  /* SUPPLEMENTS */
  {n:"Collagen peptides",           e:"✨", t:["supplement","protein"]},
  {n:"Creatine monohydrate",        e:"⚡", t:["supplement"]},
  /* TEA */
  {n:"Green tea",                   e:"🍵", t:["beverage","lowcal"]},
  {n:"Black tea",                   e:"🍵", t:["beverage","lowcal"]},
  {n:"Chamomile tea",               e:"🌼", t:["beverage","lowcal"]},
  {n:"Mint tea",                    e:"🌿", t:["beverage","lowcal"]},
  {n:"Matcha powder",               e:"🍵", t:["beverage","hifiber"]},
  {n:"Earl grey tea",               e:"🍵", t:["beverage","lowcal"]},
  {n:"Oolong tea",                  e:"🍵", t:["beverage","lowcal"]},
  /* BEVERAGES */
  {n:"Coffee - black",              e:"☕", t:["beverage","lowcal"]},
  {n:"Orange juice",                e:"🍊", t:["beverage","fruit"]},
  {n:"Coconut water",               e:"🥥", t:["beverage","lowcal"]},
  {n:"Lemonade",                    e:"🍋", t:["beverage"]},
  /* STAPLES */
  {n:"Peanut butter",               e:"🥜", t:["protein","hifiber"]},
  {n:"Honey",                       e:"🍯", t:["baking","seasoning"]},
  {n:"Butter",                      e:"🧈", t:["dairy","oil"]},
  {n:"Cream cheese",                e:"🧀", t:["dairy"]},
  {n:"Sour cream",                  e:"🫙", t:["dairy"]},
  {n:"Tortilla - flour",            e:"🫓", t:["grain"]},
  {n:"Bread - whole wheat",         e:"🍞", t:["grain","hifiber"]},
  {n:"Pasta - dry",                 e:"🍝", t:["grain"]},
  {n:"Bacon",                       e:"🥓", t:["meat"]},
  {n:"Ham",                         e:"🥩", t:["meat","protein"]},
  {n:"Turkey breast - deli",        e:"🦃", t:["meat","protein","lowcal"]},
  {n:"Olive oil",           e:"🫒", t:["oil"]},
  {n:"Coconut oil",         e:"🥥", t:["oil"]},
  {n:"Sesame oil",          e:"🌰", t:["oil"]},
  {n:"Avocado oil",         e:"🥑", t:["oil"]},
  /* NEW FOODS */
  {n:"Green peas",          e:"🫛", t:["veg","hifiber","protein","lowcal"]},
  {n:"Green onion",         e:"🌿", t:["veg","seasoning","lowcal"]},
  {n:"Cabbage",             e:"🥬", t:["veg","hifiber","lowcal"]},
  {n:"Vinegar",             e:"🫙", t:["seasoning"]},
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

/* ── Pre-seeded recipes ── */
const SEED_RECIPES_V1 = [
  /* EGG DISHES */
  {id:"srec_scrambled_eggs",  name:"Scrambled Eggs",            servings:1, ings:[
    {n:"Egg",                 a:150, u:"g",   cm:"Scrambled"},
    {n:"Butter",              a:14,  u:"g"},
    {n:"Salt",                a:1,   u:"g"},
    {n:"Black pepper",        a:0.5, u:"g"},
  ]},
  {id:"srec_boiled_eggs",     name:"Boiled Eggs",               servings:1, ings:[
    {n:"Egg",                 a:150, u:"g",   cm:"Boiled"},
    {n:"Salt",                a:1,   u:"g"},
  ]},
  {id:"srec_egg_green_beans", name:"Egg with Green Beans",      servings:1, ings:[
    {n:"Egg",                 a:150, u:"g",   cm:"Fried"},
    {n:"Green beans - canned",a:240, u:"g",   cm:"Drained"},
    {n:"Butter",              a:14,  u:"g"},
    {n:"Garlic powder",       a:1,   u:"g"},
    {n:"Salt",                a:1,   u:"g"},
    {n:"Black pepper",        a:0.5, u:"g"},
  ]},
  {id:"srec_egg_green_onion", name:"Egg with Green Onion",      servings:1, ings:[
    {n:"Egg",                 a:150, u:"g",   cm:"Scrambled"},
    {n:"Green onion",         a:30,  u:"g"},
    {n:"Butter",              a:14,  u:"g"},
    {n:"Salt",                a:1,   u:"g"},
    {n:"Black pepper",        a:0.5, u:"g"},
  ]},
  {id:"srec_eggs_tomato",     name:"Eggs with Tomato",          servings:1, ings:[
    {n:"Egg",                 a:150, u:"g",   cm:"Scrambled"},
    {n:"Tomato",              a:120, u:"g",   cm:"Sautéed"},
    {n:"Butter",              a:14,  u:"g"},
    {n:"Salt",                a:1,   u:"g"},
    {n:"Black pepper",        a:0.5, u:"g"},
  ]},
  {id:"srec_shakshuka",       name:"Shakshuka",                 servings:2, ings:[
    {n:"Egg",                 a:150, u:"g",   cm:"Poached"},
    {n:"Tomato",              a:360, u:"g",   cm:"Sautéed"},
    {n:"Bell pepper",         a:120, u:"g",   cm:"Sautéed"},
    {n:"Onion",               a:80,  u:"g",   cm:"Sautéed"},
    {n:"Garlic",              a:12,  u:"g"},
    {n:"Olive oil",           a:14,  u:"g"},
    {n:"Cumin",               a:2,   u:"g"},
    {n:"Paprika",             a:3,   u:"g"},
    {n:"Chili powder",        a:2,   u:"g"},
    {n:"Salt",                a:2,   u:"g"},
  ]},
  {id:"srec_eggs_peas",       name:"Eggs with Green Peas",      servings:1, ings:[
    {n:"Egg",                 a:150, u:"g",   cm:"Fried"},
    {n:"Green peas",          a:100, u:"g",   cm:"Sautéed"},
    {n:"Butter",              a:14,  u:"g"},
    {n:"Garlic powder",       a:1,   u:"g"},
    {n:"Salt",                a:1,   u:"g"},
    {n:"Black pepper",        a:0.5, u:"g"},
  ]},
  /* SALADS */
  {id:"srec_cabbage_lemon",   name:"Shredded Cabbage Salad",    servings:2, ings:[
    {n:"Cabbage",             a:300, u:"g",   cm:"Shredded"},
    {n:"Lemon",               a:30,  u:"g"},
    {n:"Vinegar",             a:1,   u:"tbsp"},
    {n:"Olive oil",           a:14,  u:"g"},
    {n:"Salt",                a:2,   u:"g"},
    {n:"Black pepper",        a:1,   u:"g"},
    {n:"Cumin",               a:1,   u:"g"},
  ]},
  {id:"srec_cabbage_cuke_pea",name:"Cabbage Cucumber Pea Salad",servings:2, ings:[
    {n:"Cabbage",             a:150, u:"g",   cm:"Shredded"},
    {n:"Cucumber",            a:120, u:"g",   cm:"Raw"},
    {n:"Green peas",          a:80,  u:"g"},
    {n:"Olive oil",           a:14,  u:"g"},
    {n:"Lemon",               a:20,  u:"g"},
    {n:"Salt",                a:1,   u:"g"},
    {n:"Black pepper",        a:0.5, u:"g"},
  ]},
  {id:"srec_tomato_cuke_onion",name:"Tomato Cucumber Onion Salad",servings:2,ings:[
    {n:"Tomato",              a:240, u:"g",   cm:"Raw"},
    {n:"Cucumber",            a:120, u:"g",   cm:"Raw"},
    {n:"Onion",               a:40,  u:"g",   cm:"Raw"},
    {n:"Olive oil",           a:14,  u:"g"},
    {n:"Salt",                a:1,   u:"g"},
    {n:"Black pepper",        a:0.5, u:"g"},
  ]},
  {id:"srec_cuke_tomato_avocado",name:"Cucumber Tomato Avocado Salad",servings:2,ings:[
    {n:"Cucumber",            a:120, u:"g",   cm:"Raw"},
    {n:"Tomato",              a:120, u:"g",   cm:"Raw"},
    {n:"Bell pepper",         a:120, u:"g",   cm:"Raw"},
    {n:"Avocado",             a:100, u:"g",   cm:"Raw"},
    {n:"Olive oil",           a:14,  u:"g"},
    {n:"Lemon",               a:20,  u:"g"},
    {n:"Salt",                a:1,   u:"g"},
  ]},
  /* SIMPLE EXTRAS */
  {id:"srec_overnight_oats",  name:"Overnight Oats",            servings:1, ings:[
    {n:"Oats",                a:80,  u:"g",   cm:"Overnight"},
    {n:"Almond milk",         a:200, u:"ml"},
    {n:"Honey",               a:21,  u:"g"},
    {n:"Blueberry",           a:100, u:"g"},
  ]},
  {id:"srec_yogurt_bowl",     name:"Greek Yogurt Bowl",         servings:1, ings:[
    {n:"Greek yogurt",        a:170, u:"g"},
    {n:"Blueberry",           a:100, u:"g"},
    {n:"Strawberry",          a:100, u:"g"},
    {n:"Honey",               a:21,  u:"g"},
  ]},
  {id:"srec_avocado_toast",   name:"Avocado Toast",             servings:1, ings:[
    {n:"Bread - whole wheat", a:56,  u:"g",   cm:"Toasted"},
    {n:"Avocado",             a:100, u:"g",   cm:"Mashed"},
    {n:"Lemon",               a:15,  u:"g"},
    {n:"Salt",                a:1,   u:"g"},
    {n:"Black pepper",        a:0.5, u:"g"},
  ]},
  {id:"srec_tuna_salad",      name:"Tuna Salad",                servings:1, ings:[
    {n:"Tuna",                a:150, u:"g"},
    {n:"Cucumber",            a:60,  u:"g",   cm:"Raw"},
    {n:"Tomato",              a:60,  u:"g",   cm:"Raw"},
    {n:"Onion",               a:20,  u:"g",   cm:"Raw"},
    {n:"Olive oil",           a:14,  u:"g"},
    {n:"Lemon",               a:15,  u:"g"},
    {n:"Salt",                a:1,   u:"g"},
  ]},
  {id:"srec_chicken_veg",     name:"Grilled Chicken & Veg",     servings:1, ings:[
    {n:"Chicken - breast",    a:150, u:"g",   cm:"Grilled"},
    {n:"Broccoli",            a:150, u:"g",   cm:"Steamed"},
    {n:"Bell pepper",         a:80,  u:"g",   cm:"Sautéed"},
    {n:"Olive oil",           a:14,  u:"g"},
    {n:"Garlic",              a:6,   u:"g"},
    {n:"Salt",                a:2,   u:"g"},
    {n:"Black pepper",        a:1,   u:"g"},
  ]},
  {id:"srec_salmon_lemon",    name:"Baked Salmon with Lemon",   servings:1, ings:[
    {n:"Salmon",              a:150, u:"g",   cm:"Baked"},
    {n:"Lemon",               a:30,  u:"g"},
    {n:"Olive oil",           a:14,  u:"g"},
    {n:"Garlic",              a:6,   u:"g"},
    {n:"Salt",                a:2,   u:"g"},
    {n:"Black pepper",        a:1,   u:"g"},
  ]},
];

function buildSeedRecipes(foods) {
  const byName = {};
  foods.forEach(f => { byName[normK(f.name)] = f; });
  return SEED_RECIPES_V1.map(rec => {
    const ingredients = rec.ings.map(def => {
      const food = byName[normK(def.n)];
      if (!food) return null;
      return { foodId:food.id, name:food.name, emoji:food.emoji, image:food.image,
        nutrition:food.nutrition, amount:def.a, unit:def.u||food.nutrition.unit||"g", cookMethod:def.cm||"" };
    }).filter(Boolean);
    if (ingredients.length === 0) return null;
    return { id:rec.id, name:rec.name, image:null, servings:rec.servings, ingredients, createdAt:Date.now() };
  }).filter(Boolean);
}

/* ── WORKOUT DATA ── */
const W_CATEGORIES = [
  { id: "push",   name: "Push",       colorId: "p1" },
  { id: "pull",   name: "Pull",       colorId: "p2" },
  { id: "lower",  name: "Lower body", colorId: "p3" },
  { id: "upper",  name: "Upper body", colorId: "p4" },
  { id: "core",   name: "Core",       colorId: "p5" },
  { id: "cardio", name: "Cardio",     colorId: "p6" },
  { id: "sport",  name: "Sport",      colorId: "p7" },
];
const W_SUBCATS = {
  push:[{id:"chest",label:"Chest",emoji:"🫁"},{id:"shoulders_p",label:"Shoulders",emoji:"🏋️"},{id:"triceps",label:"Triceps",emoji:"💪"}],
  pull:[{id:"back",label:"Back",emoji:"🔙"},{id:"biceps",label:"Biceps",emoji:"💪"},{id:"forearms",label:"Forearms",emoji:"🤲"}],
  lower:[{id:"quads",label:"Quads",emoji:"🦵"},{id:"hamstrings",label:"Hamstrings",emoji:"🦵"},{id:"glutes",label:"Glutes",emoji:"🍑"},{id:"calves",label:"Calves",emoji:"🦶"}],
  upper:[{id:"shoulders_u",label:"Shoulders",emoji:"🏋️"},{id:"arms",label:"Arms",emoji:"💪"},{id:"chest_u",label:"Chest",emoji:"🫁"}],
  core:[{id:"abs",label:"Abs",emoji:"🎯"},{id:"obliques",label:"Obliques",emoji:"🔄"}],
  cardio:[{id:"machine",label:"Gym machines",emoji:"🏃"},{id:"outdoor",label:"Outdoor",emoji:"🌳"},{id:"hiit",label:"HIIT",emoji:"🔥"}],
  sport:[{id:"tennis",label:"Tennis",emoji:"🎾"},{id:"basketball",label:"Basketball",emoji:"🏀"},{id:"football",label:"Football",emoji:"⚽"},{id:"swimming",label:"Swimming",emoji:"🏊"}],
};
const W_SEED = [
  /* PUSH — tp:"s"=strength, "c"=cardio, "b"=bodyweight; m=MET value */
  {n:"Bench press",e:"🏋️",t:["push","chest"],tp:"s",m:5},{n:"Incline bench press",e:"🏋️",t:["push","chest"],tp:"s",m:5},{n:"Dumbbell press",e:"🏋️",t:["push","chest"],tp:"s",m:5},{n:"Chest fly",e:"🫁",t:["push","chest"],tp:"s",m:3.5},{n:"Cable crossover",e:"🫁",t:["push","chest"],tp:"s",m:3.5},{n:"Push-up",e:"💪",t:["push","chest"],tp:"b",m:3.8},
  {n:"Overhead press",e:"🏋️",t:["push","shoulders_p","upper"],tp:"s",m:5},{n:"Lateral raise",e:"🏋️",t:["push","shoulders_p","upper"],tp:"s",m:3.5},{n:"Front raise",e:"🏋️",t:["push","shoulders_p","upper"],tp:"s",m:3.5},{n:"Arnold press",e:"🏋️",t:["push","shoulders_p","upper"],tp:"s",m:5},
  {n:"Tricep pushdown",e:"💪",t:["push","triceps"],tp:"s",m:3.5},{n:"Tricep dip",e:"💪",t:["push","triceps"],tp:"b",m:4},{n:"Skull crusher",e:"💀",t:["push","triceps"],tp:"s",m:3.5},{n:"Overhead tricep extension",e:"💪",t:["push","triceps"],tp:"s",m:3.5},
  /* PULL */
  {n:"Pull-up",e:"🔝",t:["pull","back"],tp:"b",m:4.5},{n:"Chin-up",e:"🔝",t:["pull","back","biceps"],tp:"b",m:4.5},{n:"Lat pulldown",e:"🔙",t:["pull","back"],tp:"s",m:5},{n:"Barbell row",e:"🏋️",t:["pull","back"],tp:"s",m:5},{n:"Dumbbell row",e:"🏋️",t:["pull","back"],tp:"s",m:5},{n:"Cable row",e:"🔙",t:["pull","back"],tp:"s",m:4},{n:"Face pull",e:"🎯",t:["pull","back","upper"],tp:"s",m:3.5},{n:"T-bar row",e:"🏋️",t:["pull","back"],tp:"s",m:5},
  {n:"Barbell curl",e:"💪",t:["pull","biceps"],tp:"s",m:3.5},{n:"Dumbbell curl",e:"💪",t:["pull","biceps"],tp:"s",m:3.5},{n:"Hammer curl",e:"🔨",t:["pull","biceps"],tp:"s",m:3.5},{n:"Preacher curl",e:"💪",t:["pull","biceps"],tp:"s",m:3.5},{n:"Concentration curl",e:"💪",t:["pull","biceps"],tp:"s",m:3},
  {n:"Wrist curl",e:"🤲",t:["pull","forearms"],tp:"s",m:3},{n:"Reverse curl",e:"🤲",t:["pull","forearms"],tp:"s",m:3},
  /* LOWER */
  {n:"Squat",e:"🦵",t:["lower","quads"],tp:"s",m:6},{n:"Front squat",e:"🦵",t:["lower","quads"],tp:"s",m:6},{n:"Leg press",e:"🦵",t:["lower","quads"],tp:"s",m:5.5},{n:"Leg extension",e:"🦵",t:["lower","quads"],tp:"s",m:3.5},{n:"Lunge",e:"🚶",t:["lower","quads","glutes"],tp:"b",m:5},{n:"Bulgarian split squat",e:"🦵",t:["lower","quads","glutes"],tp:"s",m:5.5},
  {n:"Romanian deadlift",e:"🏋️",t:["lower","hamstrings","pull"],tp:"s",m:6},{n:"Leg curl",e:"🦵",t:["lower","hamstrings"],tp:"s",m:3.5},{n:"Hip thrust",e:"🍑",t:["lower","glutes"],tp:"s",m:5},{n:"Glute bridge",e:"🍑",t:["lower","glutes"],tp:"b",m:3.8},
  {n:"Calf raise",e:"🦶",t:["lower","calves"],tp:"s",m:3},{n:"Seated calf raise",e:"🦶",t:["lower","calves"],tp:"s",m:3},
  {n:"Deadlift",e:"🏋️",t:["lower","pull","back"],tp:"s",m:6},
  /* CORE */
  {n:"Plank",e:"🧱",t:["core","abs"],tp:"b",m:3},{n:"Crunch",e:"🎯",t:["core","abs"],tp:"b",m:2.8},{n:"Leg raise",e:"🦵",t:["core","abs"],tp:"b",m:3},{n:"Ab wheel rollout",e:"🎡",t:["core","abs"],tp:"b",m:3.5},{n:"Russian twist",e:"🔄",t:["core","obliques"],tp:"b",m:3},{n:"Side plank",e:"🧱",t:["core","obliques"],tp:"b",m:3},{n:"Cable woodchop",e:"🪓",t:["core","obliques"],tp:"s",m:4},{n:"Mountain climber",e:"🏔️",t:["core","abs","cardio"],tp:"b",m:8},
  /* CARDIO */
  {n:"Treadmill",e:"🏃",t:["cardio","machine"],tp:"c",m:8},{n:"Elliptical",e:"🏃",t:["cardio","machine"],tp:"c",m:7},{n:"Stationary bike",e:"🚴",t:["cardio","machine"],tp:"c",m:7},{n:"Rowing machine",e:"🚣",t:["cardio","machine"],tp:"c",m:7.5},{n:"Stairmaster",e:"🪜",t:["cardio","machine"],tp:"c",m:9},
  {n:"Walking",e:"🚶",t:["cardio","outdoor"],tp:"c",m:3.5},{n:"Running",e:"🏃",t:["cardio","outdoor"],tp:"c",m:10},{n:"Cycling",e:"🚴",t:["cardio","outdoor"],tp:"c",m:8},{n:"Jump rope",e:"⏭️",t:["cardio","hiit"],tp:"c",m:11},{n:"Burpees",e:"🔥",t:["cardio","hiit","core"],tp:"c",m:10},
  /* SPORT */
  {n:"Tennis",e:"🎾",t:["sport","tennis","cardio"],tp:"c",m:7.3},{n:"Basketball",e:"🏀",t:["sport","basketball","cardio"],tp:"c",m:6.5},{n:"Football",e:"⚽",t:["sport","football","cardio"],tp:"c",m:7},{n:"Swimming",e:"🏊",t:["sport","swimming","cardio"],tp:"c",m:8},{n:"Boxing",e:"🥊",t:["sport","cardio","hiit"],tp:"c",m:9},
];
function buildSeedExercises(){return W_SEED.map((s,i)=>({id:"wex_"+i,name:s.n,emoji:s.e,tags:s.t,image:null,type:s.tp==="c"?"cardio":"strength",met:s.m}));}

/* Calorie estimation: MET x 3.5 x bodyWeight(kg) / 200 x minutes */
const DEFAULT_BODY_WT = 70; // kg
function estCalStrength(met, reps, sets, bodyWt) {
  // ~3 sec per rep + ~60 sec rest per set, convert to minutes
  const mins = ((reps * 3 * sets) + (60 * Math.max(0, sets - 1))) / 60;
  return rnd(met * 3.5 * (bodyWt || DEFAULT_BODY_WT) / 200 * mins);
}
function estCalCardio(met, durationMin, bodyWt) {
  return rnd(met * 3.5 * (bodyWt || DEFAULT_BODY_WT) / 200 * (durationMin || 0));
}

let _id = 1;
function uid(p) { return p + "_" + (++_id) + "_" + Math.random().toString(36).slice(2,6); }
function rnd(n, d=0) { const f=Math.pow(10,d); return Math.round((Number(n)+Number.EPSILON)*f)/f; }

/* Convert any portion unit to grams/ml for scaling against per-100g DB values */
const UNIT_TO_G = { g:1, ml:1, oz:28.35, lb:453.6, tsp:4.2, tbsp:12.6 };
function portionToG(amount, unit) { return (Number(amount)||0) * (UNIT_TO_G[unit] || 1); }

function emptyN() { return {cal:"",protein:"",carbs:"",fat:"",fiber:"",sugar:"",unit:"g",portion:100}; }
function scale(n, amt) {
  const f=(Number(amt)||0)/100;
  return {cal:(n.cal||0)*f,protein:(n.protein||0)*f,carbs:(n.carbs||0)*f,fat:(n.fat||0)*f,fiber:(n.fiber||0)*f,sugar:(n.sugar||0)*f};
}
/* Unit-aware ingredient scaling: converts amount+unit to grams first */
function scaleIng(ing) {
  let grams;
  if (ing.unit === "unit" && ing.nutrition?.countGrams) {
    grams = (Number(ing.amount)||0) * Number(ing.nutrition.countGrams);
  } else {
    grams = portionToG(Number(ing.amount)||0, ing.unit || ing.nutrition.unit || "g");
  }
  const f = grams / 100;
  const n = ing.nutrition;
  return {cal:(n.cal||0)*f,protein:(n.protein||0)*f,carbs:(n.carbs||0)*f,fat:(n.fat||0)*f,fiber:(n.fiber||0)*f,sugar:(n.sugar||0)*f};
}

/* "per 1 ct (50g)" or "per 100g" */
function portionLabel(n) {
  if (n?.countGrams) {
    const u = n.unit === "ml" ? "ml" : "g";
    return `per 1 ct (${n.countGrams}${u})`;
  }
  return `per ${Number(n?.portion)||100}${n?.unit||"g"}`;
}

/* Display an ingredient amount: "2 ct (100g)" or "150g" */
function fmtAmt(amount, unit, nutrition) {
  if (unit === "unit" && nutrition?.countGrams) {
    const n = Number(amount)||0;
    const g = rnd(n * (Number(nutrition.countGrams)||100));
    return `${n} ct (${g}g)`;
  }
  return `${amount}${unit}`;
}
/* Merge live pantry data into a stored ingredient snapshot.
   Falls back to stored values if the food was deleted or has no foodId. */
function resolveIng(ing, foodsMap) {
  if (!ing.foodId || !foodsMap) return ing;
  const live = foodsMap[ing.foodId];
  if (!live) return ing;
  return { ...ing, name: live.name, emoji: live.emoji, image: live.image, nutrition: live.nutrition, cookMethods: live.cookMethods||[] };
}

function normK(s){return s.toLowerCase().replace(/[-_/]+/g," ").replace(/\s+/g," ").trim();}
function lookup(name){
  const k=normK(name); if(!k)return null;
  for(const [dk,v] of Object.entries(NDB)){if(normK(dk)===k)return{...v};}
  let best=null;
  for(const dk of Object.keys(NDB)){const nk=normK(dk);if(k.includes(nk)||nk.includes(k)){if(!best||nk.length>normK(best).length)best=dk;}}
  return best?{...NDB[best]}:null;
}

function buildSeedFoods() {
  const now = Date.now();
  return SEED.map((s, i) => {
    const nk = s.n.toLowerCase().replace(/[A-Z]/g, c => c.toLowerCase());
    const nutrition = NDB[nk] || lookup(s.n) || emptyN();
    const cookMethods = COOK_METHODS_MAP[normK(s.n)] || [];
    const countInfo = COUNT_LABELS[normK(s.n)] || null;
    const enrichedNutrition = countInfo
      ? { ...nutrition, countLabel: countInfo.label, countGrams: countInfo.grams }
      : { ...nutrition };
    return { id: "seed_" + i, name: s.n, tags: s.t, emoji: s.e || "🍽", image: null, nutrition: enrichedNutrition, cookMethods, createdAt: now - i * 100 };
  });
}

/* ── storage helpers (localStorage for artifact) ── */
function load(key, fallback) {
  try { const v = localStorage.getItem("pantry_" + key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, val) { try { localStorage.setItem("pantry_" + key, JSON.stringify(val)); } catch {} }

function clearAndReseed() {
  try {
    ["foods","cats","recipes","plan"].forEach(k => localStorage.removeItem("pantry_" + k));
  } catch {}
  window.location.reload();
}

/* ── atoms ── */
const IS = (extra) => ({
  border: "1px solid " + T.lineS, borderRadius: 9, padding: "8px 12px",
  fontSize: 15, background: T.raised, color: T.ink, fontFamily: "system-ui,sans-serif",
  outline: "none", width: "100%", ...extra
});

function Btn({children,onClick,disabled,variant="primary",icon,full}) {
  const s = variant==="primary"
    ? {background:disabled?T.line:T.sageD,color:disabled?T.faint:"#FBF7EE",border:"none"}
    : {background:"transparent",color:T.ink,border:"1px solid "+T.lineS};
  return <button onClick={onClick} disabled={disabled} style={{
    display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,
    ...s, borderRadius:9, padding:"10px 18px", fontWeight:600, fontSize:14,
    cursor:disabled?"default":"pointer", width:full?"100%":undefined,
    fontFamily:"system-ui,sans-serif",
  }}>
    {icon && <span style={{fontSize:16}}>{icon}</span>}{children}
  </button>;
}

function CloseBtn({label="Close",saved,onClick}) {
  return <button onClick={onClick} style={{
    display:"inline-flex",alignItems:"center",gap:5,
    background:T.raised,color:T.ink,border:"1px solid "+T.lineS,
    borderRadius:9,padding:"6px 14px",fontSize:13,fontWeight:600,
    cursor:"pointer",fontFamily:"system-ui,sans-serif",
  }}>
    <span style={{fontSize:15}}>{saved?"✓":"✕"}</span>
    {label}
  </button>;
}

function DelBtn({label,onConfirm,icon=false}) {
  const [armed,setArmed]=useState(false);
  const t=useRef(null);
  useEffect(()=>()=>{if(t.current)clearTimeout(t.current)},[]);
  function handle(e){
    e&&e.stopPropagation();
    if(armed){if(t.current)clearTimeout(t.current);onConfirm();}
    else{setArmed(true);t.current=setTimeout(()=>setArmed(false),4000);}
  }
  if(icon) return <button onClick={handle} style={{
    display:"inline-flex",alignItems:"center",gap:3,height:30,padding:armed?"0 10px":0,minWidth:30,
    justifyContent:"center",background:armed?T.danger:T.raised,color:armed?"#fff":T.danger,
    border:"1px solid "+(armed?T.danger:T.danger+"44"),borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",
    fontFamily:"system-ui,sans-serif",
  }}>
    <span style={{fontSize:13}}>{armed?"⚠":"🗑"}</span>{armed&&<span>Sure?</span>}
  </button>;
  return <button onClick={handle} style={{
    display:"inline-flex",alignItems:"center",gap:5,
    background:armed?T.danger:"transparent",color:armed?"#fff":T.danger,
    border:"1px solid "+(armed?T.danger:T.danger+"55"),
    borderRadius:9,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer",
    fontFamily:"system-ui,sans-serif",
  }}>
    <span style={{fontSize:13}}>{armed?"⚠":"🗑"}</span>{armed?"Tap again to confirm":label}
  </button>;
}

function Empty({icon,title,body}) {
  return <div style={{textAlign:"center",padding:"3rem 1rem",color:T.soft}}>
    <div style={{fontSize:36,marginBottom:12,opacity:0.5}}>{icon}</div>
    <p style={{fontWeight:600,color:T.ink,margin:"0 0 6px",fontSize:15}}>{title}</p>
    <p style={{fontSize:13,margin:0}}>{body}</p>
  </div>;
}

function Label({children}) {
  return <label style={{display:"block",fontSize:11,fontWeight:700,color:T.soft,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:"system-ui,sans-serif"}}>{children}</label>;
}

function ImageSlot({value,onChange,size=96,editing=false,emoji="🍽"}) {
  const inputRef=useRef(null);
  function openPicker(){
    if(!editing)return;
    const el=inputRef.current;if(!el)return;el.value="";el.click();
  }
  function handleFile(e) {
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>onChange(reader.result);
    reader.readAsDataURL(file);
  }
  return <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <div onClick={openPicker} role={editing?"button":undefined}
      style={{width:size,height:size,borderRadius:14,overflow:"hidden",cursor:editing?"pointer":"default",
        display:"flex",alignItems:"center",justifyContent:"center",
        background:value?"transparent":"#FBF7EE",
        border:editing?`2px dashed ${value?"#C7C1AA":"#C4683D"}`:"1px solid #DDD8C6"}}>
      {value
        ?<img src={value} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        :<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,pointerEvents:"none"}}>
          <span style={{fontSize:size*0.38,lineHeight:1}}>{emoji}</span>
          {editing&&size>70&&<span style={{fontSize:11,fontWeight:600,color:"#C4683D",fontFamily:"system-ui,sans-serif"}}>Tap to add photo</span>}
        </div>}
    </div>
    {editing&&value&&<button onClick={e=>{e.stopPropagation();onChange(null);}}
      style={{position:"absolute",top:-8,right:-8,width:26,height:26,borderRadius:"50%",
        background:"#FFFFFF",border:"1.5px solid #C7C1AA",color:"#A23B2E",
        display:"flex",alignItems:"center",justifyContent:"center",padding:0,fontSize:14,fontWeight:700,cursor:"pointer"}}>
      ×
    </button>}
    <input ref={inputRef} type="file" accept="image/*"
      style={{position:"absolute",left:0,top:0,width:1,height:1,opacity:0,pointerEvents:"none"}}
      onChange={handleFile}/>
  </div>;
}

function Modal({children,onClose,width=600,level=1}) {
  return <div onClick={onClose} style={{
    position:"fixed",inset:0,background:"rgba(35,30,20,0.52)",display:"flex",
    alignItems:"center",justifyContent:"center",zIndex:10+level,padding:16,
  }}>
    <div onClick={e=>e.stopPropagation()} style={{
      background:T.bg,borderRadius:18,border:"1px solid "+T.line,
      padding:"1.4rem 1.4rem 1.1rem",width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",
    }}>
      {children}
    </div>
  </div>;
}

/* ── APP ── */

/* Run on load: dedup, fix tags, sync seed foods, add missing seeds & categories.
   Version-stamped so the heavy cleanup runs once after an update. */
const MIGRATION_VERSION = "v5";
function migrateStoredData() {
  try {
    // 1. Categories: remove hiprotein, add missing defaults
    const rawCats = localStorage.getItem("pantry_cats");
    let cats = rawCats ? JSON.parse(rawCats) : DEFAULT_CATEGORIES;
    cats = cats.filter(c => c.id !== "hiprotein");
    const existingCatIds = new Set(cats.map(c => c.id));
    for (const dc of DEFAULT_CATEGORIES) {
      if (!existingCatIds.has(dc.id)) cats.push(dc);
    }
    localStorage.setItem("pantry_cats", JSON.stringify(cats));

    // 2. Foods
    const rawFoods = localStorage.getItem("pantry_foods");
    let foods = rawFoods ? JSON.parse(rawFoods) : [];
    const seedFoods = buildSeedFoods();
    const seedByName = new Map(seedFoods.map(sf => [sf.name.toLowerCase().trim(), sf]));
    const doneVersion = localStorage.getItem("pantry_migration") === MIGRATION_VERSION;

    // retag hiprotein → protein
    foods = foods.map(f => {
      if (!(f.tags || []).includes("hiprotein")) return f;
      return { ...f, tags: [...new Set((f.tags||[]).map(t => t==="hiprotein"?"protein":t))] };
    });

    // deduplicate by name. For seed foods, re-sync tags+emoji from current seed
    // (fixes stale tags like casein appearing in wrong category).
    const seen = new Map();
    for (const f of foods) {
      const key = f.name.toLowerCase().trim();
      let entry = f;
      if (!doneVersion) {
        const seed = seedByName.get(key);
        if (seed) entry = { ...f, tags: seed.tags, emoji: f.emoji || seed.emoji };
      }
      // Always backfill cookMethods + countLabel from seed if food has none yet
      // (safe: only fills in missing data, never overwrites user customisations)
      const seed = seedByName.get(key);
      if (seed) {
        if (!entry.cookMethods?.length && seed.cookMethods?.length)
          entry = { ...entry, cookMethods: seed.cookMethods };
        if (!entry.nutrition?.countLabel && seed.nutrition?.countLabel)
          entry = { ...entry, nutrition: { ...entry.nutrition, countLabel: seed.nutrition.countLabel, countGrams: seed.nutrition.countGrams } };
      }
      seen.set(key, entry);
    }
    foods = [...seen.values()];

    // add any missing seeds
    const names = new Set(foods.map(f => f.name.toLowerCase().trim()));
    for (const sf of seedFoods) {
      const key = sf.name.toLowerCase().trim();
      if (!names.has(key)) { foods.push(sf); names.add(key); }
    }

    localStorage.setItem("pantry_foods", JSON.stringify(foods));
    localStorage.setItem("pantry_migration", MIGRATION_VERSION);

    // 3. Seed recipes once
    if (localStorage.getItem("pantry_recipe_seed") !== "rsv1") {
      const rawRec = localStorage.getItem("pantry_recipes");
      let recipes = rawRec ? JSON.parse(rawRec) : [];
      const seedRec = buildSeedRecipes(foods);
      const existIds = new Set(recipes.map(r => r.id));
      recipes = [...seedRec.filter(r => !existIds.has(r.id)), ...recipes];
      localStorage.setItem("pantry_recipes", JSON.stringify(recipes));
      localStorage.setItem("pantry_recipe_seed", "rsv1");
    }
  } catch (e) { console.warn("[Pantry] Migration error:", e); }
}

migrateStoredData();

export default function App() {
  const [section, setSection] = useState("nutrition"); // "nutrition" | "workout"

  /* ── NUTRITION STATE ── */
  const [foods, setFoods] = useState(() => load("foods", buildSeedFoods()));
  const [cats, setCats] = useState(() => load("cats", DEFAULT_CATEGORIES));
  const [recipes, setRecipes] = useState(() => load("recipes", []));
  const [plan, setPlan] = useState(() => load("plan", {}));
  const [tab, setTab] = useState("foods");
  const [openFood, setOpenFood] = useState(null);
  const [foodMode, setFoodMode] = useState("view");
  const [showCatMgr, setShowCatMgr] = useState(false);
  const [openRecipe, setOpenRecipe] = useState(null);
  const [recipeMode, setRecipeMode] = useState("view");
  const [dayPicker, setDayPicker] = useState(null);
  const [selDay, setSelDay] = useState(DAYS[0]);
  const [toast, setToast] = useState(null);
  const [addToRecipeModal, setAddToRecipeModal] = useState(null);
  const [stock, setStock] = useState(() => load("stock", []));
  const [shopping, setShopping] = useState(() => load("shopping", []));
  const [tasks, setTasks] = useState(() => load("tasks", []));
  const [tTab, setTTab] = useState("all");

  /* ── WORKOUT STATE ── */
  const [exercises, setExercises] = useState(() => load("w_exercises", buildSeedExercises()));
  const [wCats, setWCats] = useState(() => load("w_cats", W_CATEGORIES));
  const [routines, setRoutines] = useState(() => load("w_routines", []));
  const [wPlan, setWPlan] = useState(() => load("w_plan", {}));
  const [wTab, setWTab] = useState("exercises");
  const [openEx, setOpenEx] = useState(null);
  const [exMode, setExMode] = useState("view");
  const [showWCatMgr, setShowWCatMgr] = useState(false);
  const [openRoutine, setOpenRoutine] = useState(null);
  const [routineMode, setRoutineMode] = useState("view");
  const [wDayPicker, setWDayPicker] = useState(null);
  const [wSelDay, setWSelDay] = useState(DAYS[0]);

  /* ── PERSISTENCE ── */
  useEffect(()=>save("foods",foods),[foods]);
  useEffect(()=>save("cats",cats),[cats]);
  useEffect(()=>save("recipes",recipes),[recipes]);
  useEffect(()=>save("plan",plan),[plan]);
  useEffect(()=>save("stock",stock),[stock]);
  useEffect(()=>save("shopping",shopping),[shopping]);
  useEffect(()=>save("tasks",tasks),[tasks]);
  useEffect(()=>save("w_exercises",exercises),[exercises]);
  useEffect(()=>save("w_cats",wCats),[wCats]);
  useEffect(()=>save("w_routines",routines),[routines]);
  useEffect(()=>save("w_plan",wPlan),[wPlan]);

  function flash(msg){setToast(msg);setTimeout(()=>setToast(null),2000);}

  /* ── STOCK CRUD ── */
  function addStockItem(item){setStock(prev=>[{...item,id:uid("stk")},...prev]);}
  function updateStockItem(id,updates){setStock(prev=>prev.map(s=>s.id===id?{...s,...updates}:s));}
  function removeStockItem(id){setStock(prev=>prev.filter(s=>s.id!==id));}
  /* ── SHOPPING CRUD ── */
  function addShoppingItem(name,emoji="🛒"){setShopping(prev=>[...prev,{id:uid("shp"),name,emoji,done:false}]);}
  function toggleShoppingItem(id){setShopping(prev=>prev.map(s=>s.id===id?{...s,done:!s.done}:s));}
  function removeShoppingItem(id){setShopping(prev=>prev.filter(s=>s.id!==id));}
  function clearDoneShopping(){setShopping(prev=>prev.filter(s=>!s.done));}

  /* ── TASKS CRUD ── */
  function addTask(t){setTasks(prev=>[{...t,id:uid("tsk"),createdAt:Date.now(),done:false},...prev]);}
  function toggleTask(id){setTasks(prev=>prev.map(t=>t.id===id?{...t,done:!t.done,doneAt:!t.done?Date.now():null}:t));}
  function deleteTask(id){setTasks(prev=>prev.filter(t=>t.id!==id));}
  function updateTask(id,u){setTasks(prev=>prev.map(t=>t.id===id?{...t,...u}:t));}

  /* ── NUTRITION CRUD ── */
  const catById = useMemo(()=>{const m={};cats.forEach(c=>{m[c.id]={...c,palette:pal(c)};});return m;},[cats]);
  const foodsMap = useMemo(()=>{const m={};foods.forEach(f=>m[f.id]=f);return m;},[foods]);

  function handleMakeRecipe(selectedFoods, mode) {
    if (mode === "new") {
      const ingredients = selectedFoods.map(f => ({
        foodId: f.id, name: f.name, image: f.image, emoji: f.emoji,
        nutrition: f.nutrition,
        amount: f._amt != null ? f._amt : (f.nutrition.portion || 100),
        unit: f._unit || f.nutrition.unit || "g",
      }));
      setOpenRecipe({ id: uid("rec"), name: "", image: null, servings: 1, ingredients });
      setRecipeMode("edit"); setTab("recipes");
    } else { setAddToRecipeModal({ foods: selectedFoods }); }
  }
  function saveFood(food){ setFoods(prev=>prev.some(f=>f.id===food.id)?prev.map(f=>f.id===food.id?food:f):[food,...prev]); setOpenFood(food); }
  function delFood(id){setFoods(prev=>prev.filter(f=>f.id!==id));setOpenFood(null);}
  function addCat(name){
    const used=new Set(cats.map(c=>c.colorId));
    const next=CATEGORY_PALETTE.find(p=>!used.has(p.id))||CATEGORY_PALETTE[cats.length%CATEGORY_PALETTE.length];
    const c={id:uid("cat"),name,colorId:next.id}; setCats(prev=>[...prev,c]);return c.id;
  }
  function saveRecipe(r){setRecipes(prev=>prev.some(x=>x.id===r.id)?prev.map(x=>x.id===r.id?r:x):[r,...prev]);}
  function delRecipe(id){setRecipes(prev=>prev.filter(r=>r.id!==id));setPlan(prev=>{const n={};for(const d of Object.keys(prev))n[d]=prev[d].filter(i=>i.recipeId!==id);return n;});setOpenRecipe(null);}
  function dupRecipe(id){const r=recipes.find(x=>x.id===id);if(!r)return;saveRecipe({...r,id:uid("rec"),name:r.name+" copy"});flash("Duplicated");}
  function forkRecipe(r){setOpenRecipe({...r,id:uid("rec"),name:r.name+" (this time)"});setRecipeMode("edit");}
  function addToDay(day,recipeId,servings){ setPlan(prev=>({...prev,[day]:[...(prev[day]||[]),{iid:uid("inst"),recipeId,servings:Number(servings)||1}]})); setDayPicker(null);flash("Added to "+day); }
  function removeFromDay(day,iid){setPlan(prev=>({...prev,[day]:(prev[day]||[]).filter(i=>i.iid!==iid)}));}
  function dupToDay(day,iid,target){ const item=(plan[day]||[]).find(i=>i.iid===iid);if(!item)return; setPlan(prev=>({...prev,[target]:[...(prev[target]||[]),{iid:uid("inst"),recipeId:item.recipeId,servings:item.servings||1}]})); flash("Copied to "+target); }
  function updatePlanServings(day,iid,servings){ setPlan(prev=>({...prev,[day]:(prev[day]||[]).map(i=>i.iid===iid?{...i,servings:Number(servings)||0}:i)})); }
  function totals(recipe){ let cal=0,protein=0,carbs=0,fat=0,fiber=0,sugar=0; for(const ing of recipe.ingredients){const n=scaleIng(resolveIng(ing,foodsMap));cal+=n.cal;protein+=n.protein;carbs+=n.carbs;fat+=n.fat;fiber+=n.fiber;sugar+=n.sugar;} return{cal:rnd(cal),protein:rnd(protein,1),carbs:rnd(carbs,1),fat:rnd(fat,1),fiber:rnd(fiber,1),sugar:rnd(sugar,1)}; }
  function perServing(recipe){ const t=totals(recipe);const s=Number(recipe.servings)||1; return{cal:rnd(t.cal/s),protein:rnd(t.protein/s,1),carbs:rnd(t.carbs/s,1),fat:rnd(t.fat/s,1),fiber:rnd(t.fiber/s,1),sugar:rnd(t.sugar/s,1)}; }

  /* ── WORKOUT CRUD ── */
  const wCatById = useMemo(()=>{const m={};wCats.forEach(c=>{m[c.id]={...c,palette:pal(c)};});return m;},[wCats]);

  function saveExercise(ex){ setExercises(prev=>prev.some(x=>x.id===ex.id)?prev.map(x=>x.id===ex.id?ex:x):[ex,...prev]); setOpenEx(ex); }
  function delExercise(id){setExercises(prev=>prev.filter(x=>x.id!==id));setOpenEx(null);}
  function addWCat(name){
    const used=new Set(wCats.map(c=>c.colorId));
    const next=CATEGORY_PALETTE.find(p=>!used.has(p.id))||CATEGORY_PALETTE[wCats.length%CATEGORY_PALETTE.length];
    const c={id:uid("wcat"),name,colorId:next.id}; setWCats(prev=>[...prev,c]);return c.id;
  }
  function saveRoutine(r){setRoutines(prev=>prev.some(x=>x.id===r.id)?prev.map(x=>x.id===r.id?r:x):[r,...prev]);}
  function delRoutine(id){setRoutines(prev=>prev.filter(r=>r.id!==id));setWPlan(prev=>{const n={};for(const d of Object.keys(prev))n[d]=prev[d].filter(i=>i.routineId!==id);return n;});setOpenRoutine(null);}
  function dupRoutine(id){const r=routines.find(x=>x.id===id);if(!r)return;saveRoutine({...r,id:uid("rtn"),name:r.name+" copy"});flash("Duplicated");}
  function wAddToDay(day,routineId){ setWPlan(prev=>({...prev,[day]:[...(prev[day]||[]),{iid:uid("winst"),routineId}]})); setWDayPicker(null);flash("Added to "+day); }
  function wRemoveFromDay(day,iid){setWPlan(prev=>({...prev,[day]:(prev[day]||[]).filter(i=>i.iid!==iid)}));}

  /* ── SIDEBAR ── */
  const sections = [
    { id: "nutrition", label: "Nutrition", emoji: "🥗" },
    { id: "workout",   label: "Workout",   emoji: "💪" },
    { id: "tasks",     label: "Tasks",     emoji: "✅" },
  ];
  const isNutrition = section === "nutrition";
  const isWorkout   = section === "workout";
  const isTasks     = section === "tasks";
  const activeTab    = isNutrition ? tab : isWorkout ? wTab : tTab;
  const setActiveTab = isNutrition ? setTab : isWorkout ? setWTab : setTTab;
  const tabItems = isNutrition
    ? [{id:"stock",label:"In Stock",e:"🏠"},{id:"foods",label:"Foods",e:"🥦"},{id:"recipes",label:"Recipes",e:"👨‍🍳"},{id:"plan",label:"Plan",e:"📅"}]
    : isWorkout
    ? [{id:"exercises",label:"Exercises",e:"🏋️"},{id:"routines",label:"Routines",e:"📋"},{id:"plan",label:"Plan",e:"📅"}]
    : [{id:"all",label:"All",e:"📋"},{id:"work",label:"Work",e:"💼"},{id:"chores",label:"Chores",e:"🏠"},{id:"personal",label:"Personal",e:"🎯"},{id:"done",label:"Done",e:"✅"}];

  return <div className="app-shell" style={{fontFamily:"system-ui,sans-serif",color:T.ink}}>
    {/* Desktop sidebar */}
    <div className="app-sidebar">
      <div style={{padding:"18px 0 14px",width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:3,borderBottom:"1px solid rgba(255,255,255,0.1)",marginBottom:10}}>
        <span style={{fontSize:24,lineHeight:1}}>🥦</span>
        <span style={{fontSize:8,fontWeight:800,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Pantry</span>
      </div>
      {sections.map(s=>{const a=section===s.id;return <button key={s.id} onClick={()=>setSection(s.id)} style={{
        width:56,padding:"10px 4px",borderRadius:12,border:"none",cursor:"pointer",
        background:a?"rgba(255,255,255,0.18)":"transparent",
        color:a?"#FBF7EE":"rgba(255,255,255,0.5)",
        display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontFamily:"system-ui,sans-serif",
        transition:"background 0.15s,color 0.15s",
      }}><span style={{fontSize:22}}>{s.emoji}</span><span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.03em"}}>{s.label}</span></button>;})}
    </div>

    {/* Main content */}
    <div className="app-main">
      {/* Top nav tabs */}
      <div className="section-header">
        <div style={{display:"flex",alignItems:"baseline",gap:8}}>
          <span style={{fontSize:22,fontWeight:800,letterSpacing:"-0.02em"}}>{isNutrition?"Pantry":isWorkout?"Workout":"Tasks"}</span>
          <span className="header-subtitle" style={{fontSize:11,color:T.faint,marginLeft:4,fontFamily:"monospace"}}>{isNutrition?"nutrition tracker":isWorkout?"exercise planner":"to-do & chores"}</span>
        </div>
        <div className="section-tabs-wrap">
          {tabItems.map(it=>{const a=activeTab===it.id;return <button key={it.id} onClick={()=>setActiveTab(it.id)} className="section-tab-btn" style={{
            background:a?T.raised:"transparent",color:a?T.sageD:T.soft,
          }}><span>{it.e}</span>{it.label}</button>;})}
        </div>
      </div>

      {/* ═══ NUTRITION SECTION ═══ */}
      {isNutrition && <>
        {tab==="stock"&&<StockTab stock={stock} shopping={shopping} foods={foods}
          onAddStock={addStockItem} onUpdateStock={updateStockItem} onRemoveStock={removeStockItem}
          onAddShopping={addShoppingItem} onToggleShopping={toggleShoppingItem}
          onRemoveShopping={removeShoppingItem} onClearDone={clearDoneShopping}/>}

        {tab==="foods"&&<Pantry foods={foods} cats={cats} catById={catById}
          onOpen={f=>{setOpenFood(f);setFoodMode("view");}}
          onAdd={()=>{setOpenFood({id:uid("food"),name:"",emoji:"🍽",tags:[],image:null,nutrition:emptyN(),createdAt:Date.now()});setFoodMode("edit");}}
          onManageCats={()=>setShowCatMgr(true)}
          onMakeRecipe={handleMakeRecipe}/>}

        {addToRecipeModal&&<AddToRecipeModal recipes={recipes} newFoods={addToRecipeModal.foods}
          onClose={()=>setAddToRecipeModal(null)}
          onAdd={(recipe, newIngs) => { saveRecipe({...recipe,ingredients:[...recipe.ingredients,...newIngs]}); setAddToRecipeModal(null); flash("Added"); }}
          onNewRecipe={(ings) => { setOpenRecipe({id:uid("rec"),name:"",image:null,ingredients:ings}); setRecipeMode("edit"); setTab("recipes"); setAddToRecipeModal(null); }}/>}

        {tab==="recipes"&&<Recipes recipes={recipes} totals={totals} foods={foods} catById={catById}
          onNew={(ings=[])=>{setOpenRecipe({id:uid("rec"),name:"",image:null,servings:1,ingredients:ings});setRecipeMode("edit");}}
          onOpen={r=>{setOpenRecipe(r);setRecipeMode("view");}} onDelete={delRecipe} onDup={dupRecipe}/>}

        {tab==="plan"&&<Plan plan={plan} recipes={recipes} totals={totals} perServing={perServing}
          selDay={selDay} setSelDay={setSelDay} onAdd={day=>setDayPicker(day)}
          onRemove={removeFromDay} onDup={dupToDay} onUpdateServings={updatePlanServings}
          onOpenRecipe={r=>{setOpenRecipe(r);setRecipeMode("view");}}/>}

        {openFood&&<FoodModal food={openFood} mode={foodMode} cats={cats} catById={catById}
          onAddCat={addCat} onClose={()=>setOpenFood(null)} onEdit={()=>setFoodMode("edit")}
          onSave={f=>{saveFood(f);setFoodMode("view");flash("Saved");}}
          onSaveClose={f=>{saveFood(f);setOpenFood(null);flash("Saved");}}
          onDelete={()=>{delFood(openFood.id);flash("Deleted");}}/>}

        {showCatMgr&&<CatModal cats={cats} catById={catById}
          onClose={()=>setShowCatMgr(false)} onAdd={addCat}
          onDelete={id=>{setCats(p=>p.filter(c=>c.id!==id));setFoods(p=>p.map(f=>({...f,tags:(f.tags||[]).filter(t=>t!==id)})));}}
          onColor={(id,cid)=>setCats(p=>p.map(c=>c.id===id?{...c,colorId:cid}:c))}
          onRename={(id,n)=>setCats(p=>p.map(c=>c.id===id?{...c,name:n}:c))}/>}

        {openRecipe&&<RecipeModal recipe={openRecipe} mode={recipeMode} foods={foods}
          cats={cats} catById={catById} totals={totals}
          onClose={()=>setOpenRecipe(null)} onEdit={()=>setRecipeMode("edit")}
          onSave={r=>{saveRecipe(r);setOpenRecipe(r);setRecipeMode("view");flash("Saved");}}
          onSaveClose={r=>{saveRecipe(r);setOpenRecipe(null);flash("Saved");}}
          onDelete={()=>{delRecipe(openRecipe.id);flash("Deleted");}}
          onFork={()=>{forkRecipe(openRecipe);flash("Forked — original untouched");}}/>}

        {dayPicker&&<DayPickerModal day={dayPicker} recipes={recipes}
          onPick={(rid,servings)=>addToDay(dayPicker,rid,servings)} onClose={()=>setDayPicker(null)}/>}
      </>}

      {/* ═══ WORKOUT SECTION ═══ */}
      {isWorkout && <>
        {wTab==="exercises"&&<WorkoutExercises exercises={exercises} cats={wCats} catById={wCatById}
          onOpen={ex=>{setOpenEx(ex);setExMode("view");}}
          onAdd={()=>{setOpenEx({id:uid("wex"),name:"",emoji:"🏋️",tags:[],image:null,type:"strength",met:5});setExMode("edit");}}
          onManageCats={()=>setShowWCatMgr(true)}
          onMakeRoutine={sels=>{
            const rExs=sels.map(s=>{const isC=s.ex.type==="cardio";return{exerciseId:s.ex.id,name:s.ex.name,emoji:s.ex.emoji,
              ...(isC?{duration:s.duration||30}:{sets:Array.from({length:s.sets||3},()=>({weight:s.weight||0,reps:s.reps||10}))}),};});
            setOpenRoutine({id:uid("rtn"),name:"",exercises:rExs,weightUnit:sels[0]&&sels[0].wUnit||"lb"});
            setRoutineMode("edit");setWTab("routines");
          }}/>}

        {wTab==="routines"&&<WRoutines routines={routines}
          onNew={()=>{setOpenRoutine({id:uid("rtn"),name:"",exercises:[]});setRoutineMode("edit");}}
          onOpen={r=>{setOpenRoutine(r);setRoutineMode("view");}} onDelete={delRoutine} onDup={dupRoutine}/>}

        {wTab==="plan"&&<WPlan plan={wPlan} routines={routines}
          selDay={wSelDay} setSelDay={setWSelDay} onAdd={day=>setWDayPicker(day)}
          onRemove={wRemoveFromDay} onOpenRoutine={r=>{setOpenRoutine(r);setRoutineMode("view");}}/>}

        {openEx&&<ExerciseModal exercise={openEx} mode={exMode} cats={wCats} catById={wCatById}
          onAddCat={addWCat} onClose={()=>setOpenEx(null)} onEdit={()=>setExMode("edit")}
          onSave={ex=>{saveExercise(ex);setExMode("view");flash("Saved");}}
          onSaveClose={ex=>{saveExercise(ex);setOpenEx(null);flash("Saved");}}
          onDelete={()=>{delExercise(openEx.id);flash("Deleted");}}/>}

        {showWCatMgr&&<CatModal cats={wCats} catById={wCatById}
          onClose={()=>setShowWCatMgr(false)} onAdd={addWCat}
          onDelete={id=>{setWCats(p=>p.filter(c=>c.id!==id));setExercises(p=>p.map(f=>({...f,tags:(f.tags||[]).filter(t=>t!==id)})));}}
          onColor={(id,cid)=>setWCats(p=>p.map(c=>c.id===id?{...c,colorId:cid}:c))}
          onRename={(id,n)=>setWCats(p=>p.map(c=>c.id===id?{...c,name:n}:c))}/>}

        {openRoutine&&<RoutineModal routine={openRoutine} mode={routineMode} exercises={exercises}
          cats={wCats} catById={wCatById}
          onClose={()=>setOpenRoutine(null)} onEdit={()=>setRoutineMode("edit")}
          onSave={r=>{saveRoutine(r);setOpenRoutine(r);setRoutineMode("view");flash("Saved");}}
          onSaveClose={r=>{saveRoutine(r);setOpenRoutine(null);flash("Saved");}}
          onDelete={()=>{delRoutine(openRoutine.id);flash("Deleted");}}/>}

        {wDayPicker&&<WDayPickerModal day={wDayPicker} routines={routines}
          onPick={rid=>wAddToDay(wDayPicker,rid)} onClose={()=>setWDayPicker(null)}/>}
      </>}

      {/* ═══ TASKS SECTION ═══ */}
      {isTasks&&<TasksSection tasks={tasks} activeTab={tTab}
        onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask}/>}

      {toast&&<div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:T.sageD,color:"#FBF7EE",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:600,zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>{toast}</div>}
    </div>

    {/* Mobile bottom nav */}
    <div className="app-bottom-nav">
      {[
        {sec:"nutrition", label:"Nutrition", icon:"🥗"},
        {sec:"tasks",     label:"Tasks",     icon:"✅"},
        {sec:"workout",   label:"Workout",   icon:"💪"},
      ].map(item=>{
        const isActive=section===item.sec;
        return <button key={item.sec} onClick={()=>setSection(item.sec)} style={{
          flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          gap:4,padding:"10px 0",border:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif",
          background:isActive?"rgba(255,255,255,0.13)":"transparent",
          color:isActive?"#FBF7EE":"rgba(255,255,255,0.45)",
          minHeight:60,transition:"background 0.2s,color 0.2s",
        }}>
          <span style={{fontSize:26,lineHeight:1}}>{item.icon}</span>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase"}}>{item.label}</span>
        </button>;
      })}
    </div>
  </div>;
}


/* ── Helper: top 3 nutrients for a food (for flip card back) ── */
function topNutrients(n, portion) {
  const f = portionToG(Number(portion)||100, n.unit||"g") / 100;
  const candidates = [
    { label: "Calories", value: n.cal * f, unit: "kcal", raw: n.cal },
    { label: "Protein",  value: n.protein * f, unit: "g", raw: n.protein },
    { label: "Carbs",    value: n.carbs * f, unit: "g", raw: n.carbs },
    { label: "Fat",      value: n.fat * f, unit: "g", raw: n.fat },
    { label: "Fiber",    value: n.fiber * f, unit: "g", raw: n.fiber },
    { label: "Sugar",    value: (n.sugar || 0) * f, unit: "g", raw: n.sugar || 0 },
  ].filter(x => x.raw > 0);
  return candidates
    .sort((a, b) => (b.raw / (b.label === "Calories" ? 4 : 1)) - (a.raw / (a.label === "Calories" ? 4 : 1)))
    .slice(0, 3);
}

function Pantry({ foods, cats, catById, onOpen, onAdd, onManageCats, onMakeRecipe }) {
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [showNutrition, setShowNutrition] = useState(true);
  const [selections, setSelections] = useState({});
  const [contextCard, setContextCard] = useState(null);
  const [quickPick, setQuickPick] = useState(null);
  const [trayExpanded, setTrayExpanded] = useState(false);
  const longPressTimer = useRef(null);

  useEffect(() => { setActiveSubcat(null); }, [activeCat]);
  const selectedIds = useMemo(() => new Set(Object.keys(selections)), [selections]);
  const selectedList = useMemo(() => Object.values(selections), [selections]);
  const subcats = activeCat !== "all" ? (SUBCATS[activeCat] || []) : [];

  const visible = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const searching = ql.length > 0;

    let arr = foods.filter(f => {
      const nl = f.name.toLowerCase();
      const ftags = new Set(f.tags || []);
      // Category tab filter always applies
      if (activeCat !== "all" && !ftags.has(activeCat)) return false;
      // Subcategory filter
      if (activeSubcat) {
        const match = activeSubcat.names ? activeSubcat.names.some(n => nl.includes(n.toLowerCase())) : nl.includes(activeSubcat.id.toLowerCase());
        if (!match) return false;
      }
      // Search filter
      if (searching && !nl.includes(ql)) return false;
      return true;
    });

    if (searching) {
      // Rank: exact (0) > starts-with (1) > word-start (2) > contains (3)
      const rank = (name) => {
        const nl = name.toLowerCase();
        if (nl === ql) return 0;
        if (nl.startsWith(ql)) return 1;
        if (nl.split(/[\s\-]+/).some(w => w.startsWith(ql))) return 2;
        return 3;
      };
      arr.sort((a, b) => {
        const ra = rank(a.name), rb = rank(b.name);
        if (ra !== rb) return ra - rb;
        return a.name.localeCompare(b.name);
      });
    } else {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return arr;
  }, [foods, q, activeCat, activeSubcat]);

  function openContext(foodId, e) { e.stopPropagation(); setContextCard(prev => prev === foodId ? null : foodId); setQuickPick(null); }
  function openQuickPick(foodId) { setQuickPick(foodId); setContextCard(null); }
  function closePopups() { setContextCard(null); setQuickPick(null); }
  function handleSelectFood(food, amount, unit) { setSelections(prev => ({ ...prev, [food.id]: { food, amount: Number(amount), unit } })); setQuickPick(null); setContextCard(null); }
  function deselectFood(foodId) { setSelections(prev => { const n = { ...prev }; delete n[foodId]; return n; }); }
  function updateSelection(foodId, amount, unit) { setSelections(prev => prev[foodId] ? { ...prev, [foodId]: { ...prev[foodId], amount: Number(amount), unit } } : prev); }
  function clearAll() { setSelections({}); setTrayExpanded(false); }
  function startLongPress(food) { longPressTimer.current = setTimeout(() => openQuickPick(food.id), 500); }
  function cancelLongPress() { if (longPressTimer.current) clearTimeout(longPressTimer.current); }

  const hasTray = selectedList.length > 0;
  const anyPopupOpen = contextCard !== null || quickPick !== null;

  return (
    <div>
      {/* Full-screen transparent backdrop: closes all popups on tap */}
      {anyPopupOpen && (
        <div onClick={closePopups} style={{ position: "fixed", inset: 0, zIndex: 15, background: "transparent" }} />
      )}
      <input placeholder="Search foods..." value={q} onChange={e => setQ(e.target.value)} style={IS({ marginBottom: 10 })} />
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setShowNutrition(s => !s)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", border: "1px solid " + T.lineS, borderRadius: 9, fontSize: 13, fontWeight: 600, background: showNutrition ? T.sageD : T.raised, color: showNutrition ? "#FBF7EE" : T.ink, cursor: "pointer", fontFamily: "system-ui,sans-serif" }}>
          {showNutrition ? "Nutrition on" : "Nutrition off"}
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={onManageCats} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", border: "1px solid " + T.lineS, borderRadius: 9, fontSize: 13, fontWeight: 600, background: T.raised, color: T.ink, cursor: "pointer", fontFamily: "system-ui,sans-serif" }}>Edit categories</button>
        <Btn icon="+" onClick={onAdd}>Add food</Btn>
      </div>

      <div className="cat-strip" style={{ marginBottom: subcats.length ? 8 : 14 }}>
        <CatTab active={activeCat === "all"} onClick={() => setActiveCat("all")} label="All" count={foods.length} />
        {cats.map(c => { const count = foods.filter(f => (f.tags || []).includes(c.id)).length; if (count === 0) return null; return <CatTab key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} label={c.name} count={count} p={catById[c.id].palette} />; })}
      </div>

      {subcats.length > 0 && (
        <div className="scroll-x" style={{ display: "flex", gap: 5, paddingBottom: 6, marginBottom: 14, paddingLeft: 10, borderLeft: "3px solid " + (catById[activeCat] ? catById[activeCat].palette.hex : T.lineS) }}>
          <button onClick={() => setActiveSubcat(null)} style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 16, border: "1px solid " + T.lineS, background: !activeSubcat ? T.ink : "transparent", color: !activeSubcat ? "#FBF7EE" : T.soft, cursor: "pointer", fontFamily: "system-ui,sans-serif" }}>All {catById[activeCat] ? catById[activeCat].name : ""}</button>
          {subcats.map(sc => { const active = activeSubcat ? activeSubcat.id === sc.id : false; const p = catById[activeCat] ? catById[activeCat].palette : null; return (
            <button key={sc.id} onClick={() => setActiveSubcat(active ? null : sc)} style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 16, cursor: "pointer", fontFamily: "system-ui,sans-serif", border: active ? "1.5px solid " + (p ? p.hex : T.lineS) : "1px solid " + T.line, background: active ? (p ? p.soft : T.cream) : "transparent", color: active ? (p ? p.deep : T.ink) : T.soft, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span>{sc.emoji}</span>{sc.label}
            </button>
          ); })}
        </div>
      )}

      {foods.length === 0 ? <Empty icon="apple" title="Your pantry is empty" body="Tap 'Add food' to get started." />
        : visible.length === 0 ? <Empty icon="search" title="No matches" body="Try a different search or category." />
        : <div className={showNutrition ? "food-grid-full" : "food-grid-compact"}>
          {visible.map(f => (
            <FoodCard key={f.id} food={f} catById={catById} showNutrition={showNutrition}
              selected={selectedIds.has(f.id)} contextOpen={contextCard === f.id} quickPickOpen={quickPick === f.id}
              onView={() => onOpen(f)} onContextToggle={e => openContext(f.id, e)}
              onQuickPick={() => openQuickPick(f.id)} onCloseQuickPick={closePopups} onSelect={(amt, unit) => handleSelectFood(f, amt, unit)}
              onDeselect={() => deselectFood(f.id)}
              onLongPressStart={() => startLongPress(f)} onLongPressEnd={cancelLongPress}
            />
          ))}
        </div>
      }

      {hasTray && <div style={{ height: trayExpanded ? "55vh" : 80 }} />}
      {hasTray && <SelectionTray selections={selectedList} expanded={trayExpanded}
        onToggleExpand={() => setTrayExpanded(s => !s)}
        onUpdateAmount={updateSelection} onDeselect={deselectFood} onClear={clearAll}
        onMakeRecipe={() => onMakeRecipe(selectedList.map(s => Object.assign({}, s.food, {_amt: s.amount, _unit: s.unit})), "new")}
        onAddToRecipe={() => onMakeRecipe(selectedList.map(s => Object.assign({}, s.food, {_amt: s.amount, _unit: s.unit})), "add")}
      />}
    </div>
  );
}

function CatTab({ active, onClick, label, count, p }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: 20, cursor: "pointer",
      fontFamily: "system-ui,sans-serif",
      border: active ? "1.5px solid " + (p ? p.hex : T.sageD) : "1px solid " + T.line,
      background: active ? (p ? p.soft : T.sage) : "transparent",
      color: active ? (p ? p.deep : T.sageD) : T.soft,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      {p && <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.hex, display: "inline-block" }} />}
      {label}
      <span style={{ fontFamily: "monospace", fontSize: 10.5, opacity: 0.7 }}>{count}</span>
    </button>
  );
}

/* QuickPickPopup — inline amount picker that appears when "Select" is tapped on a card */
function QuickPickPopup({ food, onSelect, onClose }) {
  const n = food.nutrition;
  const hasCount = !!n.countGrams;
  const defaultUnit = hasCount ? "unit" : (n.unit || "g");
  const defaultAmt  = hasCount ? 1 : (Number(n.portion) || 100);
  const [amt, setAmt] = useState(String(defaultAmt));
  const [unit, setUnit] = useState(defaultUnit);

  const f = unit === "unit" && n.countGrams
    ? (Number(amt)||defaultAmt) * Number(n.countGrams) / 100
    : portionToG(Number(amt)||defaultAmt, unit) / 100;

  const amtLabel = unit === "unit" && n.countGrams
    ? `${amt} ct = ${rnd((Number(amt)||0)*Number(n.countGrams))}g`
    : null;

  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: "absolute", right: 0, top: "100%", marginTop: 4, zIndex: 30,
      background: T.raised, border: "1.5px solid " + T.sageD, borderRadius: 14,
      padding: "12px 14px", width: 250, boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    }}>
      <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 6px", color: T.ink }}>{food.name}</p>
      {amtLabel && <p style={{fontSize:10,color:T.soft,margin:"0 0 8px",fontFamily:"monospace"}}>{amtLabel}</p>}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <input type="number" value={amt} onChange={e => setAmt(e.target.value)}
          style={IS({ width: 70, padding: "5px 8px", fontSize: 14, fontFamily: "monospace" })} autoFocus />
        <select value={unit} onChange={e=>{setUnit(e.target.value);setAmt(e.target.value==="unit"?"1":String(Number(n.portion)||100));}} style={IS({ padding: "5px 6px", fontSize: 13, width: "auto" })}>
          {hasCount && <option value="unit">ct</option>}
          <option value="g">g</option><option value="ml">ml</option>
          <option value="oz">oz</option><option value="lb">lb</option>
          <option value="tsp">tsp</option><option value="tbsp">tbsp</option>
        </select>
      </div>
      <div style={{ background: T.cream, borderRadius: 8, padding: "7px 10px", marginBottom: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 3, columnGap: 10 }}>
          <CS l="Cal"     v={rnd((n.cal||0)*f)} />
          <CS l="Protein" v={rnd((n.protein||0)*f,1)+"g"} />
          <CS l="Carbs"   v={rnd((n.carbs||0)*f,1)+"g"} />
          <CS l="Fat"     v={rnd((n.fat||0)*f,1)+"g"} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onClose} style={{ flex: 1, padding: "7px", border: "1px solid " + T.lineS, borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 12, fontFamily: "system-ui,sans-serif" }}>Cancel</button>
        <button onClick={() => onSelect(amt || defaultAmt, unit)} style={{ flex: 2, padding: "7px", border: "none", borderRadius: 8, background: T.sageD, color: "#FBF7EE", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "system-ui,sans-serif" }}>+ Select</button>
      </div>
    </div>
  );
}

function FoodCard({ food, catById, showNutrition, selected, contextOpen, quickPickOpen, onView, onContextToggle, onQuickPick, onCloseQuickPick, onSelect, onDeselect, onLongPressStart, onLongPressEnd }) {
  const [flipped, setFlipped] = useState(false);
  const n = food.nutrition;
  const portion = Number(n.portion) || 100;
  const unit = n.unit || "g";
  const f = portionToG(portion, unit) / 100;
  const tags = food.tags || [];
  const firstCat = tags.length > 0 && catById[tags[0]] ? catById[tags[0]] : null;
  const p = firstCat ? firstCat.palette : null;
  const emoji = food.emoji || "🍽";
  const topNuts = topNutrients(n, portion);

  /* Popup shown on card tap — "View details" + "Select" (or "Deselect") */
  const Popup = () => (
    <div onClick={e => e.stopPropagation()} style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      background: T.raised, border: "1.5px solid " + T.lineS,
      borderRadius: 14, padding: "8px 6px", zIndex: 20,
      display: "flex", flexDirection: "column", gap: 4,
      minWidth: 150, boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
    }}>
      <button onClick={e => { e.stopPropagation(); onCloseQuickPick(); onView(); }} style={{
        padding: "9px 14px", border: "none", background: T.cream,
        textAlign: "center", fontSize: 13, fontWeight: 600,
        cursor: "pointer", borderRadius: 9, fontFamily: "system-ui,sans-serif", color: T.ink,
      }}>View details</button>
      {selected
        ? <button onClick={e => { e.stopPropagation(); onCloseQuickPick(); onDeselect(); }} style={{
            padding: "9px 14px", border: "none", background: T.danger + "18",
            color: T.danger, textAlign: "center", fontSize: 13, fontWeight: 700,
            cursor: "pointer", borderRadius: 9, fontFamily: "system-ui,sans-serif",
          }}>Deselect</button>
        : <button onClick={e => { e.stopPropagation(); onQuickPick(); }} style={{
            padding: "9px 14px", border: "none", background: T.sageD,
            color: "#FBF7EE", textAlign: "center", fontSize: 13, fontWeight: 700,
            cursor: "pointer", borderRadius: 9, fontFamily: "system-ui,sans-serif",
          }}>+ Select</button>
      }
    </div>
  );

  /* ── compact (nutrition off) flip card ── */
  if (!showNutrition) {
    return (
      <div
        onMouseDown={onLongPressStart} onMouseUp={onLongPressEnd}
        onMouseLeave={onLongPressEnd} onTouchStart={onLongPressStart} onTouchEnd={onLongPressEnd}
        style={{ position: "relative", aspectRatio: "1", cursor: "pointer", perspective: (contextOpen || quickPickOpen) ? "none" : 600, zIndex: (contextOpen || quickPickOpen) ? 16 : "auto" }}
      >
        {/* Selection ring */}
        {selected && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 12, border: "3px solid " + T.sageD, zIndex: 3, pointerEvents: "none", background: T.sageD + "18" }}>
            <span style={{ position: "absolute", top: 4, right: 6, fontSize: 13, fontWeight: 800, color: T.sageD }}>✓</span>
          </div>
        )}

        {/* Flip container */}
        <div style={{ width: "100%", height: "100%", position: "relative", transition: "transform 0.4s", transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
          {/* Front */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: p ? p.soft : T.cream, border: "1px solid " + T.line, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {food.image ? <img src={food.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 32 }}>{emoji}</span>}
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, margin: 0, padding: "4px 6px", textAlign: "center", color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{food.name}</p>
            <div style={{ height: 3, width: "100%", background: p ? p.hex : T.lineS }} />
          </div>
          {/* Back */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: p ? p.soft : T.cream, border: "1.5px solid " + (p ? p.hex : T.lineS), borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "8px 6px", gap: 3 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: p ? p.deep : T.soft, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 3px", textAlign: "center" }}>{portionLabel(n)}</p>
            {topNuts.map(nt => (
              <div key={nt.label} style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "2px 5px", background: p ? p.hex + "22" : T.line + "55", borderRadius: 5 }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: p ? p.deep : T.soft }}>{nt.label}</span>
                <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>{rnd(nt.value, nt.unit === "kcal" ? 0 : 1)}{nt.unit === "kcal" ? "" : nt.unit}</span>
              </div>
            ))}
            <p style={{ fontSize: 9, color: T.faint, margin: "3px 0 0" }}>tap to flip back</p>
          </div>
        </div>

        {/* Overlay: tap front flips, context popup takes priority */}
        {!contextOpen && !quickPickOpen && !flipped && (
          <div onClick={e => { e.stopPropagation(); onContextToggle(e); }} style={{ position: "absolute", inset: 0, borderRadius: 12 }} />
        )}
        {!contextOpen && !quickPickOpen && flipped && (
          <div onClick={e => { e.stopPropagation(); setFlipped(false); }} style={{ position: "absolute", inset: 0, borderRadius: 12 }} />
        )}

        {contextOpen && !quickPickOpen && <Popup />}
        {quickPickOpen && (
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 25, marginTop: 4 }}>
            <QuickPickPopup food={food} onSelect={onSelect} onClose={onCloseQuickPick} />
          </div>
        )}
      </div>
    );
  }

  /* ── full nutrition card ── */
  return (
    <div
      onClick={onContextToggle}
      onMouseDown={onLongPressStart} onMouseUp={onLongPressEnd}
      onMouseLeave={onLongPressEnd} onTouchStart={onLongPressStart} onTouchEnd={onLongPressEnd}
      style={{ background: T.raised, border: selected ? "2px solid " + T.sageD : "1px solid " + T.line, borderRadius: 14, overflow: "visible", cursor: "pointer", display: "flex", flexDirection: "column", position: "relative", zIndex: (contextOpen || quickPickOpen) ? 16 : "auto" }}
    >
      {selected && <div style={{ position: "absolute", top: 6, right: 6, fontSize: 13, fontWeight: 800, color: T.sageD, zIndex: 2 }}>✓</div>}
      <div style={{ display: "flex", minHeight: 110, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ width: 110, flexShrink: 0, background: p ? p.soft : T.cream, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid " + T.line }}>
          {food.image ? <img src={food.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 44, lineHeight: 1, userSelect: "none" }}>{emoji}</span>}
        </div>
        <div style={{ flex: 1, padding: "9px 11px", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 20 }}>{food.name || "Untitled"}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 4 }}>
            {tags.slice(0, 3).map(tid => { const c = catById[tid]; if (!c) return null; const pp = c.palette; return <span key={tid} style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: pp.soft, color: pp.deep, textTransform: "uppercase", letterSpacing: "0.03em" }}>{c.name}</span>; })}
            {tags.length > 3 && <span style={{ fontSize: 9, color: T.faint }}>+{tags.length - 3}</span>}
          </div>
          <p style={{ fontSize: 10, color: T.faint, margin: "0 0 4px", fontFamily: "monospace", fontWeight: 600 }}>{portionLabel(n)}</p>
          <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 2, columnGap: 8 }}>
            <CS l="Cal" v={rnd(n.cal * f)} />
            <CS l="Protein" v={rnd(n.protein * f, 1) + "g"} />
            <CS l="Carbs" v={rnd(n.carbs * f, 1) + "g"} />
            <CS l="Sugar" v={rnd((n.sugar || 0) * f, 1) + "g"} />
            <CS l="Fiber" v={rnd(n.fiber * f, 1) + "g"} />
            <CS l="Fat" v={rnd(n.fat * f, 1) + "g"} />
          </div>
        </div>
      </div>
      <div style={{ height: 4, background: p ? p.hex : T.lineS, borderRadius: "0 0 14px 14px" }} />

      {contextOpen && !quickPickOpen && <Popup />}
      {quickPickOpen && (
        <div onClick={e => e.stopPropagation()} style={{ position: "absolute", right: 0, top: "100%", zIndex: 25, marginTop: 4 }}>
          <QuickPickPopup food={food} onSelect={onSelect} onClose={onCloseQuickPick} />
        </div>
      )}
    </div>
  );
}

function CS({ l, v }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 4 }}>
    <span style={{ fontSize: 9.5, color: T.faint, textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 }}>{l}</span>
    <span style={{ fontFamily: "monospace", fontSize: 11.5, fontWeight: 500, color: T.ink }}>{v}</span>
  </div>;
}

/* SelectionTray — sticky bottom bar, drag up to expand */
function SelectionTray({ selections, expanded, onToggleExpand, onUpdateAmount, onDeselect, onClear, onMakeRecipe, onAddToRecipe }) {
  const totals = selections.reduce((s, sel) => {
    const f = portionToG(sel.amount, sel.unit) / 100;
    const n = sel.food.nutrition;
    return {
      cal:     s.cal     + (n.cal     || 0) * f,
      protein: s.protein + (n.protein || 0) * f,
      carbs:   s.carbs   + (n.carbs   || 0) * f,
      fat:     s.fat     + (n.fat     || 0) * f,
      fiber:   s.fiber   + (n.fiber   || 0) * f,
    };
  }, {cal:0,protein:0,carbs:0,fat:0,fiber:0});

  const NutBadge = ({label, value, unit="g"}) => (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:38}}>
      <span style={{fontSize:14,fontWeight:800,lineHeight:1,color:"#FBF7EE"}}>{rnd(value, unit==="g"?1:0)}</span>
      <span style={{fontSize:8,fontWeight:700,opacity:0.55,textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</span>
    </div>
  );

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 25, fontFamily: "system-ui,sans-serif" }}>
      {/* Collapsed bar */}
      <div style={{ background: T.sageD, color: "#FBF7EE", paddingBottom: "env(safe-area-inset-bottom,0px)", boxShadow: "0 -4px 20px rgba(0,0,0,0.25)" }}>
        {/* Drag handle */}
        <div onClick={onToggleExpand} style={{ textAlign: "center", padding: "8px 0 6px", cursor: "pointer" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.35)", display: "inline-block" }} />
        </div>

        {/* Nutrient strip */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px 8px" }}>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <NutBadge label="cal"  value={totals.cal} unit="kcal" />
            <div style={{width:1,height:24,background:"rgba(255,255,255,0.15)"}}/>
            <NutBadge label="prot" value={totals.protein} />
            <NutBadge label="carb" value={totals.carbs}   />
            <NutBadge label="fat"  value={totals.fat}     />
            <NutBadge label="fiber" value={totals.fiber}  />
          </div>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <button onClick={onMakeRecipe} style={{ padding:"7px 11px", borderRadius:9, border:"1.5px solid rgba(255,255,255,0.5)", background:"transparent", color:"#FBF7EE", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"system-ui,sans-serif" }}>Make recipe</button>
            <button onClick={onAddToRecipe} style={{ padding:"7px 11px", borderRadius:9, background:"#FBF7EE", color:T.sageD, fontWeight:700, fontSize:12, border:"none", cursor:"pointer", fontFamily:"system-ui,sans-serif" }}>Add to recipe</button>
          </div>
        </div>

        {/* Item chips */}
        <div style={{ display:"flex", gap:5, overflowX:"auto", padding:"0 16px 10px", scrollbarWidth:"none" }}>
          {selections.map(sel => (
            <span key={sel.food.id} style={{ flexShrink:0, fontSize:11, fontWeight:600, background:"rgba(255,255,255,0.15)", borderRadius:6, padding:"3px 8px", whiteSpace:"nowrap", color:"#FBF7EE" }}>
              {sel.food.emoji||""} {sel.food.name} · {sel.amount}{sel.unit}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "55vh", background: T.bg, borderTop: "2px solid " + T.sageD, overflowY: "auto", zIndex: 24, boxShadow: "0 -8px 32px rgba(0,0,0,0.2)" }}>
          <div style={{ padding: "12px 16px 120px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Selected foods</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onClear} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid " + T.danger, borderRadius: 8, color: T.danger, background: "transparent", cursor: "pointer", fontFamily: "system-ui,sans-serif" }}>Clear all</button>
                <button onClick={onToggleExpand} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid " + T.lineS, borderRadius: 8, background: T.raised, cursor: "pointer", fontFamily: "system-ui,sans-serif" }}>Collapse</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selections.map(sel => {
                const f = portionToG(sel.amount, sel.unit) / 100;
                const cal = rnd((sel.food.nutrition.cal || 0) * f);
                const protein = rnd((sel.food.nutrition.protein || 0) * f, 1);
                return (
                  <div key={sel.food.id} style={{ background: T.raised, border: "1px solid " + T.line, borderRadius: 12, padding: 10, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{sel.food.emoji || ""}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sel.food.name}</p>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <input type="number" value={sel.amount} onChange={e => onUpdateAmount(sel.food.id, e.target.value, sel.unit)}
                          style={{ width: 60, padding: "3px 6px", border: "1px solid " + T.lineS, borderRadius: 7, fontSize: 13, fontFamily: "monospace", background: T.raised, color: T.ink }} />
                        <select value={sel.unit} onChange={e => onUpdateAmount(sel.food.id, sel.amount, e.target.value)}
                          style={{ padding: "3px 5px", border: "1px solid " + T.lineS, borderRadius: 7, fontSize: 12, background: T.raised, color: T.ink }}>
                          <option value="g">g</option><option value="ml">ml</option>
                          <option value="oz">oz</option><option value="lb">lb</option>
                          <option value="tsp">tsp</option><option value="tbsp">tbsp</option>
                        </select>
                        <span style={{ fontSize: 11, fontFamily: "monospace", color: T.soft }}>{cal} cal | {protein}g protein</span>
                      </div>
                    </div>
                    <button onClick={() => onDeselect(sel.food.id)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid " + T.danger + "44", background: "transparent", color: T.danger, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>x</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function FoodModal({food,mode,cats,catById,onAddCat,onClose,onEdit,onSave,onSaveClose,onDelete}){
  const editing=mode==="edit";
  const lastFoodId=useRef(null);
  const [name,setName]=useState(food.name);
  const [emoji,setEmoji]=useState(food.emoji||"?");
  const [tags,setTags]=useState(food.tags||[]);
  const [image,setImage]=useState(food.image);
  const [n,setN]=useState({...food.nutrition});
  const [autofilled,setAutofilled]=useState(false);
  const [showNewCat,setShowNewCat]=useState(false);
  const [newCatName,setNewCatName]=useState("");
  const [saving,setSaving]=useState(false);
  const [calcAmt,setCalcAmt]=useState("");
  const [calcUnit,setCalcUnit]=useState(food.nutrition&&food.nutrition.unit||"g");
  const [showScan,setShowScan]=useState(false);
  const [cookMethods,setCookMethods]=useState(food.cookMethods||[]);
  const [newMethod,setNewMethod]=useState("");

  useEffect(()=>{
    if(lastFoodId.current!==food.id){
      lastFoodId.current=food.id;
      setName(food.name);setEmoji(food.emoji||"?");setTags(food.tags||[]);
      setImage(food.image);setN({...food.nutrition});setAutofilled(false);
      setCalcAmt("");setCalcUnit(food.nutrition&&food.nutrition.unit||"g");
      setCookMethods(food.cookMethods||[]);setNewMethod("");
    }
  },[food.id]);

  function onBlur(){
    // Only auto-fill if ALL nutrition fields are still empty/zero (fresh new food)
    const allEmpty = [n.cal,n.protein,n.carbs,n.fat,n.fiber,n.sugar].every(v => v===""||Number(v)===0);
    if(!allEmpty||autofilled)return;
    const found=lookup(name);
    if(found){setN(found);setAutofilled(true);}
  }
  function togTag(id){setTags(prev=>prev.includes(id)?prev.filter(t=>t!==id):[...prev,id]);}
  function build(){return{id:food.id,name:name.trim(),emoji,tags,image,cookMethods,createdAt:food.createdAt||Date.now(),
    nutrition:{cal:Number(n.cal)||0,protein:Number(n.protein)||0,carbs:Number(n.carbs)||0,
      fat:Number(n.fat)||0,fiber:Number(n.fiber)||0,sugar:Number(n.sugar)||0,
      unit:n.unit||"g",portion:Number(n.portion)||100}};}

  /* Edit conversion: user types per-portion, n stores per-100g internally */
  const editF = portionToG(Number(n.portion)||100, n.unit||"g") / 100;
  const toDisp = v => v===""?"":String(rnd(Number(v||0)*editF,1));
  const toStore = v => v===""?"":(editF>0?Number(v||0)/editF:0);
  const hasName=!!name.trim();
  const calcF=(()=>{
    const fn=food.nutrition;
    const baseUnit=fn?.unit||"g";
    if(calcAmt!==""&&Number(calcAmt)>0){
      if(calcUnit==="unit"&&fn?.countGrams) return Number(calcAmt)*Number(fn.countGrams)/100;
      return portionToG(Number(calcAmt),calcUnit)/100;
    }
    return portionToG(Number(fn?.portion)||100,baseUnit)/100;
  })();
  const isCalcMode=calcAmt!==""&&Number(calcAmt)>0;

  return <Modal onClose={()=>editing&&hasName?onSaveClose(build()):onClose()} width={640}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:10}}>
      <span style={{fontSize:11,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:"0.04em"}}>
        {!food.name&&editing?"New food":editing?"Editing":"Food detail"}
      </span>
      <CloseBtn label={editing&&hasName?"Done":"Close"} saved={editing&&hasName} onClick={()=>editing&&hasName?onSaveClose(build()):onClose()}/>
    </div>

    <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:16}}>
      <div style={{flexShrink:0,display:"flex",flexDirection:"column",gap:8,alignItems:"center",width:160}}>
        <ImageSlot value={image} onChange={setImage} size={160} editing={editing} emoji={emoji}/>
        {editing&&<div style={{display:"flex",gap:6,alignItems:"center",marginTop:2}}>
          <span style={{fontSize:11,fontWeight:600,color:T.soft,fontFamily:"system-ui,sans-serif"}}>Emoji</span>
          <input value={emoji} onChange={e=>setEmoji(e.target.value||"?")} maxLength={4}
            style={{width:50,fontSize:22,textAlign:"center",border:"1px solid "+T.lineS,borderRadius:8,padding:"3px 4px",background:T.raised}}/>
        </div>}
      </div>

      <div style={{flex:1,minWidth:200}}>
        {editing
          ?<div style={{marginBottom:12}}>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              <input autoFocus value={name} onChange={e=>{setName(e.target.value);setAutofilled(false);}} onBlur={onBlur}
                placeholder="Food name, e.g. Chicken - wings" style={IS({fontSize:18,fontWeight:700,padding:"8px 10px",flex:1})}/>
              <button onClick={()=>setShowScan(true)} title="Scan barcode" style={{
                padding:"8px 12px",borderRadius:9,border:"1px solid "+T.lineS,background:T.raised,
                cursor:"pointer",fontSize:18,flexShrink:0,color:T.ink,
              }}>📷</button>
            </div>
            {showScan&&<BarcodeScanModal onResult={r=>{
              setName(r.name||name);setEmoji(r.emoji||emoji);
              setN({...r.nutrition});setAutofilled(true);setShowScan(false);
            }} onClose={()=>setShowScan(false)}/>}
          </div>
          :<h2 style={{margin:"0 0 10px",fontSize:20}}>{food.name}</h2>}

        <div style={{marginBottom:14}}>
          <Label>{editing?"Tags — select all that apply":"Tags"}</Label>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {cats.map(c=>{const p=catById[c.id].palette;const on=tags.includes(c.id);
              if(!editing&&!on)return null;
              return <button key={c.id} onClick={()=>editing&&togTag(c.id)} style={{
                display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",fontSize:12,fontWeight:600,
                cursor:editing?"pointer":"default",border:on?"1.5px solid "+p.hex:"1px solid "+T.line,
                background:on?p.soft:"transparent",color:on?p.deep:T.soft,borderRadius:14,fontFamily:"system-ui,sans-serif"}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:on?p.hex:T.lineS,display:"inline-block"}}/>
                {c.name}{editing&&on&&" v"}
              </button>;
            })}
            {editing&&!showNewCat&&<button onClick={()=>setShowNewCat(true)} style={{fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:14,border:"1px dashed "+T.lineS,background:"transparent",color:T.soft,cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>+ New</button>}
          </div>
          {showNewCat&&<div style={{display:"flex",gap:8,marginTop:8}}>
            <input autoFocus placeholder="New category name" value={newCatName} onChange={e=>setNewCatName(e.target.value)} style={IS({flex:1})}/>
            <Btn onClick={()=>{if(!newCatName.trim())return;const id=onAddCat(newCatName.trim());setTags(p=>[...p,id]);setNewCatName("");setShowNewCat(false);}}>Add</Btn>
            <Btn variant="ghost" onClick={()=>{setShowNewCat(false);setNewCatName("");}}>Cancel</Btn>
          </div>}
        </div>

        <div style={{border:"2px solid "+T.ink,borderRadius:10,padding:"12px 14px",background:editing?T.tcSoft:T.raised}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:"8px solid "+T.ink,paddingBottom:6,marginBottom:8,gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:16,fontWeight:900,letterSpacing:"-0.01em"}}>Nutrition facts</span>
            {editing
              ?<div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:11,color:T.soft}}>per</span>
                <input type="number" value={n.portion} onChange={e=>setN({...n,portion:e.target.value})} style={IS({width:56,padding:"4px 6px",fontSize:13})}/>
                <select value={n.unit} onChange={e=>setN({...n,unit:e.target.value})} style={IS({padding:"4px 6px",fontSize:13,width:"auto"})}>
                  <option value="g">g</option><option value="ml">ml</option><option value="oz">oz</option>
                  <option value="lb">lb</option><option value="tsp">tsp</option><option value="tbsp">tbsp</option>
                </select>
              </div>
              :<span style={{fontSize:12,color:T.soft,fontFamily:"monospace",fontWeight:600}}>per {food.nutrition.portion}{food.nutrition.unit}</span>}
          </div>
          {editing
            ?<>
              <p style={{fontSize:10.5,color:T.soft,margin:"0 0 8px",lineHeight:1.4}}>Enter the nutrition for {Number(n.portion)||100}{n.unit||"g"} (your portion above).</p>
              <NRow l="Calories" v={toDisp(n.cal)} editing bold large onChange={v=>setN({...n,cal:toStore(v)})}/>
              <NRow l="Protein" v={toDisp(n.protein)} u="g" editing onChange={v=>setN({...n,protein:toStore(v)})}/>
              <NRow l="Carbohydrates" v={toDisp(n.carbs)} u="g" editing onChange={v=>setN({...n,carbs:toStore(v)})}/>
              <NRow l="Sugar" v={toDisp(n.sugar||0)} u="g" editing indent onChange={v=>setN({...n,sugar:toStore(v)})}/>
              <NRow l="Fiber" v={toDisp(n.fiber)} u="g" editing indent onChange={v=>setN({...n,fiber:toStore(v)})}/>
              <NRow l="Fat" v={toDisp(n.fat)} u="g" editing last onChange={v=>setN({...n,fat:toStore(v)})}/>
              {autofilled&&<p style={{fontSize:11,color:T.soft,margin:"9px 0 0"}}>Auto-filled from database. Adjust if needed.</p>}
            </>
            :<>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,padding:"8px 10px",background:isCalcMode?T.tcSoft:T.cream,borderRadius:8,flexWrap:"wrap"}}>
                <span style={{fontSize:12,fontWeight:600,color:T.soft,fontFamily:"system-ui,sans-serif"}}>Calculate for:</span>
                <input type="number" inputMode="decimal" placeholder={String(food.nutrition.portion)}
                  value={calcAmt} onChange={e=>setCalcAmt(e.target.value)}
                  style={Object.assign({},IS({width:70,padding:"5px 8px",fontSize:14,fontFamily:"monospace"}),{background:T.raised})}/>
                <select value={calcUnit} onChange={e=>{setCalcUnit(e.target.value);setCalcAmt(e.target.value==="unit"?"1":"");}} style={Object.assign({},IS({padding:"5px 8px",fontSize:13,width:"auto"}),{background:T.raised})}>
                  {food.nutrition?.countGrams&&<option value="unit">ct</option>}
                  <option value="g">g</option><option value="ml">ml</option><option value="oz">oz</option>
                  <option value="lb">lb</option><option value="tsp">tsp</option><option value="tbsp">tbsp</option>
                </select>
                {isCalcMode&&<button onClick={()=>{setCalcAmt("");setCalcUnit(food.nutrition.unit||"g");}} style={{fontSize:11,fontWeight:600,color:T.tc,background:"transparent",border:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif",padding:0}}>Reset</button>}
                {isCalcMode&&<span style={{fontSize:11,color:T.tc,fontWeight:700,marginLeft:"auto"}}>Live</span>}
              </div>
              <NRow l="Calories" v={rnd(food.nutrition.cal*calcF,0)} bold large onChange={()=>{}}/>
              <NRow l="Protein" v={rnd(food.nutrition.protein*calcF,1)} u="g" onChange={()=>{}}/>
              <NRow l="Carbohydrates" v={rnd(food.nutrition.carbs*calcF,1)} u="g" onChange={()=>{}}/>
              <NRow l="Sugar" v={rnd((food.nutrition.sugar||0)*calcF,1)} u="g" indent onChange={()=>{}}/>
              <NRow l="Fiber" v={rnd(food.nutrition.fiber*calcF,1)} u="g" indent onChange={()=>{}}/>
              <NRow l="Fat" v={rnd(food.nutrition.fat*calcF,1)} u="g" last onChange={()=>{}}/>
              <p style={{fontSize:10,color:T.faint,margin:"8px 0 0",fontFamily:"monospace",lineHeight:1.5}}>
                {isCalcMode?`Showing: ${calcAmt}${calcUnit} | ${portionLabel(food.nutrition)}`:`${portionLabel(food.nutrition)} | Type above to recalculate`}
              </p>
            </>}
        </div>
      </div>
    </div>

    {/* Cooking methods */}
    {(()=>{
      const suggested = COOK_METHODS_MAP[normK(food.name)] || [];
      const active = editing ? cookMethods : (food.cookMethods||[]);
      const custom = active.filter(m => !suggested.includes(m));
      function toggleMethod(m){
        setCookMethods(prev => prev.includes(m) ? prev.filter(x=>x!==m) : [...prev,m]);
      }
      return <div style={{marginBottom:14,paddingTop:14,borderTop:"1px solid "+T.line}}>
        <Label>Cooking methods</Label>
        {editing ? <>
          {suggested.length>0&&<>
            <p style={{fontSize:11,color:T.faint,margin:"0 0 7px"}}>Tap to select:</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
              {suggested.map(m=>{const on=cookMethods.includes(m);return(
                <button key={m} onClick={()=>toggleMethod(m)} style={{
                  fontSize:12,fontWeight:600,padding:"4px 11px",borderRadius:8,cursor:"pointer",
                  fontFamily:"system-ui,sans-serif",transition:"all 0.12s",
                  border:on?"1.5px solid "+T.sageD:"1px solid "+T.lineS,
                  background:on?T.sageD:"transparent",color:on?"#FBF7EE":T.soft,
                }}>{on?"✓ ":""}{m}</button>
              );})}
            </div>
          </>}
          {custom.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
            {custom.map((m,i)=>(
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:12,fontWeight:600,background:T.sage,color:T.sageD,padding:"3px 9px",borderRadius:7}}>
                {m}
                <button onClick={()=>setCookMethods(p=>p.filter(x=>x!==m))} style={{background:"transparent",border:"none",cursor:"pointer",padding:"0 0 0 2px",color:T.sageD,fontSize:14,lineHeight:1,fontFamily:"system-ui,sans-serif"}}>×</button>
              </span>
            ))}
          </div>}
          <div style={{display:"flex",gap:6}}>
            <input value={newMethod} onChange={e=>setNewMethod(e.target.value)}
              placeholder="+ Custom method…" style={IS({fontSize:13,flex:1})}
              onKeyDown={e=>{if(e.key==="Enter"&&newMethod.trim()&&!cookMethods.includes(newMethod.trim())){setCookMethods(p=>[...p,newMethod.trim()]);setNewMethod("");}}}/>
            <Btn onClick={()=>{if(newMethod.trim()&&!cookMethods.includes(newMethod.trim())){setCookMethods(p=>[...p,newMethod.trim()]);setNewMethod("");}}} disabled={!newMethod.trim()}>+ New</Btn>
          </div>
        </> : <>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {active.map((m,i)=>(
              <span key={i} style={{fontSize:12,fontWeight:600,background:T.sage,color:T.sageD,padding:"3px 10px",borderRadius:7}}>{m}</span>
            ))}
            {active.length===0&&<span style={{fontSize:12,color:T.faint}}>None added</span>}
          </div>
        </>}
      </div>;
    })()}

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,paddingTop:14,borderTop:"1px solid "+T.line,flexWrap:"wrap"}}>
      {!editing?<>
        <DelBtn label="Delete food" onConfirm={onDelete}/>
        <div style={{display:"flex",gap:8}}><Btn variant="ghost" onClick={onClose}>Close</Btn><Btn icon="e" onClick={onEdit}>Edit food</Btn></div>
      </>:<>
        {food.name?<DelBtn label="Delete food" onConfirm={onDelete}/>:<span/>}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:T.faint}}>{hasName?"Tap outside to save":"Add a name first"}</span>
          <Btn disabled={!hasName||saving} icon="v" onClick={()=>{if(!hasName)return;setSaving(true);onSave(build());setSaving(false);}}>{saving?"Saving...":"Save"}</Btn>
        </div>
      </>}
    </div>
  </Modal>;
}

function NRow({l,v,u,editing,onChange,bold,large,indent,last}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:large?"6px 0":"5px 0",borderBottom:last?"none":"1px solid "+T.line}}>
    <span style={{fontSize:large?16:14,fontWeight:bold?700:400,paddingLeft:indent?14:0}}>{l}</span>
    {editing
      ?<input type="number" value={v} onChange={e=>onChange(e.target.value)} style={IS({width:72,padding:"4px 8px",fontSize:large?15:13,textAlign:"right",fontFamily:"monospace"})}/>
      :<span style={{fontFamily:"monospace",fontSize:large?18:14,fontWeight:500}}>{rnd(Number(v),u?1:0)}{u&&<span style={{fontSize:(large?18:14)-3,color:T.soft,marginLeft:2}}>{u}</span>}</span>}
  </div>;
}

function CatModal({cats,catById,onClose,onAdd,onDelete,onColor,onRename}){
  const [name,setName]=useState("");
  const [swatchFor,setSwatchFor]=useState(null);
  return <Modal onClose={onClose} width={460}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <h3 style={{margin:0}}>Manage categories</h3><CloseBtn onClick={onClose}/>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
      {cats.map(c=>{const p=catById[c.id].palette;const open=swatchFor===c.id;return <div key={c.id} style={{background:T.raised,border:"1px solid "+T.line,borderRadius:10,padding:"8px 10px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setSwatchFor(open?null:c.id)} style={{width:28,height:28,borderRadius:8,background:p.hex,border:"2px solid "+(open?T.ink:"transparent"),padding:0,flexShrink:0,cursor:"pointer"}}/>
          <input value={c.name} onChange={e=>onRename(c.id,e.target.value)} style={IS({flex:1,padding:"6px 10px",fontSize:13.5,fontWeight:600,border:"1px solid transparent",background:"transparent"})}/>
          <DelBtn onConfirm={()=>onDelete(c.id)} icon/>
        </div>
        {open&&<div style={{display:"flex",gap:8,marginTop:10,paddingTop:10,borderTop:"1px solid "+T.line,flexWrap:"wrap"}}>
          {CATEGORY_PALETTE.map(pp=><button key={pp.id} onClick={()=>{onColor(c.id,pp.id);setSwatchFor(null);}} style={{width:28,height:28,borderRadius:"50%",background:pp.hex,border:c.colorId===pp.id?"2.5px solid "+T.ink:"1px solid "+T.line,padding:0,cursor:"pointer"}}/>)}
        </div>}
      </div>;})}
    </div>
    <div style={{borderTop:"1px solid "+T.line,paddingTop:14}}>
      <Label>New category</Label>
      <div style={{display:"flex",gap:8}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Snacks" style={IS({flex:1})}/>
        <Btn onClick={()=>{if(name.trim()){onAdd(name.trim());setName("");}}}> Add</Btn>
      </div>
    </div>
    <div style={{textAlign:"right",marginTop:16}}><Btn variant="ghost" onClick={onClose}>Done</Btn></div>
  </Modal>;
}

function Recipes({recipes,totals,foods,catById,onNew,onOpen,onDelete,onDup}){
  const [sortBy,setSortBy]=useState("recent");
  const [recipeSearch,setRecipeSearch]=useState("");
  const [bQuery,setBQuery]=useState("");      // builder ingredient search
  const [bItems,setBItems]=useState([]);      // selected builder ingredients
  const bQueryRef=useRef(null);

  const SORTS=[
    {id:"recent",  label:"Recent"},
    {id:"protein", label:"↑ Protein"},
    {id:"fiber",   label:"↑ Fiber"},
    {id:"cal_hi",  label:"↑ Calories"},
    {id:"cal_lo",  label:"↓ Calories"},
  ];

  /* Filter + sort existing recipes */
  const filtered=useMemo(()=>{
    let arr=recipes;
    if(recipeSearch.trim()) arr=arr.filter(r=>r.name.toLowerCase().includes(recipeSearch.toLowerCase()));
    return [...arr].sort((a,b)=>{
      if(sortBy==="recent") return (b.createdAt||0)-(a.createdAt||0);
      const ta=totals(a),tb=totals(b);
      if(sortBy==="protein") return tb.protein-ta.protein;
      if(sortBy==="fiber")   return tb.fiber-ta.fiber;
      if(sortBy==="cal_hi")  return tb.cal-ta.cal;
      if(sortBy==="cal_lo")  return ta.cal-tb.cal;
      return 0;
    });
  },[recipes,recipeSearch,sortBy,totals]);

  /* Builder: search results */
  const bResults=useMemo(()=>{
    const q=bQuery.trim().toLowerCase();
    if(!q) return [];
    const selIds=new Set(bItems.map(b=>b.food.id));
    return foods.filter(f=>!selIds.has(f.id)&&f.name.toLowerCase().includes(q)).slice(0,8);
  },[foods,bQuery,bItems]);

  /* Builder: smart suggestions from existing recipes */
  const bSuggestions=useMemo(()=>{
    if(bItems.length===0) return [];
    const selIds=new Set(bItems.map(b=>b.food.id));
    const selNames=new Set(bItems.map(b=>b.food.name.toLowerCase()));
    const counts=new Map(); const fmap=new Map();
    for(const rec of recipes){
      const has=rec.ingredients.some(ing=>
        (ing.foodId&&selIds.has(ing.foodId))||selNames.has(ing.name.toLowerCase())
      );
      if(!has) continue;
      for(const ing of rec.ingredients){
        const food=foods.find(f=>f.id===ing.foodId||f.name.toLowerCase()===ing.name.toLowerCase());
        if(!food||selIds.has(food.id)) continue;
        counts.set(food.id,(counts.get(food.id)||0)+1);
        fmap.set(food.id,food);
      }
    }
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([id])=>fmap.get(id));
  },[bItems,recipes,foods]);

  /* Builder: running nutrition */
  const bTotals=useMemo(()=>bItems.reduce((acc,s)=>{
    const g=s.unit==="unit"&&s.food.nutrition?.countGrams
      ?Number(s.amount)*Number(s.food.nutrition.countGrams)
      :portionToG(Number(s.amount),s.unit);
    const n=s.food.nutrition; const f=g/100;
    return{cal:acc.cal+(n.cal||0)*f,protein:acc.protein+(n.protein||0)*f,
           carbs:acc.carbs+(n.carbs||0)*f,fat:acc.fat+(n.fat||0)*f};
  },{cal:0,protein:0,carbs:0,fat:0}),[bItems]);

  function bAdd(food){
    const hasCount=!!food.nutrition?.countGrams;
    const unit=hasCount?"unit":(food.nutrition?.unit||"g");
    const amount=hasCount?1:(food.nutrition?.portion||100);
    setBItems(prev=>[...prev,{food,amount,unit}]);
    setBQuery(""); bQueryRef.current?.focus();
  }
  function bRemove(id){setBItems(prev=>prev.filter(b=>b.food.id!==id));}
  function bCreate(){
    const ings=bItems.map(b=>({foodId:b.food.id,name:b.food.name,emoji:b.food.emoji,
      image:b.food.image,nutrition:b.food.nutrition,amount:b.amount,unit:b.unit,cookMethod:""}));
    onNew(ings); setBItems([]);
  }

  return <div>
    {/* ── Smart Recipe Builder ── */}
    <div style={{background:T.raised,border:"1px solid "+T.line,borderRadius:16,padding:"14px 16px",marginBottom:20,boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
      <p style={{fontSize:11,fontWeight:800,color:T.faint,textTransform:"uppercase",letterSpacing:"0.05em",margin:"0 0 10px"}}>Build a recipe</p>

      {/* Search to add ingredient */}
      <div style={{position:"relative",marginBottom:12}}>
        <input ref={bQueryRef} value={bQuery} onChange={e=>setBQuery(e.target.value)}
          placeholder="Search ingredient to add…" style={IS({paddingLeft:10})}/>
        {bResults.length>0&&<div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,
          background:T.raised,border:"1px solid "+T.line,borderRadius:10,
          boxShadow:"0 8px 24px rgba(0,0,0,0.12)",zIndex:20,overflow:"hidden"}}>
          {bResults.map(food=>{
            const n=food.nutrition;
            const cal=rnd((n.cal||0)*(portionToG(n.countGrams||n.portion||100,n.countGrams?"g":n.unit||"g")/100));
            return <div key={food.id} onClick={()=>bAdd(food)} style={{
              display:"flex",alignItems:"center",gap:10,padding:"9px 14px",
              cursor:"pointer",borderBottom:"1px solid "+T.line,
            }}>
              <span style={{fontSize:22,flexShrink:0}}>{food.emoji||"🍽"}</span>
              <span style={{flex:1,fontSize:13,fontWeight:600}}>{food.name}</span>
              <span style={{fontSize:11,color:T.faint,fontFamily:"monospace"}}>{n.countGrams?"1 ct":"per "+(n.portion||100)+(n.unit||"g")} · {cal} cal</span>
              <span style={{fontSize:18,color:T.sageD}}>+</span>
            </div>;
          })}
        </div>}
      </div>

      {bItems.length>0?<>
        {/* Left nutrition + right ingredient chips */}
        <div style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
          {/* Nutrition panel */}
          <div style={{background:T.sageD,color:"#FBF7EE",borderRadius:12,padding:"12px 14px",minWidth:86,flexShrink:0,textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:800,lineHeight:1}}>{rnd(bTotals.cal)}</div>
            <div style={{fontSize:9,opacity:0.65,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.04em"}}>cal total</div>
            <div style={{fontSize:10,opacity:0.7,lineHeight:1.7}}>
              <div>{rnd(bTotals.protein,1)}g prot</div>
              <div>{rnd(bTotals.carbs,1)}g carb</div>
              <div>{rnd(bTotals.fat,1)}g fat</div>
            </div>
          </div>

          {/* Ingredient chips */}
          <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:8}}>
            {bItems.map(sel=>{
              const n=sel.food.nutrition;
              const g=sel.unit==="unit"&&n?.countGrams
                ?Number(sel.amount)*Number(n.countGrams)
                :portionToG(Number(sel.amount),sel.unit);
              const cal=rnd((n.cal||0)*g/100);
              const p=(sel.food.tags||[]).length>0&&catById[sel.food.tags[0]]?catById[sel.food.tags[0]].palette:null;
              return <div key={sel.food.id} style={{
                display:"inline-flex",alignItems:"center",
                borderRadius:12,overflow:"hidden",
                border:"1px solid "+T.line,
                boxShadow:"0 2px 8px rgba(0,0,0,0.07)",
              }}>
                {/* Blurred background image panel */}
                <div style={{position:"relative",width:44,height:44,flexShrink:0}}>
                  <div style={{position:"absolute",inset:0,background:p?p.soft:T.cream}}/>
                  {sel.food.image&&<img src={sel.food.image} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"blur(8px)",opacity:0.45}}/>}
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {sel.food.image
                      ?<img src={sel.food.image} alt="" style={{width:28,height:28,objectFit:"cover",borderRadius:6}}/>
                      :<span style={{fontSize:22}}>{sel.food.emoji||"🍽"}</span>}
                  </div>
                </div>
                {/* Name + nutrition */}
                <div style={{padding:"4px 8px",background:T.raised,minWidth:0}}>
                  <p style={{fontWeight:700,fontSize:12,margin:"0 0 1px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:110}}>{sel.food.name}</p>
                  <p style={{fontSize:10,color:T.faint,margin:0,fontFamily:"monospace"}}>
                    {fmtAmt(sel.amount,sel.unit,n)}{" · "}<b style={{color:T.ink}}>{cal}</b>{" cal"}
                  </p>
                </div>
                <button onClick={()=>bRemove(sel.food.id)} style={{
                  width:26,height:"100%",border:"none",background:T.raised,
                  color:T.faint,cursor:"pointer",fontSize:16,flexShrink:0,
                  borderLeft:"1px solid "+T.line,display:"flex",alignItems:"center",justifyContent:"center",
                }}>×</button>
              </div>;
            })}
          </div>
        </div>

        {/* Suggestions */}
        {bSuggestions.length>0&&<div style={{marginBottom:12}}>
          <p style={{fontSize:10,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:"0.05em",margin:"0 0 7px"}}>Pairs well with</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {bSuggestions.map(food=><div key={food.id} onClick={()=>bAdd(food)} style={{
              display:"flex",alignItems:"center",gap:6,cursor:"pointer",
              background:T.cream,border:"1px solid "+T.line,borderRadius:8,padding:"5px 10px 5px 7px",
            }}>
              <span style={{fontSize:17}}>{food.emoji||"🍽"}</span>
              <span style={{fontSize:12,fontWeight:600}}>{food.name}</span>
            </div>)}
          </div>
        </div>}

        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <Btn onClick={bCreate}>Create recipe →</Btn>
        </div>
      </>
      :<p style={{fontSize:13,color:T.faint,textAlign:"center",margin:"4px 0 0"}}>Search an ingredient above to start building</p>}
    </div>

    {/* ── Existing Recipes ── */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,gap:8,flexWrap:"wrap"}}>
      <div className="scroll-x" style={{display:"flex",gap:5}}>
        {SORTS.map(s=>{const a=sortBy===s.id;return <button key={s.id} onClick={()=>setSortBy(s.id)} style={{
          flexShrink:0,fontSize:12,fontWeight:600,padding:"5px 11px",borderRadius:16,cursor:"pointer",
          fontFamily:"system-ui,sans-serif",border:a?"1.5px solid "+T.sageD:"1px solid "+T.line,
          background:a?T.sage:"transparent",color:a?T.sageD:T.soft,
        }}>{s.label}</button>;})}
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <input value={recipeSearch} onChange={e=>setRecipeSearch(e.target.value)}
          placeholder="Search recipes…" style={IS({fontSize:13,padding:"6px 10px",width:160})}/>
        <Btn icon="+" onClick={()=>onNew([])}>New</Btn>
      </div>
    </div>
    {recipes.length===0?<Empty icon="chef" title="No recipes yet" body="Use the builder above or tap New."/>
    :filtered.length===0?<Empty icon="search" title="No recipes match" body="Try a different search."/>
    :<div className="card-grid">
      {filtered.map(r=>{const t=totals(r);return <div key={r.id} style={{display:"flex",flexDirection:"column",height:"100%"}}>
        <div onClick={()=>onOpen(r)} style={{background:T.raised,border:"1px solid "+T.line,borderRadius:14,overflow:"hidden",cursor:"pointer",flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{width:"100%",aspectRatio:"1.15",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {r.image?<img src={r.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:30}}>🍳</span>}
          </div>
          <div style={{padding:"8px 10px",flex:1}}>
            <p style={{fontWeight:700,fontSize:13.5,margin:"0 0 3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.name}</p>
            <p style={{fontSize:11,fontFamily:"monospace",color:T.soft,margin:"0 0 4px"}}>{t.cal} cal · {r.servings||1} serving{(r.servings||1)!==1?"s":""}</p>
            <div style={{display:"flex",gap:6}}>
              <span style={{fontSize:10,fontWeight:700,color:"#4A7A8C",background:"#4A7A8C18",borderRadius:4,padding:"1px 5px"}}>{t.protein}g prot</span>
              <span style={{fontSize:10,fontWeight:700,color:"#6E8C4A",background:"#6E8C4A18",borderRadius:4,padding:"1px 5px"}}>{t.fiber}g fiber</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:4,marginTop:6,justifyContent:"flex-end"}}>
          <button onClick={()=>onDup(r.id)} style={{width:30,height:30,borderRadius:8,border:"1px solid "+T.line,background:T.raised,cursor:"pointer",fontSize:12,fontFamily:"system-ui,sans-serif"}}>copy</button>
          <DelBtn onConfirm={()=>onDelete(r.id)} icon/>
        </div>
      </div>;})}
    </div>}
  </div>;
}

function RecipeModal({recipe,mode,foods,cats,catById,totals,onClose,onEdit,onSave,onSaveClose,onDelete,onFork}){
  const editing=mode==="edit";
  const [name,setName]=useState(recipe.name);
  const [image,setImage]=useState(recipe.image);
  const [ings,setIngs]=useState(recipe.ingredients);
  const [servings,setServings]=useState(recipe.servings||1);
  const [viewServings,setViewServings]=useState(recipe.servings||1); // calculator in view mode
  const [showPicker,setShowPicker]=useState(false);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    setName(recipe.name);setImage(recipe.image);setIngs(recipe.ingredients);
    setServings(recipe.servings||1);setViewServings(recipe.servings||1);
  },[recipe.id,mode]);

  const foodsMap=useMemo(()=>{const m={};foods.forEach(f=>m[f.id]=f);return m;},[foods]);

  // Total for the whole recipe (all servings) — uses live food data via resolveIng
  const tot=useMemo(()=>{
    let cal=0,protein=0,carbs=0,fat=0,fiber=0,sugar=0;
    ings.forEach(ing=>{const n=scaleIng(resolveIng(ing,foodsMap));cal+=n.cal;protein+=n.protein;carbs+=n.carbs;fat+=n.fat;fiber+=n.fiber;sugar+=n.sugar;});
    return{cal,protein,carbs,fat,fiber,sugar};
  },[ings,foodsMap]);

  const baseServings=Number(servings)||1;
  // In view mode, show nutrition for `viewServings` servings (each serving = total/baseServings)
  const shown=(()=>{
    const perServ=k=>tot[k]/baseServings;
    const mult=editing?baseServings:(Number(viewServings)||0); // edit shows whole recipe total
    return{
      cal:rnd(perServ("cal")*mult), protein:rnd(perServ("protein")*mult,1),
      carbs:rnd(perServ("carbs")*mult,1), sugar:rnd(perServ("sugar")*mult,1),
      fiber:rnd(perServ("fiber")*mult,1), fat:rnd(perServ("fat")*mult,1),
    };
  })();

  const canSave=!!name.trim()&&ings.length>0;
  function build(){return{id:recipe.id,name:name.trim(),image,servings:baseServings,ingredients:ings};}

  return <Modal onClose={()=>canSave&&editing?onSaveClose(build()):onClose()} width={560}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:10}}>
      <span style={{fontSize:11,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:"0.04em"}}>{!recipe.name&&editing?"New recipe":editing?"Editing":"Recipe"}</span>
      <CloseBtn label={editing&&canSave?"Done":"Close"} saved={editing&&canSave} onClick={()=>canSave&&editing?onSaveClose(build()):onClose()}/>
    </div>
    <div style={{display:"flex",gap:14,marginBottom:14}}>
      <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center"}}>
        <ImageSlot value={image} onChange={setImage} size={82} editing={editing} emoji="🍳"/>
      </div>
      <div style={{flex:1}}>
        {editing?<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Recipe name" style={IS({fontSize:17,fontWeight:700,padding:"8px 10px",marginBottom:8})}/>
        :<h2 style={{margin:"0 0 8px"}}>{recipe.name}</h2>}

        {/* Servings control */}
        {editing
          ?<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:12,fontWeight:600,color:T.soft}}>Makes</span>
            <input type="number" min="0.5" step="0.5" value={servings} onChange={e=>setServings(e.target.value)} style={IS({width:64,padding:"5px 8px",fontFamily:"monospace",fontSize:14})}/>
            <span style={{fontSize:12,color:T.soft}}>serving{baseServings!==1?"s":""}</span>
          </div>
          :<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,padding:"6px 10px",background:T.cream,borderRadius:8,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:600,color:T.soft}}>Show for</span>
            <input type="number" min="0" step="0.5" value={viewServings} onChange={e=>setViewServings(e.target.value)} style={Object.assign({},IS({width:64,padding:"5px 8px",fontFamily:"monospace",fontSize:14}),{background:T.raised})}/>
            <span style={{fontSize:12,color:T.soft}}>of {baseServings} serving{baseServings!==1?"s":""}</span>
            {Number(viewServings)!==baseServings&&<button onClick={()=>setViewServings(baseServings)} style={{fontSize:11,fontWeight:600,color:T.tc,background:"transparent",border:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Reset</button>}
          </div>}
      </div>
    </div>

    {/* Nutrition row */}
    <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:14,padding:"10px 12px",background:T.cream,borderRadius:10}}>
      {[["Cal",shown.cal,""],["Protein",shown.protein,"g"],["Carbs",shown.carbs,"g"],["Sugar",shown.sugar,"g"],["Fiber",shown.fiber,"g"],["Fat",shown.fat,"g"]].map(([l,v,u])=><div key={l}>
        <p style={{fontSize:10,color:T.faint,margin:"0 0 2px",textTransform:"uppercase",letterSpacing:"0.03em"}}>{l}</p>
        <span style={{fontFamily:"monospace",fontSize:15,fontWeight:500}}>{v}{u}</span>
      </div>)}
      <div style={{flexBasis:"100%",fontSize:10,color:T.faint,fontFamily:"monospace"}}>
        {editing?`Whole recipe (${baseServings} serving${baseServings!==1?"s":""})`
          :`${viewServings} serving${Number(viewServings)!==1?"s":""} · per serving: ${rnd(tot.cal/baseServings)} cal`}
      </div>
    </div>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <p style={{fontWeight:700,fontSize:14,margin:0}}>Ingredients</p>
      {editing&&<Btn variant="ghost" icon="+" onClick={()=>setShowPicker(true)}>Add</Btn>}
    </div>
    {ings.length===0?<div style={{padding:"1.5rem 0",textAlign:"center",color:T.faint,fontSize:13}}>No ingredients yet.</div>
    :<div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
      {ings.map((ing,idx)=>{const ri=resolveIng(ing,foodsMap);const n=scaleIng(ri);const u=ing.unit||ri.nutrition.unit||"g";return <div key={idx} style={{display:"flex",alignItems:"flex-start",gap:10,border:"1px solid "+T.line,borderRadius:10,padding:8,background:T.raised}}>
        {ri.image?<img src={ri.image} alt="" style={{width:36,height:36,borderRadius:8,objectFit:"cover",flexShrink:0,marginTop:2}}/>
          :<span style={{fontSize:22,flexShrink:0,marginTop:2}}>{ri.emoji||"🍽"}</span>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
            <p style={{fontWeight:600,fontSize:13,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ri.name}</p>
            {ing.cookMethod&&<span style={{fontSize:10,fontWeight:700,color:T.tc,background:T.tcSoft,padding:"1px 6px",borderRadius:4,whiteSpace:"nowrap"}}>{ing.cookMethod}</span>}
          </div>
          <p style={{fontSize:11,color:T.soft,margin:0,fontFamily:"monospace"}}>{rnd(n.cal)} cal · {rnd(n.protein,1)}g protein</p>
          {editing&&(ri.cookMethods||[]).length>0&&<select value={ing.cookMethod||""} onChange={e=>setIngs(prev=>prev.map((x,i)=>i===idx?{...x,cookMethod:e.target.value}:x))} style={{...IS({padding:"3px 6px",fontSize:11,marginTop:4,width:"auto"}),color:ing.cookMethod?T.tc:T.faint}}>
            <option value="">How cooked…</option>
            {(ri.cookMethods||[]).map(m=><option key={m} value={m}>{m}</option>)}
          </select>}
        </div>
        {editing?<div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
          <div style={{display:"flex",gap:4}}>
            <input type="number" value={ing.amount} onChange={e=>setIngs(prev=>prev.map((x,i)=>i===idx?{...x,amount:Number(e.target.value)||0}:x))} style={IS({width:60,padding:"5px 6px",fontFamily:"monospace"})}/>
            <select value={u} onChange={e=>setIngs(prev=>prev.map((x,i)=>i===idx?{...x,unit:e.target.value,amount:e.target.value==="unit"?1:x.amount}:x))} style={IS({width:"auto",padding:"5px 4px",fontSize:12})}>
              {ri.nutrition?.countGrams&&<option value="unit">ct</option>}
              <option value="g">g</option><option value="ml">ml</option><option value="oz">oz</option>
              <option value="lb">lb</option><option value="tsp">tsp</option><option value="tbsp">tbsp</option>
            </select>
          </div>
          <button onClick={()=>setIngs(prev=>prev.filter((_,i)=>i!==idx))} style={{padding:"3px 8px",borderRadius:7,border:"1px solid "+T.danger+"44",background:"transparent",color:T.danger,cursor:"pointer",fontSize:11,fontFamily:"system-ui,sans-serif",fontWeight:600}}>Remove</button>
        </div>
        :<span style={{fontFamily:"monospace",fontSize:13,fontWeight:500,flexShrink:0}}>{fmtAmt(ing.amount,u,ri.nutrition)}</span>}
      </div>;})}
    </div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,paddingTop:14,borderTop:"1px solid "+T.line,flexWrap:"wrap"}}>
      {!editing?<><DelBtn label="Delete recipe" onConfirm={onDelete}/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {onFork&&<Btn variant="ghost" onClick={onFork}>Use this time</Btn>}
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
          <Btn icon="e" onClick={onEdit}>Edit</Btn>
        </div>
      </>:<>{recipe.name?<DelBtn label="Delete recipe" onConfirm={onDelete}/>:<span/>}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:T.faint}}>{canSave?"Tap outside to save":!name.trim()?"Add a name":"Need 1+ ingredients"}</span>
          <Btn disabled={!canSave||saving} icon="v" onClick={()=>{if(!canSave)return;setSaving(true);onSave(build());setSaving(false);}}>{saving?"Saving...":"Save"}</Btn>
        </div></>}
    </div>
    {showPicker&&<IngPicker foods={foods} cats={cats} catById={catById}
      onPick={f=>{setIngs(prev=>[...prev,{foodId:f.id,name:f.name,image:f.image,emoji:f.emoji||"",nutrition:f.nutrition,amount:f.nutrition.portion||100,unit:f.nutrition.unit||"g"}]);setShowPicker(false);}}
      onClose={()=>setShowPicker(false)}/>}
  </Modal>;
}

function IngPicker({foods,cats,catById,onPick,onClose}){
  const [q,setQ]=useState("");
  const [filter,setFilter]=useState("all");
  const filtered=foods.filter(f=>{
    if(filter!=="all"&&!(f.tags||[]).includes(filter))return false;
    if(q&&!f.name.toLowerCase().includes(q.toLowerCase()))return false;
    return true;
  });
  return <Modal onClose={onClose} width={420} level={2}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{margin:0}}>Add ingredient</h3><CloseBtn onClick={onClose}/>
    </div>
    <input autoFocus placeholder="Search foods" value={q} onChange={e=>setQ(e.target.value)} style={IS({marginBottom:10})}/>
    <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,marginBottom:10}}>
      <Chip active={filter==="all"} onClick={()=>setFilter("all")} label="All"/>
      {cats.map(c=><Chip key={c.id} active={filter===c.id} onClick={()=>setFilter(c.id)} label={c.name} p={catById[c.id].palette}/>)}
    </div>
    <div style={{maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
      {!filtered.length&&<p style={{fontSize:13,color:T.faint,textAlign:"center",padding:"1rem 0"}}>No foods match.</p>}
      {filtered.map(f=><div key={f.id} onClick={()=>onPick(f)} style={{display:"flex",alignItems:"center",gap:10,padding:8,borderRadius:9,cursor:"pointer",border:"1px solid "+T.line}}>
        <span style={{fontSize:20,flexShrink:0}}>{f.emoji||""}</span>
        <div style={{flex:1}}>
          <p style={{fontWeight:600,fontSize:13,margin:0}}>{f.name}</p>
          <p style={{fontSize:11,color:T.soft,margin:0,fontFamily:"monospace"}}>{rnd(f.nutrition.cal)} cal / {f.nutrition.portion}{f.nutrition.unit}</p>
        </div>
      </div>)}
    </div>
  </Modal>;
}

function Chip({active,onClick,label,p}){
  return <button onClick={onClick} style={{flexShrink:0,fontSize:12,fontWeight:600,padding:"5px 11px",borderRadius:20,cursor:"pointer",fontFamily:"system-ui,sans-serif",border:active?"1px solid "+(p?p.hex:T.lineS):"1px solid "+T.line,background:active?(p?p.soft:T.cream):"transparent",color:active?(p?p.deep:T.ink):T.soft}}>{label}</button>;
}

function Plan({plan,recipes,totals,perServing,selDay,setSelDay,onAdd,onRemove,onDup,onUpdateServings,onOpenRecipe}){
  const rById=useMemo(()=>{const m={};recipes.forEach(r=>m[r.id]=r);return m;},[recipes]);
  const items=plan[selDay]||[];
  const dt=useMemo(()=>{
    let cal=0,protein=0,carbs=0,fat=0,fiber=0,sugar=0;
    items.forEach(inst=>{
      const r=rById[inst.recipeId];if(!r)return;
      const ps=perServing(r); const s=Number(inst.servings)||1;
      cal+=ps.cal*s;protein+=ps.protein*s;carbs+=ps.carbs*s;fat+=ps.fat*s;fiber+=ps.fiber*s;sugar+=(ps.sugar||0)*s;
    });
    return{cal:rnd(cal),protein:rnd(protein,1),carbs:rnd(carbs,1),fat:rnd(fat,1),fiber:rnd(fiber,1),sugar:rnd(sugar,1)};
  },[items,rById,perServing]);

  return <div>
    <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
      {DAYS.map(d=>{const cnt=(plan[d]||[]).length;const a=d===selDay;return <button key={d} onClick={()=>setSelDay(d)} style={{flexShrink:0,fontSize:13,fontWeight:600,padding:"8px 13px",borderRadius:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",border:a?"1px solid "+T.sageD:"1px solid "+T.line,background:a?T.sage:"transparent",color:a?T.sageD:T.soft}}>
        {d}{cnt>0&&<span style={{marginLeft:5,fontSize:11,opacity:0.7}}>({cnt})</span>}
      </button>;})}
    </div>
    <div style={{background:T.cream,borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
      {[["Calories",dt.cal,""],["Protein",dt.protein,"g"],["Carbs",dt.carbs,"g"],["Sugar",dt.sugar,"g"],["Fiber",dt.fiber,"g"],["Fat",dt.fat,"g"]].map(([l,v,u])=><div key={l}>
        <p style={{fontSize:10,color:T.faint,margin:"0 0 2px",textTransform:"uppercase",letterSpacing:"0.03em"}}>{l}</p>
        <span style={{fontFamily:"monospace",fontSize:15,fontWeight:500}}>{v}{u}</span>
      </div>)}
      <div style={{flexBasis:"100%",fontSize:10,color:T.faint,fontFamily:"monospace"}}>{selDay} total across {items.length} meal{items.length!==1?"s":""}</div>
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
      <Btn icon="+" disabled={!recipes.length} onClick={()=>onAdd(selDay)}>Add to {selDay}</Btn>
    </div>
    {!recipes.length?<Empty icon="cal" title="No recipes yet" body="Save a recipe first, then plan your week."/>
    :!items.length?<Empty icon="plus" title={"Nothing planned for "+selDay} body="Tap 'Add to...' above."/>
    :<div className="card-grid">
      {items.map(inst=>{const r=rById[inst.recipeId];if(!r)return null;const ps=perServing(r);const s=Number(inst.servings)||1;
        return <PlanCard key={inst.iid} recipe={r} servings={s} perServ={ps}
          onOpen={()=>onOpenRecipe(r)} onRemove={()=>onRemove(selDay,inst.iid)}
          onDup={target=>onDup(selDay,inst.iid,target)}
          onServings={v=>onUpdateServings(selDay,inst.iid,v)}/>;})}</div>}
  </div>;
}

function PlanCard({recipe,servings,perServ,onOpen,onRemove,onDup,onServings}){
  const [showDup,setShowDup]=useState(false);
  const cal=rnd(perServ.cal*servings);
  return <div style={{position:"relative"}}>
    <div onClick={onOpen} style={{background:T.raised,border:"1px solid "+T.line,borderRadius:14,overflow:"hidden",cursor:"pointer"}}>
      <div style={{width:"100%",aspectRatio:"1.3",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {recipe.image?<img src={recipe.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26}}>🍳</span>}
      </div>
      <div style={{padding:"8px 10px"}}>
        <p style={{fontWeight:700,fontSize:13.5,margin:"0 0 3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{recipe.name}</p>
        <p style={{fontSize:11.5,fontFamily:"monospace",color:T.soft,margin:0}}>{cal} cal · {servings} serving{servings!==1?"s":""}</p>
      </div>
    </div>
    {/* Servings stepper */}
    <div style={{display:"flex",alignItems:"center",gap:4,marginTop:6,justifyContent:"center"}} onClick={e=>e.stopPropagation()}>
      <button onClick={()=>onServings(Math.max(0.5,(Number(servings)||1)-0.5))} style={{width:26,height:26,borderRadius:7,border:"1px solid "+T.lineS,background:T.raised,cursor:"pointer",fontSize:14,fontWeight:700,color:T.sageD}}>−</button>
      <input type="number" min="0" step="0.5" value={servings} onChange={e=>onServings(e.target.value)} style={{width:46,padding:"3px 4px",border:"1px solid "+T.lineS,borderRadius:7,fontSize:13,fontFamily:"monospace",textAlign:"center",background:T.raised,color:T.ink}}/>
      <button onClick={()=>onServings((Number(servings)||1)+0.5)} style={{width:26,height:26,borderRadius:7,border:"1px solid "+T.lineS,background:T.raised,cursor:"pointer",fontSize:14,fontWeight:700,color:T.sageD}}>+</button>
    </div>
    <div style={{display:"flex",gap:4,marginTop:6,justifyContent:"flex-end",position:"relative"}}>
      <button onClick={()=>setShowDup(s=>!s)} style={{width:30,height:30,borderRadius:8,border:"1px solid "+T.line,background:T.raised,cursor:"pointer",fontSize:11,fontFamily:"system-ui,sans-serif"}}>copy</button>
      <DelBtn onConfirm={onRemove} icon/>
      {showDup&&<div style={{position:"absolute",top:36,right:0,background:T.raised,border:"1px solid "+T.lineS,borderRadius:9,padding:6,zIndex:5,display:"flex",flexDirection:"column",gap:2,minWidth:90}}>
        {DAYS.map(d=><button key={d} onClick={()=>{onDup(d);setShowDup(false);}} style={{fontSize:12,padding:"4px 8px",textAlign:"left",border:"none",background:"transparent",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>{d}</button>)}
      </div>}
    </div>
  </div>;
}

function DayPickerModal({day,recipes,onPick,onClose}){
  const [q,setQ]=useState("");
  const [chosen,setChosen]=useState(null); // selected recipe pending servings
  const [servings,setServings]=useState(1);
  const filtered=recipes.filter(r=>r.name.toLowerCase().includes(q.toLowerCase()));

  if(chosen){
    return <Modal onClose={onClose} width={400}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0}}>How many servings?</h3><CloseBtn onClick={onClose}/>
      </div>
      <div style={{background:T.cream,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
        <p style={{fontWeight:700,fontSize:14,margin:"0 0 4px"}}>{chosen.name}</p>
        <p style={{fontSize:11,color:T.soft,margin:0,fontFamily:"monospace"}}>Recipe makes {chosen.servings||1} serving{(chosen.servings||1)!==1?"s":""}</p>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:16}}>
        <button onClick={()=>setServings(s=>Math.max(0.5,(Number(s)||1)-0.5))} style={{width:36,height:36,borderRadius:9,border:"1px solid "+T.lineS,background:T.raised,cursor:"pointer",fontSize:18,fontWeight:700,color:T.sageD}}>−</button>
        <input type="number" min="0" step="0.5" value={servings} onChange={e=>setServings(e.target.value)} style={Object.assign({},IS({width:80,padding:"8px",fontSize:18,fontFamily:"monospace",textAlign:"center"}))}/>
        <button onClick={()=>setServings(s=>(Number(s)||1)+0.5)} style={{width:36,height:36,borderRadius:9,border:"1px solid "+T.lineS,background:T.raised,cursor:"pointer",fontSize:18,fontWeight:700,color:T.sageD}}>+</button>
      </div>
      <p style={{fontSize:11,color:T.faint,textAlign:"center",margin:"0 0 14px"}}>You can use halves like 0.5 or 1.5</p>
      <div style={{display:"flex",gap:8}}>
        <Btn variant="ghost" full onClick={()=>setChosen(null)}>Back</Btn>
        <Btn full onClick={()=>onPick(chosen.id,Number(servings)||1)}>Add {servings} to {day}</Btn>
      </div>
    </Modal>;
  }

  return <Modal onClose={onClose} width={400}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{margin:0}}>Add to {day}</h3><CloseBtn onClick={onClose}/>
    </div>
    <input autoFocus placeholder="Search recipes" value={q} onChange={e=>setQ(e.target.value)} style={IS({marginBottom:10})}/>
    <div style={{maxHeight:360,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
      {!filtered.length&&<p style={{fontSize:13,color:T.faint,textAlign:"center",padding:"1rem 0"}}>No recipes match.</p>}
      {filtered.map(r=><div key={r.id} onClick={()=>{setChosen(r);setServings(r.servings||1);}} style={{display:"flex",alignItems:"center",gap:10,padding:10,borderRadius:9,cursor:"pointer",border:"1px solid "+T.line}}>
        <span style={{fontSize:18}}>🍳</span>
        <div style={{flex:1}}>
          <p style={{fontWeight:600,fontSize:13,margin:0}}>{r.name}</p>
          <p style={{fontSize:11,color:T.soft,margin:0,fontFamily:"monospace"}}>makes {r.servings||1} serving{(r.servings||1)!==1?"s":""}</p>
        </div>
      </div>)}
    </div>
  </Modal>;
}

function AddToRecipeModal({recipes,newFoods,onClose,onAdd,onNewRecipe}){
  const newIngs=newFoods.map(f=>({foodId:f.id,name:f.name,image:f.image,emoji:f.emoji||"",nutrition:f.nutrition,amount:f._amt!=null?f._amt:(f.nutrition.portion||100),unit:f._unit||f.nutrition.unit||"g"}));
  return <Modal onClose={onClose} width={420}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <h3 style={{margin:0}}>Add {newFoods.length} food{newFoods.length>1?"s":""} to...</h3>
      <CloseBtn onClick={onClose}/>
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16,padding:10,background:T.cream,borderRadius:10}}>
      {newFoods.map(f=><span key={f.id} style={{fontSize:12,fontWeight:600,background:T.raised,padding:"3px 8px",borderRadius:8,border:"1px solid "+T.line}}>
        {f.emoji||""} {f.name} {f._amt?f._amt+(f._unit||"g"):""}
      </span>)}
    </div>
    <button onClick={()=>onNewRecipe(newIngs)} style={{width:"100%",padding:"12px 16px",borderRadius:10,background:T.sageD,color:"#FBF7EE",border:"none",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:12,fontFamily:"system-ui,sans-serif"}}>Start a new recipe with these</button>
    {recipes.length>0&&<>
      <p style={{fontSize:12,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:"0.04em",margin:"0 0 8px"}}>Or add to existing recipe</p>
      <div style={{maxHeight:280,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
        {recipes.map(r=><div key={r.id} onClick={()=>onAdd(r,newIngs)} style={{display:"flex",alignItems:"center",gap:10,padding:10,borderRadius:9,cursor:"pointer",border:"1px solid "+T.line,background:T.raised}}>
          <div><p style={{fontWeight:600,fontSize:13,margin:0}}>{r.name}</p><p style={{fontSize:11,color:T.soft,margin:0}}>{r.ingredients.length} ingredients</p></div>
        </div>)}
      </div>
    </>}
  </Modal>;
}

/* ═══════════════════════════════════════════════════════
   WORKOUT SECTION
   ═══════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════
   WORKOUT SECTION — with selection, calories, calculator
   ═══════════════════════════════════════════════════════ */

function WorkoutExercises({exercises,cats,catById,onOpen,onAdd,onManageCats,onMakeRoutine}){
  const [q,setQ]=useState("");
  const [activeCat,setActiveCat]=useState("all");
  const [activeSubcat,setActiveSubcat]=useState(null);
  const [selections,setSelections]=useState({});
  const [contextCard,setContextCard]=useState(null);
  const [quickPick,setQuickPick]=useState(null);
  const [trayExpanded,setTrayExpanded]=useState(false);
  const longPressTimer=useRef(null);

  useEffect(()=>{setActiveSubcat(null);},[activeCat]);
  const selectedIds=useMemo(()=>new Set(Object.keys(selections)),[selections]);
  const selectedList=useMemo(()=>Object.values(selections),[selections]);
  const subcats=activeCat!=="all"?(W_SUBCATS[activeCat]||[]):[];

  const visible=useMemo(()=>{
    const ql=q.trim().toLowerCase();
    let arr=exercises.filter(f=>{
      const nl=f.name.toLowerCase();const ftags=new Set(f.tags||[]);
      if(activeCat!=="all"&&!ftags.has(activeCat))return false;
      if(activeSubcat&&!ftags.has(activeSubcat.id))return false;
      if(ql&&!nl.includes(ql))return false;
      return true;
    });
    if(ql){const rank=name=>{const nl=name.toLowerCase();if(nl===ql)return 0;if(nl.startsWith(ql))return 1;return 2;};
      arr.sort((a,b)=>{const d=rank(a.name)-rank(b.name);return d||a.name.localeCompare(b.name);});
    }else arr.sort((a,b)=>a.name.localeCompare(b.name));
    return arr;
  },[exercises,q,activeCat,activeSubcat]);

  function openContext(id,e){e.stopPropagation();setContextCard(prev=>prev===id?null:id);setQuickPick(null);}
  function closePopups(){setContextCard(null);setQuickPick(null);}
  function openQuickPick(id){setQuickPick(id);setContextCard(null);}
  function handleSelect(ex,data){setSelections(prev=>({...prev,[ex.id]:{ex,...data}}));setQuickPick(null);setContextCard(null);}
  function deselect(id){setSelections(prev=>{const n={...prev};delete n[id];return n;});}
  function updateSel(id,data){setSelections(prev=>prev[id]?{...prev,[id]:{...prev[id],...data}}:prev);}
  function clearAll(){setSelections({});setTrayExpanded(false);}
  function startLP(ex){longPressTimer.current=setTimeout(()=>openQuickPick(ex.id),500);}
  function cancelLP(){if(longPressTimer.current)clearTimeout(longPressTimer.current);}

  const hasTray=selectedList.length>0;
  const anyPopup=contextCard!==null||quickPick!==null;
  const selectedTags=useMemo(()=>[...new Set(selectedList.flatMap(s=>s.ex.tags||[]))],[selectedList]);

  return <div>
    {anyPopup&&<div onClick={closePopups} style={{position:"fixed",inset:0,zIndex:15,background:"transparent"}}/>}
    {hasTray&&<BodyMap selectedTags={selectedTags}/>}
    <input placeholder="Search exercises..." value={q} onChange={e=>setQ(e.target.value)} style={IS({marginBottom:10})}/>
    <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{flex:1}}/>
      <button onClick={onManageCats} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 14px",border:"1px solid "+T.lineS,borderRadius:9,fontSize:13,fontWeight:600,background:T.raised,color:T.ink,cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Edit categories</button>
      <Btn icon="+" onClick={onAdd}>Add exercise</Btn>
    </div>
    <div className="cat-strip" style={{marginBottom:subcats.length?8:14}}>
      <CatTab active={activeCat==="all"} onClick={()=>setActiveCat("all")} label="All" count={exercises.length}/>
      {cats.map(c=>{const count=exercises.filter(f=>(f.tags||[]).includes(c.id)).length;if(count===0)return null;return <CatTab key={c.id} active={activeCat===c.id} onClick={()=>setActiveCat(c.id)} label={c.name} count={count} p={catById[c.id].palette}/>;})}
    </div>
    {subcats.length>0&&<div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:6,marginBottom:14,paddingLeft:10,WebkitOverflowScrolling:"touch",borderLeft:"3px solid "+(catById[activeCat]?catById[activeCat].palette.hex:T.lineS)}}>
      <button onClick={()=>setActiveSubcat(null)} style={{flexShrink:0,fontSize:12,fontWeight:600,padding:"5px 10px",borderRadius:16,border:"1px solid "+T.lineS,background:!activeSubcat?T.ink:"transparent",color:!activeSubcat?"#FBF7EE":T.soft,cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>All</button>
      {subcats.map(sc=>{const active=activeSubcat&&activeSubcat.id===sc.id;const p=catById[activeCat]?catById[activeCat].palette:null;return <button key={sc.id} onClick={()=>setActiveSubcat(active?null:sc)} style={{flexShrink:0,fontSize:12,fontWeight:600,padding:"5px 11px",borderRadius:16,cursor:"pointer",fontFamily:"system-ui,sans-serif",border:active?"1.5px solid "+(p?p.hex:T.lineS):"1px solid "+T.line,background:active?(p?p.soft:T.cream):"transparent",color:active?(p?p.deep:T.ink):T.soft,display:"inline-flex",alignItems:"center",gap:5}}><span>{sc.emoji}</span>{sc.label}</button>;})}
    </div>}
    {exercises.length===0?<Empty icon="ex" title="No exercises yet" body="Tap 'Add exercise' to start."/>
    :visible.length===0?<Empty icon="search" title="No matches" body="Try a different search or category."/>
    :<div className="card-grid">
      {visible.map(ex=><ExCard key={ex.id} ex={ex} catById={catById}
        selected={selectedIds.has(ex.id)} contextOpen={contextCard===ex.id} quickPickOpen={quickPick===ex.id}
        onView={()=>{closePopups();onOpen(ex);}} onContextToggle={e=>openContext(ex.id,e)}
        onQuickPick={()=>openQuickPick(ex.id)} onCloseQuickPick={closePopups}
        onSelect={data=>handleSelect(ex,data)} onDeselect={()=>deselect(ex.id)}
        onLPStart={()=>startLP(ex)} onLPEnd={cancelLP}/>)}
    </div>}
    {hasTray&&<div style={{height:trayExpanded?"55vh":80}}/>}
    {hasTray&&<WSelectionTray selections={selectedList} expanded={trayExpanded}
      onToggleExpand={()=>setTrayExpanded(s=>!s)} onUpdate={updateSel} onDeselect={deselect} onClear={clearAll}
      onMakeRoutine={()=>onMakeRoutine(selectedList)}/>}
  </div>;
}

function ExCard({ex,catById,selected,contextOpen,quickPickOpen,onView,onContextToggle,onQuickPick,onCloseQuickPick,onSelect,onDeselect,onLPStart,onLPEnd}){
  const tags=ex.tags||[];const p=tags.length>0&&catById[tags[0]]?catById[tags[0]].palette:null;
  const isCardio=ex.type==="cardio";
  const defCal=isCardio?estCalCardio(ex.met||5,30):estCalStrength(ex.met||5,10,3);

  const Popup=()=>(
    <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.raised,border:"1.5px solid "+T.lineS,borderRadius:14,padding:"8px 6px",zIndex:20,display:"flex",flexDirection:"column",gap:4,minWidth:150,boxShadow:"0 8px 28px rgba(0,0,0,0.22)"}}>
      <button onClick={e=>{e.stopPropagation();onView();}} style={{padding:"9px 14px",border:"none",background:T.cream,textAlign:"center",fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:9,fontFamily:"system-ui,sans-serif",color:T.ink}}>View details</button>
      {selected
        ?<button onClick={e=>{e.stopPropagation();onCloseQuickPick();onDeselect();}} style={{padding:"9px 14px",border:"none",background:T.danger+"18",color:T.danger,textAlign:"center",fontSize:13,fontWeight:700,cursor:"pointer",borderRadius:9,fontFamily:"system-ui,sans-serif"}}>Deselect</button>
        :<button onClick={e=>{e.stopPropagation();onQuickPick();}} style={{padding:"9px 14px",border:"none",background:T.sageD,color:"#FBF7EE",textAlign:"center",fontSize:13,fontWeight:700,cursor:"pointer",borderRadius:9,fontFamily:"system-ui,sans-serif"}}>+ Select</button>}
    </div>);

  return <div onClick={onContextToggle} onMouseDown={onLPStart} onMouseUp={onLPEnd} onMouseLeave={onLPEnd} onTouchStart={onLPStart} onTouchEnd={onLPEnd}
    style={{background:T.raised,border:selected?"2px solid "+T.sageD:"1px solid "+T.line,borderRadius:14,overflow:"visible",cursor:"pointer",position:"relative",zIndex:(contextOpen||quickPickOpen)?16:"auto",display:"flex",flexDirection:"column"}}>
    <div style={{aspectRatio:"1",background:p?p.soft:T.cream,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"14px 14px 0 0",overflow:"hidden",flexShrink:0}}>
      {ex.image?<img src={ex.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:36}}>{ex.emoji||"🏋️"}</span>}
    </div>
    {selected&&<div style={{position:"absolute",top:4,right:4,fontSize:13,fontWeight:800,color:T.sageD,zIndex:2}}>&#10003;</div>}
    <div style={{padding:"6px 8px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <p style={{fontWeight:700,fontSize:12,margin:"0 0 3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ex.name}</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:4}}>
        <div style={{display:"flex",gap:2,overflow:"hidden",flexShrink:1,minWidth:0}}>
          {tags.slice(0,1).map(tid=>{const c=catById[tid];if(!c)return null;return <span key={tid} style={{fontSize:8,fontWeight:700,padding:"1px 4px",borderRadius:3,background:c.palette.soft,color:c.palette.deep,textTransform:"uppercase",whiteSpace:"nowrap"}}>{c.name}</span>;})}
        </div>
        <span style={{fontSize:10,fontFamily:"monospace",color:T.soft,whiteSpace:"nowrap",flexShrink:0}}>~{defCal} cal</span>
      </div>
    </div>
    <div style={{height:3,background:p?p.hex:T.lineS,borderRadius:"0 0 14px 14px",flexShrink:0}}/>
    {contextOpen&&!quickPickOpen&&<Popup/>}
    {quickPickOpen&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"100%",left:0,right:0,zIndex:25,marginTop:4}}>
      <ExQuickPick ex={ex} onSelect={onSelect} onClose={onCloseQuickPick}/>
    </div>}
  </div>;
}

/* Quick-pick for workout: weight/reps for strength, duration for cardio */
function ExQuickPick({ex,onSelect,onClose}){
  const isCardio=ex.type==="cardio";
  const [weight,setWeight]=useState("135");
  const [reps,setReps]=useState("10");
  const [sets,setSets]=useState("3");
  const [duration,setDuration]=useState("30");
  const [wUnit,setWUnit]=useState("lb");

  const wKg=wUnit==="lb"?(Number(weight)||0)/2.205:(Number(weight)||0);
  const cal=isCardio?estCalCardio(ex.met||5,Number(duration)||0):estCalStrength(ex.met||5,Number(reps)||0,Number(sets)||0);

  return <div style={{background:T.raised,border:"1.5px solid "+T.sageD,borderRadius:14,padding:"12px 14px",width:260,boxShadow:"0 8px 24px rgba(0,0,0,0.18)"}}>
    <p style={{fontWeight:700,fontSize:13,margin:"0 0 8px",color:T.ink}}>{ex.emoji} {ex.name}</p>
    {isCardio
      ?<div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
        <input type="number" value={duration} onChange={e=>setDuration(e.target.value)} style={IS({width:70,padding:"5px 8px",fontSize:14,fontFamily:"monospace"})} autoFocus/>
        <span style={{fontSize:12,color:T.soft,fontWeight:600}}>minutes</span>
      </div>
      :<>
        <div style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
          <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} style={IS({width:70,padding:"5px 8px",fontSize:14,fontFamily:"monospace"})} autoFocus/>
          <select value={wUnit} onChange={e=>setWUnit(e.target.value)} style={IS({padding:"5px 6px",fontSize:13,width:"auto"})}>
            <option value="lb">lb</option><option value="kg">kg</option>
          </select>
          <span style={{fontSize:11,color:T.faint}}>weight</span>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
          <input type="number" value={reps} onChange={e=>setReps(e.target.value)} style={IS({width:55,padding:"5px 8px",fontSize:14,fontFamily:"monospace"})}/>
          <span style={{fontSize:11,color:T.faint}}>reps</span>
          <span style={{color:T.lineS}}>x</span>
          <input type="number" value={sets} onChange={e=>setSets(e.target.value)} style={IS({width:55,padding:"5px 8px",fontSize:14,fontFamily:"monospace"})}/>
          <span style={{fontSize:11,color:T.faint}}>sets</span>
        </div>
      </>}
    <div style={{background:T.cream,borderRadius:8,padding:"7px 10px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:12,fontWeight:600,color:T.soft}}>Est. calories</span>
      <span style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:T.tc}}>{cal} cal</span>
    </div>
    <div style={{display:"flex",gap:6}}>
      <button onClick={onClose} style={{flex:1,padding:"7px",border:"1px solid "+T.lineS,borderRadius:8,background:"transparent",cursor:"pointer",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cancel</button>
      <button onClick={()=>onSelect(isCardio?{duration:Number(duration)||30,cal}:{weight:Number(weight)||0,wUnit,reps:Number(reps)||10,sets:Number(sets)||3,cal})}
        style={{flex:2,padding:"7px",border:"none",borderRadius:8,background:T.sageD,color:"#FBF7EE",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"system-ui,sans-serif"}}>+ Select</button>
    </div>
  </div>;
}

function WSelectionTray({selections,expanded,onToggleExpand,onUpdate,onDeselect,onClear,onMakeRoutine}){
  const totalCal=selections.reduce((s,sel)=>s+(sel.cal||0),0);
  return <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:25,fontFamily:"system-ui,sans-serif"}}>
    <div style={{background:T.sageD,color:"#FBF7EE",padding:"0 16px",boxShadow:"0 -4px 20px rgba(0,0,0,0.2)"}}>
      <div onClick={onToggleExpand} style={{textAlign:"center",padding:"8px 0 4px",cursor:"pointer"}}>
        <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.4)",display:"inline-block"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:10,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,opacity:0.75,marginBottom:2}}>{selections.length} exercise{selections.length!==1?"s":""} | ~{totalCal} cal total</div>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
            {selections.map(sel=><span key={sel.ex.id} style={{flexShrink:0,fontSize:11,fontWeight:600,background:"rgba(255,255,255,0.18)",borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>{sel.ex.emoji} {sel.ex.name}</span>)}
          </div>
        </div>
        <button onClick={onMakeRoutine} style={{padding:"7px 14px",borderRadius:9,background:"#FBF7EE",color:T.sageD,fontWeight:700,fontSize:12,border:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif",flexShrink:0}}>Make routine</button>
      </div>
    </div>
    {expanded&&<div style={{position:"fixed",bottom:0,left:0,right:0,height:"55vh",background:T.bg,borderTop:"2px solid "+T.sageD,overflowY:"auto",zIndex:24,boxShadow:"0 -8px 32px rgba(0,0,0,0.2)"}}>
      <div style={{padding:"12px 16px 120px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{margin:0,fontSize:16}}>Selected exercises</h3>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClear} style={{fontSize:12,padding:"4px 10px",border:"1px solid "+T.danger,borderRadius:8,color:T.danger,background:"transparent",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Clear all</button>
            <button onClick={onToggleExpand} style={{fontSize:12,padding:"4px 10px",border:"1px solid "+T.lineS,borderRadius:8,background:T.raised,cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Collapse</button>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {selections.map(sel=>{const isC=sel.ex.type==="cardio";return <div key={sel.ex.id} style={{background:T.raised,border:"1px solid "+T.line,borderRadius:12,padding:10,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:28,flexShrink:0}}>{sel.ex.emoji}</span>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:700,fontSize:13,margin:"0 0 4px"}}>{sel.ex.name}</p>
              <span style={{fontSize:11,fontFamily:"monospace",color:T.soft}}>{isC?sel.duration+"min":sel.weight+(sel.wUnit||"lb")+" x "+sel.reps+" x "+sel.sets} | ~{sel.cal} cal</span>
            </div>
            <button onClick={()=>onDeselect(sel.ex.id)} style={{width:28,height:28,borderRadius:"50%",border:"1px solid "+T.danger+"44",background:"transparent",color:T.danger,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>x</button>
          </div>;})}
        </div>
      </div>
    </div>}
  </div>;
}

function ExerciseModal({exercise,mode,cats,catById,onAddCat,onClose,onEdit,onSave,onSaveClose,onDelete}){
  const editing=mode==="edit";
  const lastId=useRef(null);
  const [name,setName]=useState(exercise.name);
  const [emoji,setEmoji]=useState(exercise.emoji||"🏋️");
  const [tags,setTags]=useState(exercise.tags||[]);
  const [image,setImage]=useState(exercise.image);
  const [type,setType]=useState(exercise.type||"strength");
  const [met,setMet]=useState(exercise.met||5);
  const [saving,setSaving]=useState(false);
  const [showNewCat,setShowNewCat]=useState(false);
  const [newCatName,setNewCatName]=useState("");
  // Calculator
  const [calcWeight,setCalcWeight]=useState("135");
  const [calcReps,setCalcReps]=useState("10");
  const [calcSets,setCalcSets]=useState("3");
  const [calcDur,setCalcDur]=useState("30");
  const [calcWUnit,setCalcWUnit]=useState("lb");

  useEffect(()=>{if(lastId.current!==exercise.id){lastId.current=exercise.id;setName(exercise.name);setEmoji(exercise.emoji||"🏋️");setTags(exercise.tags||[]);setImage(exercise.image);setType(exercise.type||"strength");setMet(exercise.met||5);}},[exercise.id]);
  function togTag(id){setTags(prev=>prev.includes(id)?prev.filter(t=>t!==id):[...prev,id]);}
  function build(){return{id:exercise.id,name:name.trim(),emoji,tags,image,type,met:Number(met)||5};}
  const hasName=!!name.trim();
  const isCardio=type==="cardio";
  const calcCal=isCardio?estCalCardio(met,Number(calcDur)||0):estCalStrength(met,Number(calcReps)||0,Number(calcSets)||0);

  return <Modal onClose={()=>editing&&hasName?onSaveClose(build()):onClose()} width={520}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <span style={{fontSize:11,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:"0.04em"}}>{!exercise.name&&editing?"New exercise":editing?"Editing":"Exercise"}</span>
      <CloseBtn label={editing&&hasName?"Done":"Close"} saved={editing&&hasName} onClick={()=>editing&&hasName?onSaveClose(build()):onClose()}/>
    </div>
    <div style={{display:"flex",gap:16,marginBottom:16}}>
      <div style={{flexShrink:0}}>
        <ImageSlot value={image} onChange={setImage} size={120} editing={editing} emoji={emoji}/>
        {editing&&<div style={{display:"flex",gap:6,alignItems:"center",marginTop:6,justifyContent:"center"}}>
          <span style={{fontSize:11,fontWeight:600,color:T.soft}}>Emoji</span>
          <input value={emoji} onChange={e=>setEmoji(e.target.value||"🏋️")} maxLength={4} style={{width:50,fontSize:22,textAlign:"center",border:"1px solid "+T.lineS,borderRadius:8,padding:"3px 4px",background:T.raised}}/>
        </div>}
      </div>
      <div style={{flex:1}}>
        {editing?<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Exercise name" style={IS({fontSize:17,fontWeight:700,padding:"8px 10px",marginBottom:8})}/>
        :<h2 style={{margin:"0 0 8px"}}>{exercise.name}</h2>}
        {editing&&<div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
          <Label>Type</Label>
          <select value={type} onChange={e=>setType(e.target.value)} style={IS({width:"auto",padding:"5px 8px",fontSize:13})}>
            <option value="strength">Strength</option><option value="cardio">Cardio</option>
          </select>
          <Label>MET</Label>
          <input type="number" value={met} onChange={e=>setMet(e.target.value)} style={IS({width:60,padding:"5px 8px",fontSize:13,fontFamily:"monospace"})}/>
        </div>}
        <Label>Tags</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {cats.map(c=>{const pp=catById[c.id].palette;const on=tags.includes(c.id);if(!editing&&!on)return null;
            return <button key={c.id} onClick={()=>editing&&togTag(c.id)} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",fontSize:12,fontWeight:600,cursor:editing?"pointer":"default",border:on?"1.5px solid "+pp.hex:"1px solid "+T.line,background:on?pp.soft:"transparent",color:on?pp.deep:T.soft,borderRadius:14,fontFamily:"system-ui,sans-serif"}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:on?pp.hex:T.lineS,display:"inline-block"}}/>{c.name}
            </button>;})}
          {editing&&!showNewCat&&<button onClick={()=>setShowNewCat(true)} style={{fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:14,border:"1px dashed "+T.lineS,background:"transparent",color:T.soft,cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>+ New</button>}
        </div>
        {showNewCat&&<div style={{display:"flex",gap:8,marginTop:8}}>
          <input autoFocus placeholder="Category" value={newCatName} onChange={e=>setNewCatName(e.target.value)} style={IS({flex:1})}/>
          <Btn onClick={()=>{if(!newCatName.trim())return;const id=onAddCat(newCatName.trim());setTags(p=>[...p,id]);setNewCatName("");setShowNewCat(false);}}>Add</Btn>
          <Btn variant="ghost" onClick={()=>{setShowNewCat(false);setNewCatName("");}}>Cancel</Btn>
        </div>}
      </div>
    </div>
    {/* Calorie calculator */}
    {!editing&&<div style={{border:"2px solid "+T.ink,borderRadius:10,padding:"12px 14px",background:T.raised,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:"4px solid "+T.ink,paddingBottom:6,marginBottom:10}}>
        <span style={{fontSize:16,fontWeight:900}}>Calorie estimate</span>
        <span style={{fontSize:11,color:T.soft,fontFamily:"monospace"}}>MET: {exercise.met||5} | {isCardio?"Cardio":"Strength"}</span>
      </div>
      {isCardio
        ?<div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:600,color:T.soft}}>Duration</span>
          <input type="number" value={calcDur} onChange={e=>setCalcDur(e.target.value)} style={IS({width:70,padding:"5px 8px",fontFamily:"monospace",fontSize:14})}/>
          <span style={{fontSize:12,color:T.soft}}>minutes</span>
        </div>
        :<div style={{display:"flex",gap:6,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
          <input type="number" value={calcWeight} onChange={e=>setCalcWeight(e.target.value)} style={IS({width:70,padding:"5px 8px",fontFamily:"monospace",fontSize:14})}/>
          <select value={calcWUnit} onChange={e=>setCalcWUnit(e.target.value)} style={IS({padding:"5px 6px",fontSize:13,width:"auto"})}>
            <option value="lb">lb</option><option value="kg">kg</option>
          </select>
          <span style={{color:T.lineS}}>x</span>
          <input type="number" value={calcReps} onChange={e=>setCalcReps(e.target.value)} style={IS({width:55,padding:"5px 8px",fontFamily:"monospace",fontSize:14})}/>
          <span style={{fontSize:11,color:T.faint}}>reps</span>
          <span style={{color:T.lineS}}>x</span>
          <input type="number" value={calcSets} onChange={e=>setCalcSets(e.target.value)} style={IS({width:55,padding:"5px 8px",fontFamily:"monospace",fontSize:14})}/>
          <span style={{fontSize:11,color:T.faint}}>sets</span>
        </div>}
      <div style={{background:T.tcSoft,borderRadius:8,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:14,fontWeight:600,color:T.tc}}>Estimated burn</span>
        <span style={{fontFamily:"monospace",fontSize:22,fontWeight:700,color:T.tc}}>{calcCal} cal</span>
      </div>
      <p style={{fontSize:10,color:T.faint,margin:"6px 0 0",fontFamily:"monospace"}}>Based on ~{DEFAULT_BODY_WT}kg body weight. Actual burn varies.</p>
    </div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,paddingTop:14,borderTop:"1px solid "+T.line}}>
      {!editing?<><DelBtn label="Delete exercise" onConfirm={onDelete}/>
        <div style={{display:"flex",gap:8}}><Btn variant="ghost" onClick={onClose}>Close</Btn><Btn icon="e" onClick={onEdit}>Edit</Btn></div>
      </>:<>{exercise.name?<DelBtn label="Delete" onConfirm={onDelete}/>:<span/>}
        <Btn disabled={!hasName||saving} icon="v" onClick={()=>{if(!hasName)return;setSaving(true);onSave(build());setSaving(false);}}>{saving?"Saving...":"Save"}</Btn>
      </>}
    </div>
  </Modal>;
}

function WRoutines({routines,onNew,onOpen,onDelete,onDup}){
  return <div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}><Btn icon="+" onClick={onNew}>New routine</Btn></div>
    {routines.length===0?<Empty icon="dumbbell" title="No routines yet" body="Group exercises into named routines."/>
    :<div className="card-grid">
      {routines.map(r=>{const totalSets=r.exercises.reduce((s,ex)=>s+(ex.sets||[]).length,0);return <div key={r.id}>
        <div onClick={()=>onOpen(r)} style={{background:T.raised,border:"1px solid "+T.line,borderRadius:14,overflow:"hidden",cursor:"pointer"}}>
          <div style={{width:"100%",aspectRatio:"1.15",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:30}}>🏋️</span></div>
          <div style={{padding:"8px 10px"}}><p style={{fontWeight:700,fontSize:13.5,margin:"0 0 3px"}}>{r.name}</p>
            <p style={{fontSize:11.5,fontFamily:"monospace",color:T.soft,margin:0}}>{r.exercises.length} exercises | {totalSets} sets</p></div>
        </div>
        <div style={{display:"flex",gap:4,marginTop:6,justifyContent:"flex-end"}}>
          <button onClick={()=>onDup(r.id)} style={{width:30,height:30,borderRadius:8,border:"1px solid "+T.line,background:T.raised,cursor:"pointer",fontSize:12}}>copy</button>
          <DelBtn onConfirm={()=>onDelete(r.id)} icon/>
        </div>
      </div>;})}
    </div>}
  </div>;
}

function RoutineModal({routine,mode,exercises,cats,catById,onClose,onEdit,onSave,onSaveClose,onDelete}){
  const editing=mode==="edit";
  const [name,setName]=useState(routine.name);
  const [exs,setExs]=useState(routine.exercises||[]);
  const [showPicker,setShowPicker]=useState(false);
  const [saving,setSaving]=useState(false);
  const [weightUnit,setWeightUnit]=useState(routine.weightUnit||"lb");

  useEffect(()=>{setName(routine.name);setExs(routine.exercises||[]);setWeightUnit(routine.weightUnit||"lb");},[routine.id,mode]);
  const canSave=!!name.trim()&&exs.length>0;
  function build(){return{id:routine.id,name:name.trim(),exercises:exs,weightUnit};}
  function addSet(i){setExs(prev=>prev.map((ex,j)=>j===i?{...ex,sets:[...(ex.sets||[]),{weight:ex.sets&&ex.sets.length>0?ex.sets[ex.sets.length-1].weight:0,reps:10}]}:ex));}
  function removeSet(i,si){setExs(prev=>prev.map((ex,j)=>j===i?{...ex,sets:(ex.sets||[]).filter((_,k)=>k!==si)}:ex));}
  function updateSet(i,si,f,v){setExs(prev=>prev.map((ex,j)=>j===i?{...ex,sets:(ex.sets||[]).map((s,k)=>k===si?{...s,[f]:Number(v)||0}:s)}:ex));}
  function removeEx(i){setExs(prev=>prev.filter((_,j)=>j!==i));}
  const otherUnit=weightUnit==="lb"?"kg":"lb";
  // Total estimated calories for the routine
  const totalCal=exs.reduce((sum,ex)=>{
    const orig=exercises.find(e=>e.id===ex.exerciseId);
    const m=orig?orig.met:5;const isC=orig&&orig.type==="cardio";
    if(isC)return sum+estCalCardio(m,ex.duration||30);
    const sets=(ex.sets||[]);
    return sum+sets.reduce((ss,set)=>ss+estCalStrength(m,set.reps||0,1),0);
  },0);

  return <Modal onClose={()=>canSave&&editing?onSaveClose(build()):onClose()} width={600}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <span style={{fontSize:11,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:"0.04em"}}>{!routine.name&&editing?"New routine":editing?"Editing":"Routine"}</span>
      <CloseBtn label={editing&&canSave?"Done":"Close"} saved={editing&&canSave} onClick={()=>canSave&&editing?onSaveClose(build()):onClose()}/>
    </div>
    <div style={{display:"flex",gap:14,marginBottom:14,alignItems:"center"}}>
      <span style={{fontSize:36}}>🏋️</span>
      <div style={{flex:1}}>
        {editing?<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Routine name" style={IS({fontSize:17,fontWeight:700,padding:"8px 10px",marginBottom:6})}/>
        :<h2 style={{margin:"0 0 4px"}}>{routine.name}</h2>}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:12,color:T.soft}}>{exs.length} exercises | ~{totalCal} cal</span>
          <button onClick={()=>setWeightUnit(u=>u==="lb"?"kg":"lb")} style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6,border:"1px solid "+T.lineS,background:T.cream,cursor:"pointer",fontFamily:"system-ui,sans-serif",color:T.ink}}>{weightUnit.toUpperCase()} / {otherUnit}</button>
        </div>
      </div>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <p style={{fontWeight:700,fontSize:14,margin:0}}>Exercises</p>
      {editing&&<Btn variant="ghost" icon="+" onClick={()=>setShowPicker(true)}>Add</Btn>}
    </div>
    {exs.length===0?<div style={{padding:"1.5rem 0",textAlign:"center",color:T.faint,fontSize:13}}>No exercises yet.</div>
    :<div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:14}}>
      {exs.map((ex,i)=>{const orig=exercises.find(e=>e.id===ex.exerciseId);const isC=orig&&orig.type==="cardio";return <div key={i} style={{border:"1px solid "+T.line,borderRadius:12,padding:10,background:T.raised}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <span style={{fontSize:22}}>{ex.emoji||"🏋️"}</span>
          <p style={{fontWeight:700,fontSize:14,margin:0,flex:1}}>{ex.name}</p>
          {editing&&<button onClick={()=>removeEx(i)} style={{width:26,height:26,borderRadius:7,border:"1px solid "+T.danger+"44",background:"transparent",color:T.danger,cursor:"pointer",fontSize:12}}>x</button>}
        </div>
        {isC?<div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,color:T.soft}}>Duration:</span>
          {editing?<input type="number" value={ex.duration||30} onChange={e=>setExs(prev=>prev.map((x,j)=>j===i?{...x,duration:Number(e.target.value)||0}:x))} style={IS({width:60,padding:"4px 6px",fontFamily:"monospace"})}/>
          :<span style={{fontFamily:"monospace",fontSize:13}}>{ex.duration||30}</span>}
          <span style={{fontSize:12,color:T.soft}}>min</span>
        </div>
        :<><div style={{display:"grid",gridTemplateColumns:editing?"30px 1fr 1fr 30px":"30px 1fr 1fr",gap:"4px 8px",alignItems:"center",fontSize:12}}>
          <span style={{fontWeight:700,color:T.faint,fontSize:10,textTransform:"uppercase"}}>Set</span>
          <span style={{fontWeight:700,color:T.faint,fontSize:10,textTransform:"uppercase"}}>Weight ({weightUnit})</span>
          <span style={{fontWeight:700,color:T.faint,fontSize:10,textTransform:"uppercase"}}>Reps</span>
          {editing&&<span/>}
          {(ex.sets||[]).map((set,si)=><React.Fragment key={si}>
            <span style={{fontFamily:"monospace",fontWeight:600,color:T.soft}}>{si+1}</span>
            {editing?<input type="number" value={set.weight} onChange={e=>updateSet(i,si,"weight",e.target.value)} style={IS({padding:"4px 6px",fontFamily:"monospace",fontSize:13})}/>
            :<span style={{fontFamily:"monospace",fontSize:13}}>{set.weight}<span style={{fontSize:10,color:T.faint,marginLeft:2}}>{weightUnit}</span></span>}
            {editing?<input type="number" value={set.reps} onChange={e=>updateSet(i,si,"reps",e.target.value)} style={IS({padding:"4px 6px",fontFamily:"monospace",fontSize:13})}/>
            :<span style={{fontFamily:"monospace",fontSize:13}}>{set.reps} reps</span>}
            {editing&&<button onClick={()=>removeSet(i,si)} style={{width:22,height:22,borderRadius:6,border:"1px solid "+T.danger+"33",background:"transparent",color:T.danger,cursor:"pointer",fontSize:10}}>x</button>}
          </React.Fragment>)}
        </div>
        {editing&&<button onClick={()=>addSet(i)} style={{marginTop:6,fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:7,border:"1px dashed "+T.lineS,background:"transparent",color:T.soft,cursor:"pointer",fontFamily:"system-ui,sans-serif",width:"100%"}}>+ Add set</button>}</>}
      </div>;})}
    </div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,paddingTop:14,borderTop:"1px solid "+T.line}}>
      {!editing?<><DelBtn label="Delete routine" onConfirm={onDelete}/>
        <div style={{display:"flex",gap:8}}><Btn variant="ghost" onClick={onClose}>Close</Btn><Btn icon="e" onClick={onEdit}>Edit</Btn></div>
      </>:<>{routine.name?<DelBtn label="Delete" onConfirm={onDelete}/>:<span/>}
        <Btn disabled={!canSave||saving} icon="v" onClick={()=>{if(!canSave)return;setSaving(true);onSave(build());setSaving(false);}}>{saving?"Saving...":"Save"}</Btn>
      </>}
    </div>
    {showPicker&&<Modal onClose={()=>setShowPicker(false)} width={420} level={2}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{margin:0}}>Add exercise</h3><CloseBtn onClick={()=>setShowPicker(false)}/>
      </div>
      <ExPickerList exercises={exercises} cats={cats} catById={catById} onPick={ex=>{
        const isC=ex.type==="cardio";
        setExs(prev=>[...prev,{exerciseId:ex.id,name:ex.name,emoji:ex.emoji,
          ...(isC?{duration:30}:{sets:[{weight:0,reps:10},{weight:0,reps:10},{weight:0,reps:10}]})}]);
        setShowPicker(false);
      }}/>
    </Modal>}
  </Modal>;
}

function ExPickerList({exercises,cats,catById,onPick}){
  const [q,setQ]=useState("");const [filter,setFilter]=useState("all");
  const filtered=exercises.filter(f=>{if(filter!=="all"&&!(f.tags||[]).includes(filter))return false;if(q&&!f.name.toLowerCase().includes(q.toLowerCase()))return false;return true;});
  return <>
    <input autoFocus placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} style={IS({marginBottom:10})}/>
    <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,marginBottom:10}}>
      <Chip active={filter==="all"} onClick={()=>setFilter("all")} label="All"/>
      {cats.map(c=><Chip key={c.id} active={filter===c.id} onClick={()=>setFilter(c.id)} label={c.name} p={catById[c.id].palette}/>)}
    </div>
    <div style={{maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
      {!filtered.length&&<p style={{fontSize:13,color:T.faint,textAlign:"center",padding:"1rem 0"}}>No exercises match.</p>}
      {filtered.map(f=><div key={f.id} onClick={()=>onPick(f)} style={{display:"flex",alignItems:"center",gap:10,padding:8,borderRadius:9,cursor:"pointer",border:"1px solid "+T.line}}>
        <span style={{fontSize:20}}>{f.emoji||"🏋️"}</span>
        <div style={{flex:1}}><p style={{fontWeight:600,fontSize:13,margin:0}}>{f.name}</p>
          <p style={{fontSize:10,color:T.faint,margin:0}}>{f.type==="cardio"?"Cardio":"Strength"} | MET {f.met||5}</p></div>
      </div>)}
    </div>
  </>;
}

function WPlan({plan,routines,selDay,setSelDay,onAdd,onRemove,onDup,onOpenRoutine}){
  const rById=useMemo(()=>{const m={};routines.forEach(r=>m[r.id]=r);return m;},[routines]);
  const items=plan[selDay]||[];
  return <div>
    <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
      {DAYS.map(d=>{const cnt=(plan[d]||[]).length;const a=d===selDay;return <button key={d} onClick={()=>setSelDay(d)} style={{flexShrink:0,fontSize:13,fontWeight:600,padding:"8px 13px",borderRadius:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",border:a?"1px solid "+T.sageD:"1px solid "+T.line,background:a?T.sage:"transparent",color:a?T.sageD:T.soft}}>
        {d}{cnt>0&&<span style={{marginLeft:5,fontSize:11,opacity:0.7}}>({cnt})</span>}
      </button>;})}
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
      <Btn icon="+" disabled={!routines.length} onClick={()=>onAdd(selDay)}>Add to {selDay}</Btn>
    </div>
    {!routines.length?<Empty icon="dumbbell" title="No routines yet" body="Create a routine first."/>
    :!items.length?<Empty icon="plus" title={"Nothing planned for "+selDay} body="Tap 'Add to...' above."/>
    :<div className="card-grid">
      {items.map(inst=>{const r=rById[inst.routineId];if(!r)return null;
        return <div key={inst.iid} style={{position:"relative"}}>
          <div onClick={()=>onOpenRoutine(r)} style={{background:T.raised,border:"1px solid "+T.line,borderRadius:14,overflow:"hidden",cursor:"pointer"}}>
            <div style={{width:"100%",aspectRatio:"1.3",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:26}}>🏋️</span></div>
            <div style={{padding:"8px 10px"}}><p style={{fontWeight:700,fontSize:13.5,margin:"0 0 3px"}}>{r.name}</p>
              <p style={{fontSize:11.5,fontFamily:"monospace",color:T.soft,margin:0}}>{r.exercises.length} exercises</p></div>
          </div>
          <div style={{display:"flex",gap:4,marginTop:6,justifyContent:"flex-end"}}>
            <DelBtn onConfirm={()=>onRemove(selDay,inst.iid)} icon/>
          </div>
        </div>;})}
    </div>}
  </div>;
}

function WDayPickerModal({day,routines,onPick,onClose}){
  const [q,setQ]=useState("");
  const filtered=routines.filter(r=>r.name.toLowerCase().includes(q.toLowerCase()));
  return <Modal onClose={onClose} width={400}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{margin:0}}>Add to {day}</h3><CloseBtn onClick={onClose}/>
    </div>
    <input autoFocus placeholder="Search routines" value={q} onChange={e=>setQ(e.target.value)} style={IS({marginBottom:10})}/>
    <div style={{maxHeight:360,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
      {!filtered.length&&<p style={{fontSize:13,color:T.faint,textAlign:"center",padding:"1rem 0"}}>No routines match.</p>}
      {filtered.map(r=><div key={r.id} onClick={()=>onPick(r.id)} style={{display:"flex",alignItems:"center",gap:10,padding:10,borderRadius:9,cursor:"pointer",border:"1px solid "+T.line}}>
        <span style={{fontSize:18}}>🏋️</span>
        <div style={{flex:1}}><p style={{fontWeight:600,fontSize:13,margin:0}}>{r.name}</p>
          <p style={{fontSize:11,color:T.soft,margin:0,fontFamily:"monospace"}}>{r.exercises.length} exercises</p></div>
      </div>)}
    </div>
  </Modal>;
}

/* ══════════════════════════════════════════════════
   LAYER 2 — Stock, Shopping, Barcode Scan
══════════════════════════════════════════════════ */

function StockTab({stock,shopping,foods,onAddStock,onUpdateStock,onRemoveStock,onAddShopping,onToggleShopping,onRemoveShopping,onClearDone}){
  const [subTab,setSubTab]=useState("stock");
  const [addModal,setAddModal]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [newShop,setNewShop]=useState("");

  function daysUntil(dateStr){
    if(!dateStr)return null;
    return Math.ceil((new Date(dateStr)-new Date())/(1000*60*60*24));
  }
  const sorted=[...stock].sort((a,b)=>{
    if(!a.expiresAt&&!b.expiresAt)return 0;
    if(!a.expiresAt)return 1; if(!b.expiresAt)return -1;
    return new Date(a.expiresAt)-new Date(b.expiresAt);
  });
  const expiring=sorted.filter(s=>{const d=daysUntil(s.expiresAt);return d!==null&&d<=3;});

  return <div>
    {/* Sub-tab toggle */}
    <div style={{display:"flex",gap:3,background:T.cream,borderRadius:12,padding:4,marginBottom:16}}>
      {[{id:"stock",label:"In Stock"},{id:"shopping",label:"🛒 Shopping"}].map(st=>{const a=subTab===st.id;return(
        <button key={st.id} onClick={()=>setSubTab(st.id)} style={{flex:1,padding:"8px 10px",borderRadius:9,border:"none",fontWeight:600,fontSize:13,background:a?T.raised:"transparent",color:a?T.sageD:T.soft,cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>{st.label}</button>
      );})}
    </div>

    {subTab==="stock"&&<>
      {expiring.length>0&&<div style={{background:"#FFF3CD",border:"1px solid #F59E0B",borderRadius:12,padding:"10px 14px",marginBottom:14}}>
        <p style={{fontWeight:700,fontSize:13,margin:"0 0 6px",color:"#92400E"}}>⚠️ Expiring soon</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {expiring.map(item=>{const d=daysUntil(item.expiresAt);return(
            <span key={item.id} style={{fontSize:12,fontWeight:600,background:"rgba(245,158,11,0.15)",borderRadius:6,padding:"3px 8px",color:"#92400E"}}>
              {item.emoji||"📦"} {item.name} · {d<=0?"expired":d===1?"tomorrow":`${d}d`}
            </span>
          );})}
        </div>
      </div>}

      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <Btn icon="+" onClick={()=>setAddModal(true)}>Add item</Btn>
      </div>

      {stock.length===0
        ?<Empty icon="🏠" title="Your pantry is empty" body="Track what you have at home with quantities and expiry dates."/>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>
          {sorted.map(item=>{
            const d=daysUntil(item.expiresAt);
            const isExpired=d!==null&&d<=0;
            const isExpiring=d!==null&&d<=3&&d>0;
            const borderColor=isExpired?T.danger:isExpiring?"#F59E0B":T.line;
            return <div key={item.id} style={{background:T.raised,border:"1px solid "+borderColor,borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:26,flexShrink:0}}>{item.emoji||"📦"}</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:700,fontSize:14,margin:"0 0 3px"}}>{item.name}</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:12,fontFamily:"monospace",color:T.soft,fontWeight:600}}>{item.quantity} {item.unit}</span>
                  {item.location&&<span style={{fontSize:11,fontWeight:700,background:T.sage,borderRadius:4,padding:"1px 7px",color:T.sageD}}>{item.location==="fridge"?"❄️ Fridge":item.location==="freezer"?"🧊 Freezer":"🏪 Pantry"}</span>}
                  {item.expiresAt&&<span style={{fontSize:11,fontWeight:600,color:isExpired?T.danger:isExpiring?"#92400E":T.faint}}>
                    {isExpired?"Expired":d===0?"Expires today":d===1?"Expires tomorrow":`Exp. ${new Date(item.expiresAt+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}`}
                  </span>}
                </div>
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <button onClick={()=>setEditItem(item)} style={{width:32,height:32,borderRadius:8,border:"1px solid "+T.lineS,background:T.raised,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
                <DelBtn icon onConfirm={()=>onRemoveStock(item.id)}/>
              </div>
            </div>;
          })}
        </div>}
    </>}

    {subTab==="shopping"&&<>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input placeholder="Add item to shopping list..." value={newShop} onChange={e=>setNewShop(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&newShop.trim()){onAddShopping(newShop.trim(),"🛒");setNewShop("");}}}
          style={IS({flex:1})}/>
        <Btn onClick={()=>{if(newShop.trim()){onAddShopping(newShop.trim(),"🛒");setNewShop("");}}} icon="+">Add</Btn>
      </div>
      {shopping.some(s=>s.done)&&<button onClick={onClearDone} style={{fontSize:12,color:T.danger,background:"transparent",border:"none",cursor:"pointer",marginBottom:8,fontFamily:"system-ui,sans-serif",fontWeight:600}}>Clear done items</button>}
      {shopping.length===0
        ?<Empty icon="🛒" title="Shopping list is empty" body="Add items you need to buy."/>
        :<div style={{display:"flex",flexDirection:"column",gap:6}}>
          {shopping.map(item=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:T.raised,border:"1px solid "+T.line,borderRadius:10,opacity:item.done?0.55:1}}>
            <button onClick={()=>onToggleShopping(item.id)} style={{width:24,height:24,borderRadius:6,border:"2px solid "+(item.done?T.sageD:T.lineS),background:item.done?T.sageD:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
              {item.done&&<span style={{color:"#FBF7EE",fontSize:13,fontWeight:800}}>✓</span>}
            </button>
            <span style={{flex:1,fontSize:14,fontWeight:600,textDecoration:item.done?"line-through":"none",color:item.done?T.faint:T.ink}}>{item.emoji} {item.name}</span>
            <button onClick={()=>onRemoveShopping(item.id)} style={{width:24,height:24,borderRadius:6,border:"none",background:"transparent",color:T.faint,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>)}
        </div>}
    </>}

    {(addModal||editItem)&&<StockItemModal item={editItem} foods={foods}
      onSave={data=>{editItem?onUpdateStock(editItem.id,data):onAddStock(data);setAddModal(false);setEditItem(null);}}
      onClose={()=>{setAddModal(false);setEditItem(null);}}/>}
  </div>;
}

function StockItemModal({item,foods,onSave,onClose}){
  const [name,setName]=useState(item?.name||"");
  const [emoji,setEmoji]=useState(item?.emoji||"📦");
  const [foodId,setFoodId]=useState(item?.foodId||null);
  const [qty,setQty]=useState(item?.quantity||1);
  const [unit,setUnit]=useState(item?.unit||"unit");
  const [location,setLocation]=useState(item?.location||"pantry");
  const [expires,setExpires]=useState(item?.expiresAt||"");
  const [q,setQ]=useState("");
  const [pickMode,setPickMode]=useState(!item);
  const filtered=foods.filter(f=>f.name.toLowerCase().includes(q.toLowerCase())).slice(0,20);
  function pick(food){setFoodId(food.id);setName(food.name);setEmoji(food.emoji||"📦");setPickMode(false);setQ("");}
  return <Modal onClose={onClose} width={420}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <h3 style={{margin:0}}>{item?"Edit item":"Add to pantry"}</h3><CloseBtn onClick={onClose}/>
    </div>
    {pickMode?<>
      <p style={{fontSize:12,color:T.soft,margin:"0 0 8px"}}>Pick from your food database:</p>
      <input placeholder="Search foods..." value={q} onChange={e=>setQ(e.target.value)} style={IS({marginBottom:8})} autoFocus/>
      <div style={{maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
        {filtered.map(f=><div key={f.id} onClick={()=>pick(f)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,cursor:"pointer",border:"1px solid "+T.line,background:T.raised}}>
          <span style={{fontSize:20}}>{f.emoji||"🍽"}</span>
          <span style={{flex:1,fontSize:13,fontWeight:600}}>{f.name}</span>
        </div>)}
      </div>
      <button onClick={()=>setPickMode(false)} style={{fontSize:12,color:T.soft,background:"transparent",border:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Or enter manually →</button>
    </>:<>
      <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
        <input value={emoji} onChange={e=>setEmoji(e.target.value||"📦")} maxLength={4} style={{width:48,fontSize:22,textAlign:"center",border:"1px solid "+T.lineS,borderRadius:8,padding:"4px",background:T.raised}}/>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Item name" style={IS({flex:1})} autoFocus={!item}/>
      </div>
      <button onClick={()=>setPickMode(true)} style={{fontSize:12,color:T.tc,background:"transparent",border:"none",cursor:"pointer",marginBottom:12,fontFamily:"system-ui,sans-serif",fontWeight:600}}>← Pick from foods database</button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><Label>Quantity</Label><input type="number" min="0" step="0.1" value={qty} onChange={e=>setQty(e.target.value)} style={IS({})}/></div>
        <div><Label>Unit</Label>
          <select value={unit} onChange={e=>setUnit(e.target.value)} style={IS({})}>
            <option value="unit">unit(s)</option><option value="g">g</option><option value="kg">kg</option>
            <option value="lb">lb</option><option value="ml">ml</option><option value="L">L</option><option value="oz">oz</option>
          </select>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <div><Label>Location</Label>
          <select value={location} onChange={e=>setLocation(e.target.value)} style={IS({})}>
            <option value="pantry">🏪 Pantry</option><option value="fridge">❄️ Fridge</option><option value="freezer">🧊 Freezer</option>
          </select>
        </div>
        <div><Label>Expires</Label><input type="date" value={expires} onChange={e=>setExpires(e.target.value)} style={IS({})}/></div>
      </div>
      <Btn full disabled={!name.trim()} onClick={()=>onSave({name:name.trim(),emoji,foodId,quantity:Number(qty)||1,unit,location,expiresAt:expires||null})}>Save</Btn>
    </>}
  </Modal>;
}

function BarcodeScanModal({onResult,onClose}){
  const videoRef=useRef(null);
  const streamRef=useRef(null);
  const animRef=useRef(null);
  const detectorRef=useRef(null);
  const [status,setStatus]=useState("starting"); // starting | scanning | found | manual | error
  const [barcode,setBarcode]=useState("");
  const [scanResult,setScanResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [notFound,setNotFound]=useState(false);

  useEffect(()=>{startCamera();return()=>stopCamera();},[]);

  async function startCamera(){
    try{
      if(!("BarcodeDetector" in window)){setStatus("manual");return;}
      detectorRef.current=new window.BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128","code_39"]});
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();setStatus("scanning");scan();}
    }catch{setStatus("manual");}
  }
  function stopCamera(){
    if(animRef.current)cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t=>t.stop());
  }
  async function scan(){
    if(!detectorRef.current||!videoRef.current)return;
    try{
      const codes=await detectorRef.current.detect(videoRef.current);
      if(codes.length>0){stopCamera();await lookup(codes[0].rawValue);return;}
    }catch{}
    animRef.current=requestAnimationFrame(scan);
  }
  async function lookup(code){
    setStatus("found");setBarcode(code);setLoading(true);setScanResult(null);setNotFound(false);
    try{
      const res=await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data=await res.json();
      if(data.status===1&&data.product){
        const p=data.product;const nm=p.nutriments||{};
        setScanResult({
          name:p.product_name||p.product_name_en||"",emoji:"📦",
          nutrition:{
            cal:Math.round(nm["energy-kcal_100g"]||(nm["energy_100g"]||0)/4.184||0),
            protein:rnd(nm["proteins_100g"]||0,1),carbs:rnd(nm["carbohydrates_100g"]||0,1),
            fat:rnd(nm["fat_100g"]||0,1),fiber:rnd(nm["fiber_100g"]||0,1),sugar:rnd(nm["sugars_100g"]||0,1),
            unit:"g",portion:100,
          }
        });
      }else{setNotFound(true);}
    }catch{setNotFound(true);}
    setLoading(false);
  }

  return <Modal onClose={()=>{stopCamera();onClose();}} width={420} level={2}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <h3 style={{margin:0}}>📷 Scan barcode</h3><CloseBtn onClick={()=>{stopCamera();onClose();}}/>
    </div>

    {status==="starting"&&<div style={{height:180,display:"flex",alignItems:"center",justifyContent:"center",color:T.faint,fontSize:13}}>Starting camera…</div>}

    {status==="scanning"&&<div style={{position:"relative",borderRadius:12,overflow:"hidden",marginBottom:14,background:"#000",aspectRatio:"4/3"}}>
      <video ref={videoRef} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} playsInline muted/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
        <div style={{width:220,height:90,border:"3px solid rgba(255,255,255,0.9)",borderRadius:8,boxShadow:"0 0 0 9999px rgba(0,0,0,0.45)"}}/>
      </div>
      <p style={{position:"absolute",bottom:10,left:0,right:0,textAlign:"center",color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:600,margin:0}}>Point at the barcode</p>
    </div>}

    {(status==="manual"||status==="found")&&<>
      <Label>Barcode number</Label>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="e.g. 5000157024137"
          style={IS({flex:1,fontFamily:"monospace",fontSize:15})} autoFocus={status==="manual"}/>
        <Btn onClick={()=>lookup(barcode)} disabled={!barcode.trim()||loading}>Look up</Btn>
      </div>
    </>}

    {loading&&<div style={{textAlign:"center",padding:"20px 0",color:T.faint,fontSize:13}}>Searching product database…</div>}

    {scanResult&&<>
      <div style={{background:T.cream,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
        <p style={{fontWeight:700,fontSize:15,margin:"0 0 2px"}}>{scanResult.name||"Unknown product"}</p>
        <p style={{fontSize:11,color:T.faint,margin:"0 0 10px",fontFamily:"monospace"}}>per 100g</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
          {[["Cal",scanResult.nutrition.cal,""],["Protein",scanResult.nutrition.protein,"g"],["Carbs",scanResult.nutrition.carbs,"g"],
            ["Fat",scanResult.nutrition.fat,"g"],["Fiber",scanResult.nutrition.fiber,"g"],["Sugar",scanResult.nutrition.sugar,"g"]].map(([l,v,u])=>(
            <div key={l} style={{background:T.raised,borderRadius:8,padding:"6px 8px"}}>
              <p style={{fontSize:9,color:T.faint,margin:"0 0 2px",textTransform:"uppercase",fontWeight:700}}>{l}</p>
              <p style={{fontFamily:"monospace",fontSize:14,fontWeight:700,margin:0,color:T.ink}}>{v}{u}</p>
            </div>
          ))}
        </div>
      </div>
      <Btn full onClick={()=>{stopCamera();onResult(scanResult);}}>Use this food</Btn>
    </>}

    {notFound&&<p style={{fontSize:13,color:T.danger,textAlign:"center",margin:"12px 0"}}>Product not found. Try entering the barcode number manually.</p>}
    {status==="manual"&&!notFound&&!loading&&<p style={{fontSize:11,color:T.faint,textAlign:"center",margin:"8px 0"}}>Camera scanning not supported on this browser. Enter the barcode number above.</p>}
  </Modal>;
}

/* ══════════════════════════════════════════════════
   LAYER 3 — Tasks, Recipe filters, Body Map
══════════════════════════════════════════════════ */

const TASK_CATS = {
  work:     {label:"Work",     emoji:"💼", hex:"#4A7A8C", soft:"#DCEAEE"},
  chores:   {label:"Chores",   emoji:"🧹", hex:"#6E8C4A", soft:"#E7EBDA"},
  personal: {label:"Personal", emoji:"🎯", hex:"#9A5A7A", soft:"#EFDFE8"},
};

function TasksSection({tasks,activeTab,onAdd,onToggle,onDelete,onUpdate}){
  const [showAdd,setShowAdd]=useState(false);
  const [editTask,setEditTask]=useState(null);

  function daysUntil(d){
    if(!d)return null;
    return Math.ceil((new Date(d+"T12:00:00")-new Date())/(864e5));
  }

  const visible=useMemo(()=>{
    let arr=tasks.filter(t=>{
      if(activeTab==="done") return t.done;
      if(t.done) return false;
      if(activeTab!=="all") return t.category===activeTab;
      return true;
    });
    return arr.sort((a,b)=>{
      if(a.done!==b.done) return a.done?1:-1;
      const da=a.dueDate?new Date(a.dueDate+"T12:00:00"):null;
      const db=b.dueDate?new Date(b.dueDate+"T12:00:00"):null;
      if(da&&db) return da-db;
      if(da) return -1; if(db) return 1;
      return b.createdAt-a.createdAt;
    });
  },[tasks,activeTab]);

  const pending=tasks.filter(t=>!t.done).length;
  const overdue=tasks.filter(t=>!t.done&&t.dueDate&&daysUntil(t.dueDate)<0).length;

  return <div>
    {/* Summary chips */}
    {pending>0&&<div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <span style={{fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:8,background:T.cream,color:T.soft}}>{pending} pending</span>
      {overdue>0&&<span style={{fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:8,background:T.danger+"18",color:T.danger}}>⚠️ {overdue} overdue</span>}
    </div>}

    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
      <Btn icon="+" onClick={()=>setShowAdd(true)}>Add task</Btn>
    </div>

    {visible.length===0
      ?<Empty icon={activeTab==="done"?"✅":"📋"}
          title={activeTab==="done"?"No completed tasks yet":"Nothing here"}
          body={activeTab==="done"?"Tasks you complete show up here.":"Tap '+ Add task' to get started."}/>
      :<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {visible.map(task=>{
          const d=daysUntil(task.dueDate);
          const isOverdue=d!==null&&d<0;
          const isToday=d===0;
          const isSoon=d!==null&&d>0&&d<=2;
          const cat=TASK_CATS[task.category]||TASK_CATS.personal;
          return <div key={task.id} style={{
            background:T.raised,border:"1px solid "+(isOverdue?T.danger:T.line),
            borderLeft:"4px solid "+cat.hex,borderRadius:12,padding:"12px 14px",
            display:"flex",alignItems:"flex-start",gap:12,
            opacity:task.done?0.55:1,transition:"opacity 0.2s",
          }}>
            <button onClick={()=>onToggle(task.id)} style={{
              width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,
              border:"2px solid "+(task.done?T.sageD:T.lineS),
              background:task.done?T.sageD:"transparent",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,
            }}>
              {task.done&&<span style={{color:"#FBF7EE",fontSize:12,lineHeight:1}}>✓</span>}
            </button>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:600,fontSize:14,margin:"0 0 5px",textDecoration:task.done?"line-through":"none",color:task.done?T.faint:T.ink,wordBreak:"break-word"}}>{task.title}</p>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,background:cat.soft,color:cat.hex}}>{cat.emoji} {cat.label}</span>
                {task.dueDate&&<span style={{fontSize:11,fontWeight:isOverdue||isToday?700:400,color:isOverdue?T.danger:isToday?"#C4683D":isSoon?"#8C7A3D":T.faint}}>
                  {isOverdue?`Overdue ${Math.abs(d)}d`:isToday?"Due today":isSoon?`Due in ${d}d`:`Due ${new Date(task.dueDate+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}`}
                </span>}
              </div>
              {task.notes&&<p style={{fontSize:12,color:T.soft,margin:"5px 0 0",lineHeight:1.4}}>{task.notes}</p>}
            </div>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              <button onClick={()=>{setEditTask(task);}} style={{width:28,height:28,borderRadius:7,border:"1px solid "+T.lineS,background:T.raised,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
              <DelBtn icon onConfirm={()=>onDelete(task.id)}/>
            </div>
          </div>;
        })}
      </div>}

    {(showAdd||editTask)&&<AddTaskModal task={editTask}
      onSave={data=>{editTask?onUpdate(editTask.id,data):onAdd(data);setShowAdd(false);setEditTask(null);}}
      onClose={()=>{setShowAdd(false);setEditTask(null);}}/>}
  </div>;
}

function AddTaskModal({task,onSave,onClose}){
  const [title,setTitle]=useState(task?.title||"");
  const [category,setCategory]=useState(task?.category||"personal");
  const [dueDate,setDueDate]=useState(task?.dueDate||"");
  const [notes,setNotes]=useState(task?.notes||"");
  return <Modal onClose={onClose} width={440}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <h3 style={{margin:0}}>{task?"Edit task":"Add task"}</h3><CloseBtn onClick={onClose}/>
    </div>
    <input autoFocus value={title} onChange={e=>setTitle(e.target.value)}
      placeholder="What needs to be done?" style={IS({marginBottom:12,fontSize:16,fontWeight:600})}
      onKeyDown={e=>{if(e.key==="Enter"&&title.trim()){onSave({title:title.trim(),category,dueDate:dueDate||null,notes:notes.trim()});}}}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
      <div><Label>Category</Label>
        <select value={category} onChange={e=>setCategory(e.target.value)} style={IS({})}>
          <option value="work">💼 Work</option>
          <option value="chores">🧹 Chores</option>
          <option value="personal">🎯 Personal</option>
        </select>
      </div>
      <div><Label>Due date</Label>
        <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={IS({})}/>
      </div>
    </div>
    <div style={{marginBottom:16}}>
      <Label>Notes (optional)</Label>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add a note…"
        style={{...IS({}),height:72,resize:"vertical",lineHeight:1.5}}/>
    </div>
    <Btn full disabled={!title.trim()} onClick={()=>onSave({title:title.trim(),category,dueDate:dueDate||null,notes:notes.trim()})}>
      {task?"Save changes":"Add task"}
    </Btn>
  </Modal>;
}

/* ── Body Map ── simple SVG muscle diagram shown in Exercises when items are selected */
const MUSCLE_MAP = {
  front: [
    {id:"chest",    label:"Chest",      tags:["push","chest","chest_u"],        cx:100,cy:102, rx:32,ry:24},
    {id:"lshoulder",label:"L.Shoulder", tags:["push","shoulders_p","upper"],    cx:60, cy:82,  rx:16,ry:16},
    {id:"rshoulder",label:"R.Shoulder", tags:["push","shoulders_p","upper"],    cx:140,cy:82,  rx:16,ry:16},
    {id:"lbicep",   label:"L.Bicep",    tags:["pull","biceps"],                 cx:44, cy:120, rx:11,ry:22},
    {id:"rbicep",   label:"R.Bicep",    tags:["pull","biceps"],                 cx:156,cy:120, rx:11,ry:22},
    {id:"lforearm", label:"L.Forearm",  tags:["pull","forearms"],               cx:40, cy:162, rx:9, ry:20},
    {id:"rforearm", label:"R.Forearm",  tags:["pull","forearms"],               cx:160,cy:162, rx:9, ry:20},
    {id:"abs",      label:"Abs",        tags:["core","abs"],                    cx:100,cy:148, rx:26,ry:30},
    {id:"obliques", label:"Obliques",   tags:["core","obliques"],               cx:100,cy:148, rx:38,ry:30},
    {id:"lquad",    label:"L.Quad",     tags:["lower","quads"],                 cx:82, cy:218, rx:20,ry:38},
    {id:"rquad",    label:"R.Quad",     tags:["lower","quads"],                 cx:118,cy:218, rx:20,ry:38},
    {id:"lcalf",    label:"L.Calf",     tags:["lower","calves"],                cx:80, cy:286, rx:14,ry:28},
    {id:"rcalf",    label:"R.Calf",     tags:["lower","calves"],                cx:120,cy:286, rx:14,ry:28},
  ],
  back: [
    {id:"lats",     label:"Back/Lats",  tags:["pull","back"],                   cx:100,cy:105, rx:36,ry:28},
    {id:"lshouldB", label:"L.Shoulder", tags:["push","shoulders_p","upper"],    cx:60, cy:82,  rx:16,ry:16},
    {id:"rshouldB", label:"R.Shoulder", tags:["push","shoulders_p","upper"],    cx:140,cy:82,  rx:16,ry:16},
    {id:"ltricep",  label:"L.Tricep",   tags:["push","triceps"],                cx:44, cy:120, rx:11,ry:22},
    {id:"rtricep",  label:"R.Tricep",   tags:["push","triceps"],                cx:156,cy:120, rx:11,ry:22},
    {id:"lforearmB",label:"L.Forearm",  tags:["pull","forearms"],               cx:40, cy:162, rx:9, ry:20},
    {id:"rforearmB",label:"R.Forearm",  tags:["pull","forearms"],               cx:160,cy:162, rx:9, ry:20},
    {id:"glutes",   label:"Glutes",     tags:["lower","glutes"],                cx:100,cy:178, rx:32,ry:22},
    {id:"lhamstring",label:"L.Hamstring",tags:["lower","hamstrings"],           cx:82, cy:220, rx:20,ry:36},
    {id:"rhamstring",label:"R.Hamstring",tags:["lower","hamstrings"],           cx:118,cy:220, rx:20,ry:36},
    {id:"lcalfB",   label:"L.Calf",     tags:["lower","calves"],                cx:80, cy:284, rx:14,ry:28},
    {id:"rcalfB",   label:"R.Calf",     tags:["lower","calves"],                cx:120,cy:284, rx:14,ry:28},
  ],
};

function BodyMap({selectedTags}){
  const [view,setView]=useState("front");
  const muscles=MUSCLE_MAP[view];
  const activeTags=new Set(selectedTags);

  function isActive(muscle){
    return muscle.tags.some(t=>activeTags.has(t));
  }

  return <div style={{background:T.raised,border:"1px solid "+T.line,borderRadius:14,padding:"12px 16px",marginBottom:16}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <span style={{fontSize:12,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:"0.04em"}}>Muscles worked</span>
      <div style={{display:"flex",gap:4}}>
        {["front","back"].map(v=><button key={v} onClick={()=>setView(v)} style={{
          padding:"4px 10px",borderRadius:7,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",
          background:view===v?T.sageD:"transparent",color:view===v?"#FBF7EE":T.soft,fontFamily:"system-ui,sans-serif",
        }}>{v==="front"?"Front":"Back"}</button>)}
      </div>
    </div>
    <svg viewBox="0 0 200 320" style={{width:"100%",maxWidth:220,display:"block",margin:"0 auto"}}>
      {/* body silhouette */}
      <ellipse cx="100" cy="30" rx="22" ry="24" fill={T.line} stroke={T.lineS} strokeWidth="1.5"/>
      <rect x="88" y="52" width="24" height="14" rx="5" fill={T.line} stroke={T.lineS} strokeWidth="1.5"/>
      <rect x="62" y="64" width="76" height="96" rx="12" fill={T.line} stroke={T.lineS} strokeWidth="1.5"/>
      <rect x="36" y="70" width="26" height="96" rx="10" fill={T.line} stroke={T.lineS} strokeWidth="1.5"/>
      <rect x="138" y="70" width="26" height="96" rx="10" fill={T.line} stroke={T.lineS} strokeWidth="1.5"/>
      <rect x="64" y="158" width="72" height="30" rx="10" fill={T.line} stroke={T.lineS} strokeWidth="1.5"/>
      <rect x="64" y="184" width="32" height="80" rx="12" fill={T.line} stroke={T.lineS} strokeWidth="1.5"/>
      <rect x="104" y="184" width="32" height="80" rx="12" fill={T.line} stroke={T.lineS} strokeWidth="1.5"/>
      <rect x="66" y="260" width="28" height="58" rx="10" fill={T.line} stroke={T.lineS} strokeWidth="1.5"/>
      <rect x="106" y="260" width="28" height="58" rx="10" fill={T.line} stroke={T.lineS} strokeWidth="1.5"/>
      {/* muscle overlays */}
      {muscles.map(m=>{
        const active=isActive(m);
        return active?<ellipse key={m.id} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry}
          fill={T.tc} fillOpacity="0.55" stroke={T.tc} strokeWidth="1.5" strokeOpacity="0.8"/>:null;
      })}
    </svg>
    {selectedTags.length===0&&<p style={{textAlign:"center",fontSize:11,color:T.faint,margin:"6px 0 0"}}>Select exercises to see muscles highlighted</p>}
  </div>;
}
