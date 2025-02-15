'use client'
import { Input } from "@/components/ui/input";
import ClientAdd from "./C_add";
import { usePantry } from "../contextProviders/pantryContext";
import { AnimatePresence, motion } from "framer-motion";
import { getPantryItems, deletePantryItems, Message, streamRecipes } from "../actions";
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
import { readStreamableValue } from "ai/rsc";

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
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [conversation, setConversation] = useState<Message[]>([]);
    const [recipe, setRecipe] = useState<string>('');
    const handleItemClick = (itemId: string) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(item => item !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

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

    const startChat = async () => {
        const input = "I need you to come up with one recipe based on the items in my pantry. here are the items: " + selectedItems.join(', ');
        // console.log(input)
        const { messages, newMessage } = await streamRecipes([
            ...conversation,
            { role: "user", content: input },
        ]);

        let textContent = "";

        for await (const delta of readStreamableValue(newMessage)) {
            textContent = `${textContent}${delta}`;

            // setConversation([
            //     ...messages,
            //     { role: "assistant", content: textContent },
            // ]);

            setRecipe(textContent);
        }


    }

    function formatRecipe(messageContent: string) {
        // Split message content by lines
        const lines = messageContent.split('\n').filter(line => line.trim() !== '');
    
        // Extract different parts of the recipe
        let recipeContent = `
            <div>
        `;
    
        const titleLine = lines.find(line => line.startsWith('##'));
        if (titleLine) {
            recipeContent += `<h1>${titleLine}</h1><br>`;
        }
    
        const servingsLine = lines.find(line => line.startsWith('Servings:'));
        if (servingsLine) {
            recipeContent += `<p><strong>${servingsLine}</strong></p><br>`;
        }
    
        const prepTimeLine = lines.find(line => line.startsWith('Prep Time:'));
        if (prepTimeLine) {
            recipeContent += `<p><strong>${prepTimeLine}</strong></p><br>`;
        }
    
        const ingredientsIndex = lines.findIndex(line => line.startsWith('Ingredients:'));
        const instructionsIndex = lines.findIndex(line => line.startsWith('Instructions:'));
    
        if (ingredientsIndex !== -1 && instructionsIndex !== -1) {
            const ingredientsLines = lines.slice(ingredientsIndex + 1, instructionsIndex).join('<br>');
            recipeContent += `<h3>Ingredients:</h3><p>${ingredientsLines}</p><br>`;
    
            const instructionsLines = lines.slice(instructionsIndex + 1)
                .map((line, index) => `${line}</p><br>`)
                .join('');
            recipeContent += `<h3>Instructions:</h3><div>${instructionsLines}</div>`;
        }
    
        recipeContent += `
            </div>
        `;
    
        return recipeContent;
    }
    

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
                <div className="flex justify-between w-full h-max">     
                <Input
                id='lcs3'
                        type="text"
                        placeholder="Search your pantry"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-1/2 place-self-start outline-transparent flex place-items-center outline p-2 rounded-xl px-4"
                />
                {selectedItems.length > 0 && (                    
                    <AnimatePresence>
                        <motion.div 
                            onClick={startChat}
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
                                        
                        className="cursor-pointer mr-5 w-[300px] h-max p-2 bg-white rounded-xl text-black flex place-content-center place-items-center">
                            <p className="text-center select-none">Generate recipies</p>
                        </motion.div>
                    </AnimatePresence>
                )}

                </div>
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
                            
                            key={item.id} className={`w-[100%] h-[200px] outline outline-[1px] relative place-items-end rounded-xl flex gap-4 justify-between p-3 ${selectedItems.includes(item.ItemTitle) ? 'outline-green-500 outline-[4px]' : ''} ${currentItem === item.ItemTitle ? 'outline-blue-500' : ''}`} style={{ backgroundImage: `url(${item.ItemImagePexals as string})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}>                
                                <span className="cursor-pointer select-none bg-neutral-600 text-white rounded-xl px-3 py-1 font-bold" onClick={() => handleItemClick(item.ItemTitle)}  >{item.ItemTitle}</span>
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

                    {/* generate recipies */}
                    {selectedItems.length > 0 && (
                        <AnimatePresence>
                            <motion.div
                            onClick={startChat} 
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
                            className="cursor-pointer w-[100%] h-[200px] bg-white rounded-xl text-black flex place-content-center place-items-center">
                                <p className="text-center select-none">Generate recipies</p>
                            </motion.div>
                        </AnimatePresence>
                    )}
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

            {/* {conversation && ( */}
            {recipe.length > 0 && (
                <motion.div className="flex place-content-center w-full absolute bottom-[20%] left-0"
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
                >
                    <div className="w-full h-full flex flex-col gap-4 place-items-center">
                        <div className="relative w-3/4 bg-neutral-600 sm:w-1/2 h-[400px] overflow-y-scroll rounded-xl p-4 py-8">
                            
                            <motion.div 
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setRecipe('')} className="cursor-pointer w-max p-3 flex place-items-center h-[20px] bg-red-500 absolute top-3 right-3 rounded-xl">
                                <span>Close</span>
                            </motion.div>

                            <div className="w-full h-[400px] overflow-y-scroll">
                                {/* {conversation.map((message, index) => (
                                    <div className='w-[90%] m-2 rounded-md p-2' key={index}>
                                        <span>
                                            <div dangerouslySetInnerHTML={{ __html: formatRecipe(message.content) }} />
                                        </span>
                                    </div>
                                ))} */}
                                  <div className='w-[90%] m-2 rounded-md p-2'>
                                        <span>
                                            <div dangerouslySetInnerHTML={{ __html: formatRecipe(recipe) }} />
                                        </span>
                                    </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}


            


        </>
    )
}