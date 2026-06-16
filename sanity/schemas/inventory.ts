import { defineField, defineType } from "sanity";

export const inventory = defineType({
  name: "inventoryItem",
  title: "Inventory Item",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Listing Title",
      type: "string",
      description: 'E.g. "2019 BMW 3 Series 330i xDrive" or "OEM 19in M-Sport Wheel Set"',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Whole Vehicle", value: "vehicle" },
          { title: "Wheels & Fitment", value: "wheels" },
          { title: "OEM & Performance Parts", value: "parts" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (Rule) => Rule.min(1980).max(2030),
    }),
    defineField({
      name: "make",
      title: "Make",
      type: "string",
    }),
    defineField({
      name: "model",
      title: "Model",
      type: "string",
    }),
    defineField({
      name: "price",
      title: "Asking Price (CAD)",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "mileage",
      title: "Mileage (km)",
      type: "number",
    }),
    defineField({
      name: "condition",
      title: "Condition",
      type: "string",
      options: {
        list: [
          { title: "Excellent", value: "excellent" },
          { title: "Very Good", value: "very-good" },
          { title: "Good", value: "good" },
          { title: "Project / As-Is", value: "as-is" },
        ],
      },
    }),
    defineField({
      name: "inspected",
      title: "150-Point Inspection Passed",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "images",
      title: "Photos",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.max(600),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Available", value: "available" },
          { title: "Pending Pickup", value: "pending" },
          { title: "Sold", value: "sold" },
        ],
      },
      initialValue: "available",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Pickup Location",
      type: "string",
      initialValue: "Montreal, QC",
    }),
    defineField({
      name: "featured",
      title: "Featured Listing",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "listedAt",
      title: "Listed At",
      type: "datetime",
    }),
  ],
  orderings: [
    {
      title: "Newest First",
      name: "listedAtDesc",
      by: [{ field: "listedAt", direction: "desc" }],
    },
    {
      title: "Price: Low to High",
      name: "priceAsc",
      by: [{ field: "price", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "price", media: "images.0" },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `$${subtitle.toLocaleString()} CAD` : "No price set",
        media,
      };
    },
  },
});
