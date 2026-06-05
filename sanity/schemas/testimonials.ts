import { defineField, defineType } from "sanity";

export const testimonials = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "clientName",
      title: "Client Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "clientTitle",
      title: "Client Title / Company",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "avatar",
      title: "Client Avatar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "quote",
      title: "Testimonial Quote",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required().min(50).max(400),
    }),
    defineField({
      name: "result",
      title: "Quantified Result",
      type: "string",
      description: 'E.g. "12 booked calls in 21 days" or "$180k pipeline added"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "industry",
      title: "Industry",
      type: "string",
    }),
    defineField({
      name: "rating",
      title: "Star Rating (1–5)",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5),
      initialValue: 5,
    }),
    defineField({
      name: "featured",
      title: "Show on Homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
  ],
  orderings: [
    {
      title: "Newest First",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "clientName",
      subtitle: "result",
      media: "avatar",
    },
    prepare({ title, subtitle, media }) {
      return { title, subtitle, media };
    },
  },
});
