"use client";
import { useCallback, useState } from "react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  description: string;
  prompt: string;
  categories: string[];
  icon: string;
  customImage: File | null;
  pricingModel: "weekly" | "monthly" | "yearly" | "per-message";
  price: number | string;
}

const allCategories = [
  "Customer Support",
  "Sales",
  "Technical Support",
  "Data Analysis",
  "Content Creation",
  "Meetings",
  "Research",
  "Education",
  "Development",
  "Project Management",
  "Legal",
  "HR",
];

const icons = [
  "🤖",
  "💼",
  "🛠️",
  "📊",
  "✍️",
  "🎥",
  "🔍",
  "📚",
  "💻",
  "📋",
  "🎮",
  "🎨",
  "🎵",
  "🎬",
  "📱",
  "🌐",
  "🔧",
  "📈",
  "💡",
  "🎯",
  "🎪",
  "🎭",
  "🎪",
  "🎨",
  "🎭",
  "🎪",
  "🎨",
  "🎭",
  "🎪",
  "🎨",
  // Add more icons as needed
];

export default function CreateAgent() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    prompt: "",
    categories: [],
    icon: "",
    customImage: null,
    pricingModel: "monthly",
    price: 0,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev };
      switch (name) {
        case "price":
          newData.price = Number(value);
          break;
        case "pricingModel":
          newData.pricingModel = value as
            | "weekly"
            | "monthly"
            | "yearly"
            | "per-message";
          break;
        case "name":
        case "description":
        case "icon":
          newData[name] = value;
          break;
      }
      return newData;
    });
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleIconSelect = (icon: string) => {
    setFormData((prev) => ({
      ...prev,
      icon,
      customImage: null,
    }));
    setPreviewUrl("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        customImage: file,
        icon: "",
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.categories.length === 0) {
      newErrors.categories = ["At least one category is required"];
    }
    if (!formData.icon && !formData.customImage) {
      newErrors.icon = "Either an icon or custom image is required";
    }
    if (Number(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle form submission
      console.log("Form submitted:", formData);
      // Redirect to explore page after successful submission
      router.push("/explore");
    }
  };

  const createApp = useCallback(() => {
    const;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SideBar isOpen={sidebarOpen} />
      <Header
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className={`pt-20 pb-20 md:pb-0 transition-all duration-200 ${
          sidebarOpen ? "md:ml-56" : "md:ml-16"
        }`}
      >
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">
              Create Doti Agent
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.name
                    ? "border-red-500"
                    : "border-neutral-200 dark:border-neutral-800"
                } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Enter agent name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.description
                    ? "border-red-500"
                    : "border-neutral-200 dark:border-neutral-800"
                } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Enter agent description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Propmt Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <textarea
                name="description"
                value={formData.prompt}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.prompt
                    ? "border-red-500"
                    : "border-neutral-200 dark:border-neutral-800"
                } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="I an agent the help with workout plans"
              />
              {errors.prompt && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Categories Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.categories.includes(category)
                        ? "bg-primary text-textLight"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {errors.categories && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.categories[0]}
                </p>
              )}
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <div className="grid grid-cols-8 gap-2 mb-4">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleIconSelect(icon)}
                    className={`p-2 rounded-lg text-2xl transition-colors ${
                      formData.icon === icon
                        ? "bg-primary text-textLight"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Custom Image Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Or Upload Custom Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                    <Upload size={20} />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {previewUrl && (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl("");
                          setFormData((prev) => ({
                            ...prev,
                            customImage: null,
                          }));
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {errors.icon && (
                <p className="mt-1 text-sm text-red-500">{errors.icon}</p>
              )}
            </div>

            {/* Pricing Model */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pricing Model
              </label>
              <div className="flex gap-4">
                <select
                  name="pricingModel"
                  value={formData.pricingModel}
                  onChange={handleInputChange}
                  className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="per-message">Per Message/Action</option>
                </select>

                <div className="flex-1">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.price
                        ? "border-red-500"
                        : "border-neutral-200 dark:border-neutral-800"
                    } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="Enter price in ETH"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors"
              >
                Create Agent
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
