"use client";
import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { env } from "@/lib/env";

interface FormData {
  name: string;
  description: string;
  prompt: string;
  pricingModel: "weekly" | "monthly" | "yearly" | "per-message" | "free";
  price: number | string;
}

export default function CreateAgent() {
  const router = useRouter();
  const { address } = useAccount();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    prompt: "",
    pricingModel: "free",
    price: 0,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

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
            | "per-message"
            | "free";
          break;
        case "name":
        case "description":
        case "prompt":
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

  const validateForm = useCallback(() => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.prompt.trim()) {
      newErrors.prompt = "Prompt is required";
    }
    if (Number(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const createAgent = useCallback(async () => {
    try {
      if (!address) return;
      const response = await fetch(`${env.backendUrl}/api/agent`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ownerAddress: address,
          name: formData.name,
          description: formData.description,
          prompt: formData.prompt,
          isPublic: true,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Agent data is here", data);
        return;
      }
      console.log("Unable to create agent");
    } catch (e) {
      console.log(e);
    }
  }, [formData, address]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        // Handle form submission
        console.log("Form submitted:", formData);
        await createAgent();
        // router.push("/marketplace");
      }
    },
    [formData, createAgent, validateForm]
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">Create Doti Agent</h1>
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
          <label className="block text-sm font-medium mb-2">Description</label>
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
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Propmt Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Prompt</label>
          <textarea
            name="prompt"
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
            <p className="mt-1 text-sm text-red-500">{errors.prompt}</p>
          )}
        </div>

        {/* Pricing Model */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Pricing Model
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, pricingModel: "free" }))
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.pricingModel === "free"
                  ? "bg-primary text-textLight"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  pricingModel: "per-message",
                }))
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.pricingModel === "per-message"
                  ? "bg-primary text-textLight"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              Per Message/Action
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, pricingModel: "weekly" }))
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.pricingModel === "weekly"
                  ? "bg-primary text-textLight"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, pricingModel: "monthly" }))
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.pricingModel === "monthly"
                  ? "bg-primary text-textLight"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, pricingModel: "yearly" }))
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.pricingModel === "yearly"
                  ? "bg-primary text-textLight"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              Yearly
            </button>
          </div>

          {formData.pricingModel !== "free" && (
            <div>
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
          )}
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
  );
}
