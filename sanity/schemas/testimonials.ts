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
      title: "Vehicle / Parts Purchased",
      type: "string",
      description: 'E.g. "2018 Audi A4 Quattro" or "OEM 18in Wheel & Tire Set"',
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
      description: 'E.g. "Picked up within 24 hours of inquiry" or "Saved $3,200 vs dealership pricing"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "transactionType",
      title: "Transaction Type",
      type: "string",
      options: {
        list: [
          { title: "Vehicle Purchase", value: "vehicle" },
          { title: "Parts / Wheels Purchase", value: "parts" },
          { title: "Sold Their Vehicle", value: "sold-vehicle" },
        ],
      },
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
