'use server'

import prisma from "@/lib/db";
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const id = 'cfghyjcrgrd';


type FormState = {
    message: string;
};

const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 10);
};


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
