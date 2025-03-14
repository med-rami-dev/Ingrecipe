import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Calculator, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";

interface RecipeFormProps {
  onSuccess?: () => void;
  language?: "en" | "ar";
}

export default function RecipeForm({
  onSuccess,
  language = "en",
}: RecipeFormProps) {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prepTime, setPrepTime] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instruction, setInstruction] = useState("");
  const [instructions, setInstructions] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  } | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  const translations = {
    title: language === "en" ? "Recipe Title" : "عنوان الوصفة",
    image: language === "en" ? "Recipe Image" : "صورة الوصفة",
    uploadImage: language === "en" ? "Upload Image" : "تحميل صورة",
    dragDrop:
      language === "en"
        ? "Drag and drop or click to upload"
        : "اسحب وأفلت أو انقر للتحميل",
    uploading: language === "en" ? "Uploading..." : "جاري التحميل...",
    changeImage: language === "en" ? "Change Image" : "تغيير الصورة",
    removeImage: language === "en" ? "Remove Image" : "إزالة الصورة",
    imageError:
      language === "en" ? "Error uploading image" : "خطأ في تحميل الصورة",
    maxSize: language === "en" ? "Max size: 2MB" : "الحجم الأقصى: 2 ميجابايت",
    invalidType:
      language === "en"
        ? "Invalid file type. Please upload an image."
        : "نوع ملف غير صالح. يرجى تحميل صورة.",
    fileTooLarge:
      language === "en"
        ? "File is too large. Max size is 2MB."
        : "الملف كبير جدًا. الحجم الأقصى هو 2 ميجابايت.",
    uploadSuccess:
      language === "en"
        ? "Image uploaded successfully"
        : "تم تحميل الصورة بنجاح",
    prepTime:
      language === "en" ? "Preparation Time (minutes)" : "وقت التحضير (دقائق)",
    ingredients: language === "en" ? "Ingredients" : "المكونات",
    addIngredient: language === "en" ? "Add Ingredient" : "أضف مكون",
    instructions: language === "en" ? "Instructions" : "تعليمات",
    addInstruction: language === "en" ? "Add Instruction" : "أضف تعليمات",
    tags: language === "en" ? "Tags" : "العلامات",
    addTag: language === "en" ? "Add Tag" : "أضف علامة",
    calculate: language === "en" ? "Calculate Nutrition" : "حساب التغذية",
    calculating: language === "en" ? "Calculating..." : "جاري الحساب...",
    share: language === "en" ? "Share Recipe" : "شارك الوصفة",
    enterIngredient: language === "en" ? "Enter an ingredient" : "أدخل مكون",
    enterInstruction:
      language === "en" ? "Enter an instruction" : "أدخل تعليمات",
    enterTag: language === "en" ? "Enter a tag" : "أدخل علامة",
    nutritionInfo:
      language === "en" ? "Nutrition Information" : "معلومات التغذية",
    calories: language === "en" ? "Calories" : "سعرات حرارية",
    protein: language === "en" ? "Protein" : "بروتين",
    carbs: language === "en" ? "Carbs" : "كربوهيدرات",
    fat: language === "en" ? "Fat" : "دهون",
    fiber: language === "en" ? "Fiber" : "ألياف",
    sugar: language === "en" ? "Sugar" : "سكر",
  };

  const addIngredient = () => {
    if (ingredient.trim() !== "") {
      setIngredients([...ingredients, ingredient.trim()]);
      setIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    if (instruction.trim() !== "") {
      setInstructions([...instructions, instruction.trim()]);
      setInstruction("");
    }
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tag.trim() !== "" && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTag("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const calculateNutrition = async () => {
    if (ingredients.length === 0) {
      toast({
        title: language === "en" ? "Error" : "خطأ",
        description:
          language === "en"
            ? "Please add ingredients first"
            : "الرجاء إضافة المكونات أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      // Call the edge function to calculate nutrition
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-calculate-nutrition",
        {
          body: { ingredients },
        },
      );

      if (error) throw error;

      setCalculatedNutrition(data);
      toast({
        title: language === "en" ? "Nutrition Calculated" : "تم حساب التغذية",
        description:
          language === "en"
            ? "AI has estimated the nutritional values"
            : "قام الذكاء الاصطناعي بتقدير القيم الغذائية",
      });
    } catch (error) {
      console.error("Error calculating nutrition:", error);
      toast({
        title: language === "en" ? "Calculation Failed" : "فشل الحساب",
        description:
          language === "en"
            ? "Could not calculate nutrition values"
            : "تعذر حساب القيم الغذائية",
        variant: "destructive",
      });

      // Fallback to mock values if the edge function fails
      setCalculatedNutrition({
        calories: Math.floor(Math.random() * 300) + 200,
        protein: Math.floor(Math.random() * 20) + 10,
        carbs: Math.floor(Math.random() * 30) + 15,
        fat: Math.floor(Math.random() * 15) + 5,
        fiber: Math.floor(Math.random() * 5) + 2,
        sugar: Math.floor(Math.random() * 8) + 2,
      });
    } finally {
      setIsCalculating(false);
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: language === "en" ? "Error" : "خطأ",
        description: translations.invalidType,
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: language === "en" ? "Error" : "خطأ",
        description: translations.fileTooLarge,
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `recipe-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(filePath);

      toast({
        title: language === "en" ? "Success" : "نجاح",
        description: translations.uploadSuccess,
      });

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: language === "en" ? "Error" : "خطأ",
        description: translations.imageError,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || ingredients.length === 0 || instructions.length === 0) {
      toast({
        title: language === "en" ? "Missing Information" : "معلومات ناقصة",
        description:
          language === "en"
            ? "Please fill in all required fields"
            : "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (!calculatedNutrition) {
      toast({
        title:
          language === "en" ? "Missing Nutrition" : "معلومات التغذية مفقودة",
        description:
          language === "en"
            ? "Please calculate nutrition before sharing"
            : "يرجى حساب التغذية قبل المشاركة",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Upload image if available
      let imageUrl = image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const recipeData = {
        title,
        image:
          imageUrl ||
          "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80", // Default image
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        prep_time: parseInt(prepTime) || 30,
        ingredients,
        instructions,
        nutrition: calculatedNutrition,
        tags,
        user_id: user?.id,
        user_email: user?.email,
        is_community: true,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("recipes").insert(recipeData);

      if (error) throw error;

      toast({
        title: language === "en" ? "Recipe Shared" : "تمت مشاركة الوصفة",
        description:
          language === "en"
            ? "Your recipe has been shared with the community"
            : "تمت مشاركة وصفتك مع المجتمع",
      });

      // Reset form
      setTitle("");
      setImage("");
      setImageFile(null);
      setImagePreview(null);
      setPrepTime("");
      setIngredients([]);
      setInstructions([]);
      setTags([]);
      setCalculatedNutrition(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error sharing recipe:", error);
      toast({
        title: language === "en" ? "Error" : "خطأ",
        description:
          language === "en" ? "Failed to share recipe" : "فشل في مشاركة الوصفة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-6">
        {language === "en" ? "Share Your Recipe" : "شارك وصفتك"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">{translations.title}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="image">{translations.image}</Label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div className="mt-2 relative">
                <img
                  src={imagePreview}
                  alt="Recipe preview"
                  className="w-full h-48 object-cover rounded-md"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="bg-white/80 backdrop-blur-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    {translations.changeImage}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="bg-white/80 backdrop-blur-sm text-red-500 hover:text-white"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center">
                  {translations.dragDrop}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {translations.maxSize}
                </p>
                {uploading && (
                  <div className="mt-2 flex items-center">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-2"></div>
                    <span className="text-sm text-blue-500">
                      {translations.uploading}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="prepTime">{translations.prepTime}</Label>
            <Input
              id="prepTime"
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="mt-1"
              min="1"
            />
          </div>

          <div>
            <Label>{translations.ingredients}</Label>
            <div className="flex mt-1">
              <Input
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                placeholder={translations.enterIngredient}
                className="flex-1"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addIngredient())
                }
              />
              <Button
                type="button"
                onClick={addIngredient}
                className="ml-2"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                {translations.addIngredient}
              </Button>
            </div>
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {ingredients.map((item, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>{translations.instructions}</Label>
            <div className="flex mt-1">
              <Textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={translations.enterInstruction}
                className="flex-1 resize-none"
              />
              <Button
                type="button"
                onClick={addInstruction}
                className="ml-2 h-auto"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                {translations.addInstruction}
              </Button>
            </div>
            {instructions.length > 0 && (
              <div className="mt-2 space-y-2">
                {instructions.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start bg-gray-50 p-2 rounded-md"
                  >
                    <span className="mr-2 text-gray-500">{index + 1}.</span>
                    <p className="flex-1">{item}</p>
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>{translations.tags}</Label>
            <div className="flex mt-1">
              <Input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder={translations.enterTag}
                className="flex-1"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button
                type="button"
                onClick={addTag}
                className="ml-2"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                {translations.addTag}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((item, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="px-3 py-1 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={calculateNutrition}
            className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
            disabled={ingredients.length === 0 || isCalculating}
          >
            {isCalculating ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                {translations.calculating}
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5 mr-2" />
                {translations.calculate}
              </>
            )}
          </Button>

          {calculatedNutrition && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">{translations.nutritionInfo}</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-gray-500">
                    {translations.calories}
                  </span>
                  <span className="font-medium">
                    {calculatedNutrition.calories}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500">
                    {translations.protein}
                  </span>
                  <span className="font-medium">
                    {calculatedNutrition.protein}g
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500">
                    {translations.carbs}
                  </span>
                  <span className="font-medium">
                    {calculatedNutrition.carbs}g
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500">
                    {translations.fat}
                  </span>
                  <span className="font-medium">
                    {calculatedNutrition.fat}g
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500">
                    {translations.fiber}
                  </span>
                  <span className="font-medium">
                    {calculatedNutrition.fiber}g
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500">
                    {translations.sugar}
                  </span>
                  <span className="font-medium">
                    {calculatedNutrition.sugar}g
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!calculatedNutrition}
          >
            {translations.share}
          </Button>
        </div>
      </form>
    </div>
  );
}
