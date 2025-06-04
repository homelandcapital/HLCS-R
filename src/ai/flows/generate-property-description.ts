'use server';

/**
 * @fileOverview A property description generator AI agent.
 *
 * - generatePropertyDescription - A function that handles the property description generation process.
 * - GeneratePropertyDescriptionInput - The input type for the generatePropertyDescription function.
 * - GeneratePropertyDescriptionOutput - The return type for the generatePropertyDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePropertyDescriptionInputSchema = z.object({
  propertyType: z.string().describe('The type of property (e.g., house, apartment, condo).'),
  location: z.string().describe('The location of the property (city, neighborhood).'),
  bedrooms: z.number().describe('The number of bedrooms in the property.'),
  bathrooms: z.number().describe('The number of bathrooms in the property.'),
  squareFootage: z.number().describe('The square footage of the property.'),
  keyFeatures: z.string().describe('A comma-separated list of key features of the property (e.g., hardwood floors, granite countertops, stainless steel appliances).'),
  additionalDetails: z.string().optional().describe('Any additional details about the property.'),
});
export type GeneratePropertyDescriptionInput = z.infer<typeof GeneratePropertyDescriptionInputSchema>;

const GeneratePropertyDescriptionOutputSchema = z.object({
  description: z.string().describe('A compelling property description generated from the input details.'),
});
export type GeneratePropertyDescriptionOutput = z.infer<typeof GeneratePropertyDescriptionOutputSchema>;

export async function generatePropertyDescription(input: GeneratePropertyDescriptionInput): Promise<GeneratePropertyDescriptionOutput> {
  return generatePropertyDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePropertyDescriptionPrompt',
  input: {schema: GeneratePropertyDescriptionInputSchema},
  output: {schema: GeneratePropertyDescriptionOutputSchema},
  prompt: `You are a real estate agent specializing in writing compelling property descriptions.

  Using the provided details, write a captivating property description that highlights the key features and benefits of the property.
  Your description should be engaging and persuasive, encouraging potential buyers to inquire about the listing.

  Property Type: {{{propertyType}}}
  Location: {{{location}}}
  Bedrooms: {{{bedrooms}}}
  Bathrooms: {{{bathrooms}}}
  Square Footage: {{{squareFootage}}}
  Key Features: {{{keyFeatures}}}
  Additional Details: {{{additionalDetails}}}
  `,
});

const generatePropertyDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePropertyDescriptionFlow',
    inputSchema: GeneratePropertyDescriptionInputSchema,
    outputSchema: GeneratePropertyDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
