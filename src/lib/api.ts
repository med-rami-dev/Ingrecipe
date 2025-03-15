import axios from "axios";
import { Recipe } from "@/components/recipe/RecipeCard";
import { supabase } from "../../supabase/supabase";

// API Configurations
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;
const MEALDB_API = "https://www.themealdb.com/api/json/v1/1";

// Unit conversion to grams
const UNIT_CONVERSION: { [key: string]: number } = {
  'g': 1,
  'kg': 1000,
  'mg': 0.001,
  'oz': 28.35,
  'lb': 453.6,
  'cup': 128,
  'tbsp': 14.3,
  'tsp': 4.8,
};

// Nutrition data cache
const nutritionCache = new Map<string, any>();

async function getUSDANutrition(ingredient: string) {
  try {
    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/foods/search`,
      {
        params: {
          api_key: USDA_API_KEY,
          query: ingredient,
          pageSize: 1
        }
      }
    );
    return response.data.foods?.[0]?.foodNutrients || [];
  } catch (error) {
    console.error("USDA API error:", error);
    return [];
  }
}

async function getOpenFoodFactsNutrition(ingredient: string) {
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl`,
      {
        params: {
          search_terms: ingredient,
          page_size: 1,
          json: 1
        }
      }
    );
    return response.data.products?.[0]?.nutriments || {};
  } catch (error) {
    console.error("Open Food Facts error:", error);
    return {};
  }
}

async function parseIngredient(ingredient: string) {
  const parsed = {
    quantity: 100,
    unit: 'g',
    name: ingredient,
    nutrients: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    }
  };

  // Extract quantity and unit
  const match = ingredient.match(/(\d+\.?\d*)\s*(\D+)\s+(.*)/i);
  if (match) {
    parsed.quantity = parseFloat(match[1]);
    parsed.unit = match[2].toLowerCase();
    parsed.name = match[3].toLowerCase();
  }

  // Convert to grams
  if (UNIT_CONVERSION[parsed.unit]) {
    parsed.quantity *= UNIT_CONVERSION[parsed.unit];
  }

  // Check cache
  if (nutritionCache.has(parsed.name)) {
    return { ...parsed, nutrients: nutritionCache.get(parsed.name) };
  }

  // Fetch nutrition data
  let nutrients = await getUSDANutrition(parsed.name);
  if (nutrients.length === 0) {
    const offData = await getOpenFoodFactsNutrition(parsed.name);
    nutrients = [
      { nutrientName: "Energy", value: offData.energy || 0 },
      { nutrientName: "Protein", value: offData.proteins || 0 },
      { nutrientName: "Carbohydrates", value: offData.carbohydrates || 0 },
      { nutrientName: "Fat", value: offData.fat || 0 },
      { nutrientName: "Fiber", value: offData.fiber || 0 },
      { nutrientName: "Sugars", value: offData.sugars || 0 },
    ];
  }

  // Process nutrients
  const result = {
    calories: nutrients.find((n: any) => n.nutrientName?.includes("Energy"))?.value || 0,
    protein: nutrients.find((n: any) => n.nutrientName?.includes("Protein"))?.value || 0,
    carbs: nutrients.find((n: any) => n.nutrientName?.includes("Carbohydrate"))?.value || 0,
    fat: nutrients.find((n: any) => n.nutrientName?.includes("Fat"))?.value || 0,
    fiber: nutrients.find((n: any) => n.nutrientName?.includes("Fiber"))?.value || 0,
    sugar: nutrients.find((n: any) => n.nutrientName?.includes("Sugars"))?.value || 0,
  };

  nutritionCache.set(parsed.name, result);
  return { ...parsed, nutrients: result };
}

export async function estimateNutrition(ingredients: string[]) {
  const total = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
  };

  for (const ingredient of ingredients) {
    try {
      const { nutrients, quantity } = await parseIngredient(ingredient);
      const multiplier = quantity / 100;

      total.calories += nutrients.calories * multiplier;
      total.protein += nutrients.protein * multiplier;
      total.carbs += nutrients.carbs * multiplier;
      total.fat += nutrients.fat * multiplier;
      total.fiber += nutrients.fiber * multiplier;
      total.sugar += nutrients.sugar * multiplier;
    } catch (error) {
      console.error(`Error processing ingredient: ${ingredient}`, error);
    }
  }

  return {
    calories: Math.round(total.calories),
    protein: Math.round(total.protein),
    carbs: Math.round(total.carbs),
    fat: Math.round(total.fat),
    fiber: Math.round(total.fiber),
    sugar: Math.round(total.sugar)
  };
}

