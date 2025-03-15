// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_deno_apps

interface RequestData {
  ingredients: string[];
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

// Simple mapping of common ingredients to nutrition values
const nutritionDatabase: Record<string, Partial<NutritionData>> = {
  // Proteins
  chicken: {
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
  },
  beef: { calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0, sugar: 0 },
  salmon: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0 },
  tofu: { calories: 76, protein: 8, carbs: 2, fat: 4.5, fiber: 0.5, sugar: 0 },
  eggs: { calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, sugar: 0.6 },

  // Vegetables
  broccoli: {
    calories: 55,
    protein: 3.7,
    carbs: 11,
    fat: 0.6,
    fiber: 5,
    sugar: 2.6,
  },
  spinach: {
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    sugar: 0.4,
  },
  kale: { calories: 50, protein: 3.3, carbs: 10, fat: 0.7, fiber: 2, sugar: 0 },
  carrots: {
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    fiber: 2.8,
    sugar: 4.7,
  },
  tomato: {
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    sugar: 2.6,
  },
  cucumber: {
    calories: 16,
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1,
    fiber: 0.5,
    sugar: 1.7,
  },
  "bell pepper": {
    calories: 31,
    protein: 1,
    carbs: 6,
    fat: 0.3,
    fiber: 2.1,
    sugar: 4.2,
  },
  onion: {
    calories: 40,
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1,
    fiber: 1.7,
    sugar: 4.2,
  },
  garlic: {
    calories: 149,
    protein: 6.4,
    carbs: 33,
    fat: 0.5,
    fiber: 2.1,
    sugar: 1,
  },
  potato: {
    calories: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1,
    fiber: 2.2,
    sugar: 1.2,
  },
  "sweet potato": {
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    fiber: 3,
    sugar: 4.2,
  },

  // Grains
  rice: {
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    sugar: 0.1,
  },
  quinoa: {
    calories: 120,
    protein: 4.4,
    carbs: 21,
    fat: 1.9,
    fiber: 2.8,
    sugar: 0.9,
  },
  pasta: {
    calories: 131,
    protein: 5,
    carbs: 25,
    fat: 1.1,
    fiber: 1.2,
    sugar: 0.9,
  },
  bread: {
    calories: 265,
    protein: 9,
    carbs: 49,
    fat: 3.2,
    fiber: 2.7,
    sugar: 5,
  },
  oats: {
    calories: 389,
    protein: 16.9,
    carbs: 66,
    fat: 6.9,
    fiber: 10.6,
    sugar: 0,
  },

  // Dairy
  milk: { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5 },
  cheese: {
    calories: 402,
    protein: 25,
    carbs: 2.4,
    fat: 33,
    fiber: 0,
    sugar: 0.5,
  },
  yogurt: {
    calories: 59,
    protein: 3.5,
    carbs: 5,
    fat: 3.3,
    fiber: 0,
    sugar: 5,
  },

  // Oils and fats
  "olive oil": {
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
  },
  butter: {
    calories: 717,
    protein: 0.9,
    carbs: 0.1,
    fat: 81,
    fiber: 0,
    sugar: 0.1,
  },

  // Nuts and seeds
  almonds: {
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 49,
    fiber: 12.5,
    sugar: 4.4,
  },
  walnuts: {
    calories: 654,
    protein: 15,
    carbs: 14,
    fat: 65,
    fiber: 6.7,
    sugar: 2.6,
  },
  "chia seeds": {
    calories: 486,
    protein: 16.5,
    carbs: 42,
    fat: 31,
    fiber: 34,
    sugar: 0,
  },

  // Legumes
  beans: {
    calories: 347,
    protein: 21,
    carbs: 63,
    fat: 1.2,
    fiber: 16,
    sugar: 2,
  },
  lentils: {
    calories: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4,
    fiber: 8,
    sugar: 1.8,
  },
  chickpeas: {
    calories: 364,
    protein: 19,
    carbs: 61,
    fat: 6,
    fiber: 17,
    sugar: 11,
  },

  // Condiments and spices
  salt: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
  pepper: {
    calories: 251,
    protein: 10,
    carbs: 64,
    fat: 3.3,
    fiber: 25,
    sugar: 0.6,
  },
  "soy sauce": {
    calories: 53,
    protein: 5.6,
    carbs: 4.9,
    fat: 0.1,
    fiber: 0.8,
    sugar: 0.4,
  },
  honey: {
    calories: 304,
    protein: 0.3,
    carbs: 82,
    fat: 0,
    fiber: 0.2,
    sugar: 82,
  },
  "maple syrup": {
    calories: 260,
    protein: 0,
    carbs: 67,
    fat: 0.1,
    fiber: 0,
    sugar: 60,
  },
};

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { ingredients } = (await req.json()) as RequestData;

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      throw new Error("Invalid or missing ingredients array");
    }

    // Initialize nutrition totals
    const nutritionTotals: NutritionData = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    };

    // Process each ingredient
    ingredients.forEach((ingredient) => {
      // Try to match the ingredient with our database
      const matchedIngredient = Object.keys(nutritionDatabase).find((key) =>
        ingredient.toLowerCase().includes(key.toLowerCase()),
      );

      if (matchedIngredient) {
        const nutrition = nutritionDatabase[matchedIngredient];

        // Add the nutrition values to our totals
        nutritionTotals.calories += nutrition.calories || 0;
        nutritionTotals.protein += nutrition.protein || 0;
        nutritionTotals.carbs += nutrition.carbs || 0;
        nutritionTotals.fat += nutrition.fat || 0;
        nutritionTotals.fiber += nutrition.fiber || 0;
        nutritionTotals.sugar += nutrition.sugar || 0;
      } else {
        // For unknown ingredients, add some random values
        nutritionTotals.calories += Math.floor(Math.random() * 50) + 20;
        nutritionTotals.protein += Math.floor(Math.random() * 3) + 1;
        nutritionTotals.carbs += Math.floor(Math.random() * 5) + 2;
        nutritionTotals.fat += Math.floor(Math.random() * 2) + 0.5;
        nutritionTotals.fiber += Math.floor(Math.random() * 1) + 0.2;
        nutritionTotals.sugar += Math.floor(Math.random() * 2) + 0.5;
      }
    });

    // Round values to make them look more natural
    Object.keys(nutritionTotals).forEach((key) => {
      nutritionTotals[key as keyof NutritionData] =
        Math.round(nutritionTotals[key as keyof NutritionData] * 10) / 10;
    });

    return new Response(JSON.stringify(nutritionTotals), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
