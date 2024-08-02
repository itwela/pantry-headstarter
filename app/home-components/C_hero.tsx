'use client'
import { Input } from "@/components/ui/input";
import ClientAdd from "./C_add";
import { usePantry } from "../contextProviders/pantryContext";
import { AnimatePresence, motion } from "framer-motion";
import { getPantryItems, deletePantryItems } from "../actions";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useFormState, useFormStatus } from "react-dom";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { FaSearch } from "react-icons/fa";
import Image  from "next/image";

// local states
interface PantryItem {
    id: string;
    ItemTitle: string;
    ItemQuantity: number;
    ItemCalories: number | null;
    ItemImagePexals: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}


export default function ClientHero( { items }: { items: PantryItem[] } ) {

    // global states
    const { name, setName } = usePantry(); 
    const { currentId, setCurrentId } = usePantry();
    const { currentItem, setCurrentItem } = usePantry();
    const { currentQuantity, setCurrentQuantity} = usePantry();
    const { isVisible, setIsVisible } = usePantry();

    // local states
    const [searchQuery, setSearchQuery] = useState('');
    const filteredPosts = items.filter(item =>
        item.ItemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.ItemQuantity !== undefined && item.ItemQuantity.toString().includes(searchQuery))
    );

    // Local functions
    const handleDelete = async (prevState: FormState, formData: FormData): Promise<FormState> => {
        const itemId = formData.get('item-id') as string
        await deletePantryItems(formData, formState);
        return { message: 'Submission successful!' };
    };

    const handleSearchChange = (event: any) => {
        setSearchQuery(event.target.value);
    };

    const DeleteButton = () => {
        const status = useFormStatus();
        
        if (status.pending != true) {
          return (
            <button className="hover:opacity-90 p-2 font-bold rounded bg-red-700 hover:opacity-90 w-full" type="submit">Delete</button>
          )
        }
    
        if (status.pending === true) {
          return (
            <button className="hover:opacity-50 p-2 font-bold rounded bg-red-700 animate-pulse w-full" disabled>Deleting..</button>
          )
        }
      }

    const toggleAdd = (itemId: string, itemName: string, itemQuantity: number) => {
        setCurrentId?.(itemId);
        setCurrentItem?.(itemName);
        setCurrentQuantity?.(itemQuantity);
        setIsVisible(!isVisible);
    }

    const [formState, action] = useFormState(handleDelete, {
        message: '',
    });

    // useEffects
    useEffect(() => {
        const fetchItems = async () => {
            const items = await getPantryItems();
        };
        fetchItems();
    }, []);
    // }, [pantryItems]);
    
    // types
    type FormState = {
        message: string;
    };

      // --------------


    return (
        <>

            {items?.length > 0 && (
                
                <div className="w-full overflow-hidden min-h-full flex flex-col  gap-4 p-5">
                <h1 className="place-self-start flex text-3xl font-bold select-none">Hello {name}.</h1>
                <Input
                        id='lcs3'
                        type="text"
                        placeholder="Search your pantry"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-1/2 place-self-start outline-transparent flex place-items-center outline p-2 rounded-xl px-4"
                    />

                <div className="pt-[5vh]  w-full h-[80vh] sm:h-[50vh] overflow-y-scroll p-5 place-items-center grid grid-cols-1 sm:grid-cols-4 gap-[6px]">
                    {filteredPosts.map((item, index) => (
                        <>
                        <AnimatePresence>
                            <motion.div
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
                            whileHover={{ 
                                scale: 1.05 
                            }}
                            
                            key={item.id} className="w-[100%] h-[200px] outline outline-[1px] relative place-items-end rounded-xl flex gap-4 justify-between p-3" style={{ backgroundImage: `url(${item.ItemImagePexals as string})` }}>                
                                <span className="cursor-pointer select-none bg-neutral-600 text-white rounded-xl px-3 py-1 font-bold" onClick={() => toggleAdd(item.id, item.ItemTitle, item.ItemQuantity)}>{item.ItemTitle}</span>
                                <span className="cursor-pointer select-none bg-neutral-600 text-white rounded-xl px-3 py-1 font-bold">{item.ItemImagePexals}</span>
                                {/* debug test */}
                                <motion.span onClick={() => toggleAdd(item.id, item.ItemTitle, item.ItemQuantity)} className="absolute select-none cursor-pointer top-[-3%] left-[-3%] px-3 rounded-full bg-white text-neutral-700 font-bold"
                                    whileHover={{ scale: 1.2 }}
                                    >
                                        {item.ItemQuantity}
                                </motion.span>
                                <Popover>
                                    <PopoverTrigger className="p-2"><FaTrash /></PopoverTrigger>
                                    <PopoverContent className="w-max flex flex-col gap-2 bg-neutral-600 border-transparent rounded-xl text-white">
                                        <div className="flex w-full flex flex-col place-items-center place-content-center gap-2">
                                        <h2 className="text-[0.6rem]"><strong>Are you sure?</strong> </h2>
                                        <h2 className="text-[0.6rem]">You can <strong>not</strong> undo this action.</h2>
                                        <form className="w-full" action={action}>
                                            <Input type="hidden" name="item-id" value={item.id} />
                                            <DeleteButton />
                                        </form>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </motion.div>
                        </AnimatePresence>
                        </>
                    ))}
                    <ClientAdd items={items} />
                </div>
            </div>
            )}

            {items?.length === 0 && (
                <>
                    <h1>Welcome to your pantry.</h1>
                    <h2 className="text-3xl font-bold">Please click the green button to get started.</h2>
                    <ClientAdd items={items} />
                </>
            )}
        </>
    )
}
