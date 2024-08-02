'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { FaMinus, FaPlus } from "react-icons/fa";
import { submitPantryItems, updatePantryItems } from "../actions";
import { usePantry } from "../contextProviders/pantryContext";
import { FaCamera } from "react-icons/fa";
import { createClient } from 'pexels';

interface PantryItem {
    id: string;
    ItemTitle: string;
    ItemQuantity: number;
    ItemCalories: number | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}

export default function ClientAdd({ items }: { items: PantryItem[] }) {

    // global states
    const { name, setName } = usePantry();
    const { isVisible, setIsVisible } = usePantry();
    const { currentId, setCurrentId } = usePantry();
    const { currentItem, setCurrentItem } = usePantry();
    const { currentQuantity, setCurrentQuantity} = usePantry();


    // local states
    const [itemName, setItemName] = useState("");
    const [itemQuantity, setItemQuantity] = useState(0);
    const [pantryItems, setPantryItems] = useState<Array<{
        id: string;
        ItemTitle: string;
        ItemQuantity: number;
        ItemCalories: number | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>>([]);
    const [file, setFile] = useState<File>();
    const [progress, setProgress] = useState(0);

    // types
    type FormState = {
        message: string;
    };

    // local functions
    const handleSubmit = async (prevState: FormState, formData: FormData): Promise<FormState> => {
        // Search for photo before submitting
        const photoUrl = await findPhotos();
        if (photoUrl) {
            formData.set('item-image-pexals', photoUrl);
        }
        const newItem = await submitPantryItems(formData, addFormState);
        return { message: 'Submission successful!' };    };

    const handleUpdate = async (prevState: FormState, formData: FormData): Promise<FormState> => {
        const newItem = await updatePantryItems(formData, updateFormState);
        return { message: 'Submission successful!' };
    };
    
    const [addFormState, addAction] = useFormState(handleSubmit, {
        message: '',
    });

    const [updateFormState, updaateAction] = useFormState(handleUpdate, {
        message: '',
    });

    const AddButton = () => {
        const status = useFormStatus();
        
        if (status.pending != true) {
          return (
            <Button className="w-3/4 sm:w-1/2 rounded-full p-6 bg-green-700 hover:bg-green-600" type="submit">Add</Button>
        )
        }
    
        if (status.pending === true) {
          return (
            <Button className="w-3/4 sm:w-1/2 rounded-full p-6 bg-green-700 hover:bg-green-600" type="submit">Adding...</Button>
        )
        }
      }
    
    const UpdateButton = () => {
    const status = useFormStatus();
    
    if (status.pending != true) {
        return (
        <Button className="w-3/4 sm:w-1/2 rounded-full p-6 bg-green-700 hover:bg-green-600" type="submit">Update</Button>
    )
    }

    if (status.pending === true) {
        return (
        <Button className="w-3/4 sm:w-1/2 rounded-full p-6 bg-green-700 hover:bg-green-600" type="submit">Updating...</Button>
    )
    }
    }

    const HandleOpenAddItem = () => {
        setCurrentId?.('');
        setCurrentItem?.('');
        setCurrentQuantity?.(0);
        setIsVisible(true);
    }

    const HandleCLoseAddItem = () => {
        setCurrentId?.('');
        setCurrentItem?.('');
        setCurrentQuantity?.(0);
        setIsVisible(false);
    }

      // Pexels API
  const client = createClient('8U6Se7vVT3H9tx1KPZAQTkDUSW0IKi3ldgBTVyh3W9NFF7roIpZxktzY');
  const query = itemName as string;
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const findPhotos = async (): Promise<string | null> => {
    try {
        const response = await client.photos.search({ query, per_page: 1 });
        if ('photos' in response) {
            const matchphoto = response.photos[0].src.medium;
            setPhotoUrl(matchphoto);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return matchphoto; // Return the photo URL
        }
    } catch (error) {
        console.error('Error in fetching photos:', error);
    }
    return null; // Return null if no photo found or error occurs
};

  // --- Pexels End ---


    return (
        <>


            {/* add */}
            {currentItem == '' && currentQuantity == 0 && (
                <AnimatePresence>
                {isVisible && (
                    <motion.form className="flex place-content-center w-full absolute bottom-[20%] left-0"
                        initial={{ 
                            opacity: 0,
                            y: 100
                        }}
                        animate={{ 
                            opacity: 1,
                            y: 0 
                        }}
                        exit={{ 
                            opacity: 0,
                            y: 10
                        }}
                        action={addAction}
                    >
                            <div className="w-full h-full flex flex-col gap-4 place-items-center">
                        
                                <Input type="hidden" name="item-image-pexals" value={photoUrl ?? ''} />

                                <div className="relative w-3/4 sm:w-1/2 h-[200px]">
                                    <Textarea className="w-full p-8 bg-neutral-600 h-full"
                                        value={itemName}
                                        name="item-name"
                                        onChange={(e) => setItemName?.(e.target.value)}
                                        placeholder="What food would you like to add to your pantry?"
                                    />
                                    {/* <div className="hover:opacity-80 cursor-pointer bg-white flex place-content-center place-items-center rounded-full w-[40px] h-[40px] absolute bottom-5 right-5">
                                       <Input onChange={(e) => setFile?.(e.target.files?.[0])} className="w-full h-full opacity-0 absolute z-[2]"  type="file" accept="image/*" capture="user" name="item-image-user" />
                                       <FaCamera className="text-neutral-600 absolute z-[1]" size={15} /> 
                                    </div> */}
                                </div>

                                <Input className="w-3/4 sm:w-1/2 border border-transparent p-8 rounded-xl bg-neutral-600"
                                        type="number"
                                        name="item-quantity"
                                        value={itemQuantity}
                                        onChange={(e) => setItemQuantity?.(parseInt(e.target.value))}
                                        placeholder="How many?"
                                />

                                <AddButton />

                            </div>
                    </motion.form>
                )}
                </AnimatePresence>
            )}

            {/* update */}
            {currentItem != '' && currentQuantity != 0 && (
                <AnimatePresence>
                {isVisible && (
                    <motion.form className="flex place-content-center w-full absolute bottom-[20%] left-0"
                        initial={{ 
                            opacity: 0,
                            y: 100
                        }}
                        animate={{ 
                            opacity: 1,
                            y: 0 
                        }}
                        exit={{ 
                            opacity: 0,
                            y: 10
                        }}
                        action={updaateAction}
                    >
                            <div className="w-full h-full flex flex-col gap-4 place-items-center">
                                
                                {(currentId?.length ?? 0) > 1 && (
                                    <Input type="hidden" value={currentId} name="item-id"/>
                                )}

                                <Input type="hidden" value={currentId} name="item-id"/>

                                <div className="relative w-3/4 sm:w-1/2 h-[200px]">
                                    <Textarea className="w-full p-8 bg-neutral-600 h-full"
                                        value={currentItem}
                                        name="item-name"
                                        onChange={(e) => setCurrentItem?.(e.target.value)}
                                        placeholder="What food would you like to add to your pantry?"
                                    />
                                    {/* <div className="hover:opacity-80 cursor-pointer bg-white flex place-content-center place-items-center rounded-full w-[40px] h-[40px] absolute bottom-5 right-5">
                                       <Input onChange={(e) => setFile?.(e.target.files?.[0])} className="w-full h-full opacity-0 absolute z-[2]"  type="file" accept="image/*" capture="user" name="item-image-user" />
                                       <FaCamera className="text-neutral-600 absolute z-[1]" size={15} /> 
                                    </div> */}
                                </div>
                                <Input className="w-3/4 sm:w-1/2 border border-transparent p-8 rounded-xl bg-neutral-600"
                                        type="number"
                                        name="item-quantity"
                                        value={currentQuantity}
                                        onChange={(e) => setCurrentQuantity?.(parseInt(e.target.value))}
                                        placeholder="How many?"
                                />

                                <UpdateButton />

                            </div>
                    </motion.form>
                )}
                </AnimatePresence>               
            )}



            {!isVisible && (
            <div className="w-1/4 flex place-content-center absolute bottom-[10%] left-0">
                <Button className={`w-3/4 sm:w-1/2 rounded-full p-6 ${isVisible ? 'bg-red-700 hover:bg-red-600' : 'bg-green-700 hover:bg-green-600'} `} onClick={() => HandleOpenAddItem()}>{isVisible ? <FaMinus size={15} /> : <FaPlus size={15} />}</Button>
            </div>
            )}

            {isVisible && (
            <div className="w-1/4 flex place-content-center absolute bottom-[10%] left-0">
                <Button className={`w-3/4 sm:w-1/2 rounded-full p-6 ${isVisible ? 'bg-red-700 hover:bg-red-600' : 'bg-neutral-700 hover:bg-neutral-600'} `} onClick={() => HandleCLoseAddItem()}>{isVisible ? <FaMinus size={15} /> : <FaPlus size={15} />}</Button>
            </div>
            )}
        </>
    )
}