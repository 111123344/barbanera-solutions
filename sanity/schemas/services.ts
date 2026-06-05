import { defineField, defineType } from "sanity";

export const services = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Service Title",
      type: "string",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon Name (Lucide)",
      type: "string",
      description: "Lucide React icon name, e.g. BrainCircuit, TrendingUp, Target",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Short Tagline",
      type: "string",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: "bullets",
      title: "Feature Bullets",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.min(2).max(5),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "featured",
      title: "Featured Service",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "tagline" },
    prepare({ title, subtitle }) {
      return { title, subtitle };
    },
  },
});
