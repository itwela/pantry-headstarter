'use server'

import prisma from "@/lib/db";
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";

const id = 'cfghyjcrgrd';
export interface Message {
    role: "user" | "assistant";
    content: string;
  }

type FormState = {
    message: string;
};

const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 10);
};

const conversationHistory: Record<string, Message[]> = {};

export async function streamRecipes(history: Message[]) {
    const stream = createStreamableValue();
    const model = google("models/gemini-1.5-pro-latest");
  
    const sanitizeText = (text: string,) => text.replace(/[*_~`]/g, '');
  
    const prompt = `You are a smart chef in a "pantry app" that people use to keep track of their food. You have a great personality. Your responses should be
    only a recipe based on your user is asking. This means do Not INCLUDE THE PROMPT IN YOUR RESPONSE.

    - your responses need ot be in this format, NO EXCEPTIONS:
    Search your pantry

    ## (TItle of Recipe)

    Servings: 'Insert serving size here'
    Prep Time: 'Insert preparation time here'

    Ingredients:
    1 ingredient
    2 ingredient
    3 ingredient
    etc...

    Instructions:
    instructions 1
    instructions 2
    instructions 3
    etc...

        
    Here's the conversation so far:
    
    ${history.map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${sanitizeText(msg.content)}`).join('\n')}
    
    Your response should combine all these elements in a balanced way.`;
    
    (async () => {
      const { textStream } = await streamText({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9, 
        topP: 0.85,
        topK: 40,
      });
  
      for await (const text of textStream) {
        stream.update(sanitizeText(text));
      }
  
      stream.done();
    })().then(() => {});
  
    return {
      messages: history,
      newMessage: stream.value,
    };
  }


export async function submitPantryItems(formData: FormData, formState: FormState) {
    await new Promise((resolve) => setTimeout(resolve, 250));
;
    const item_name = formData.get("item-name") as string;
    const item_quantity = Number(formData.get("item-quantity"));
    const item_image_pexals = formData.get("item-image-pexals") as string;

    try {
        await prisma?.item.create({
            data: {
                userId: id,
                ItemTitle: item_name,
                ItemQuantity: item_quantity,
                ItemImagePexals: item_image_pexals,
            },
        });

        revalidatePath('/');

        return {
            message: 'Message created',
        };

    } catch (error) {
        // Handle the error
        return {
            message: 'Something went wrong',
        };
    }
}

export async function updatePantryItems(formData: FormData, formState: FormState) {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const itemID = formData.get('item-id') as string;
    const item_name = formData.get("item-name") as string;
    const item_quantity = Number(formData.get("item-quantity"));
    const item_image_pexals = formData.get("item-image-pexals") as string;

    try {
        await prisma?.item.update({
            where: {
                id: itemID
            },
            data: {
                ItemTitle: item_name,
                ItemQuantity: item_quantity,
                ItemImagePexals: item_image_pexals,
            },
        });

        revalidatePath('/');

        return {
            message: 'Message created',
        };

    } catch (error) {
        // Handle the error
        return {
            message: 'Something went wrong',
        };
    }
}


export async function getPantryItems() {
    try {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const data = prisma?.item.findMany({
            where: {
                userId: id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        revalidatePath('/');
        return data;

    } catch (error) {
        console.error('Error fetching pantry items:', error);
        return null;
    }
}

export async function deletePantryItems(formData: FormData, formState: FormState) {
    try {
        await new Promise((resolve) => setTimeout(resolve, 250));
        
        const itemID = formData.get('item-id') as string;
        console.log(itemID)

        const data = prisma?.item.deleteMany({
            where: {
                id: itemID
            },
        });

        revalidatePath('/');

        return data;
    } catch (error) {
        console.error('Error fetching pantry items:', error);
        return null;
    }
}