function filterRecipes(
  recipes: Recipe[],
  ingredients?: string[],
  filters?: string[],
): Recipe[] {
  let filteredRecipes = [...recipes];

  if (ingredients?.length) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      ingredients.some(ingredient =>
        recipe.ingredients.some(recipeIngredient =>
          recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
        )
      ));
  }

  if (filters?.length) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      filters.some(filter =>
        recipe.tags.some(tag =>
          tag.toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }

  return filteredRecipes;
}

function formatSupabaseRecipes(supabaseRecipes: any[]): Recipe[] {
  return supabaseRecipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    calories: recipe.calories,
    protein: recipe.protein,
    prepTime: recipe.prep_time,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    nutrition: recipe.nutrition,
    tags: recipe.tags,
    isFavorite: false,
    userEmail: recipe.user_email,
  }));
}

async function storeRecipesInSupabase(recipes: Recipe[]): Promise<void> {
  try {
    const supabaseRecipes = recipes.map(recipe => ({
      title: recipe.title,
      image: recipe.image,
      calories: recipe.calories,
      protein: recipe.protein,
      prep_time: recipe.prepTime,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      nutrition: recipe.nutrition,
      tags: recipe.tags,
      is_community: false,
      created_at: new Date().toISOString(),
    }));

    const batchSize = 10;
    for (let i = 0; i < supabaseRecipes.length; i += batchSize) {
      const batch = supabaseRecipes.slice(i, i + batchSize);
      await supabase.from("recipes").upsert(batch, { onConflict: "title" });
    }
  } catch (error) {
    console.error("Error storing recipes:", error);
  }
}

export async function getRecipes(
  ingredients?: string[],
  filters?: string[],
): Promise<Recipe[]> {
  try {
    const { data: supabaseRecipes, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && supabaseRecipes?.length) {
      return filterRecipes(formatSupabaseRecipes(supabaseRecipes), ingredients, filters);
    }

    const response = await axios.get(`${MEALDB_API}/search.php?s=`);
    const apiRecipes = response.data.meals || [];

    const formattedRecipes = await Promise.all(apiRecipes.map(async (meal: any) => {
      const ingredientsList = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient?.trim()) {
          ingredientsList.push(`${measure} ${ingredient}`);
        }
      }

      const nutrition = await estimateNutrition(ingredientsList);

      return {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        calories: nutrition.calories,
        protein: nutrition.protein,
        prepTime: 30,
        ingredients: ingredientsList,
        instructions: meal.strInstructions.split('\r\n').filter((step: string) => step.trim()),
        nutrition,
        tags: [
          meal.strCategory,
          meal.strArea,
          ...(meal.strTags?.split(",") || []),
        ].filter(Boolean),
        isFavorite: false,
      };
    }));

    await storeRecipesInSupabase(formattedRecipes);
    return filterRecipes(formattedRecipes, ingredients, filters);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

export async function getPopularRecipes(limit: number = 10): Promise<Recipe[]> {
  try {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .order("favorite_count", { ascending: false })
      .limit(limit);

    return data ? formatSupabaseRecipes(data) : [];
  } catch (error) {
    console.error("Error fetching popular recipes:", error);
    return [];
  }
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  try {
    if (!query.trim()) return await getRecipes();

    const { data: supabaseResults } = await supabase
      .from("recipes")
      .select("*")
      .textSearch("title", query);

    if (supabaseResults?.length) {
      return formatSupabaseRecipes(supabaseResults);
    }

    const response = await axios.get(`${MEALDB_API}/search.php?s=${query}`);
    const apiRecipes = response.data.meals || [];

    return await Promise.all(apiRecipes.map(async (meal: any) => {
      const ingredientsList = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient?.trim()) {
          ingredientsList.push(`${measure} ${ingredient}`);
        }
      }

      const nutrition = await estimateNutrition(ingredientsList);

      return {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        calories: nutrition.calories,
        protein: nutrition.protein,
        prepTime: 30,
        ingredients: ingredientsList,
        instructions: meal.strInstructions.split('\r\n').filter((step: string) => step.trim()),
        nutrition,
        tags: [
          meal.strCategory,
          meal.strArea,
          ...(meal.strTags?.split(",") || []),
        ].filter(Boolean),
        isFavorite: false,
      };
    }));
  } catch (error) {
    console.error("Error searching recipes:", error);
    return [];
  }
}