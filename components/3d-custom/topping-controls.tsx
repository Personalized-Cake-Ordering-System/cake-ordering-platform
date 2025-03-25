// "use client"
// import React from 'react';
// import { useCustomizationStore } from '../shared/client/stores/customization';
// import * as THREE from 'three';
// import { Sprout, Trash2, Scale, Cookie } from 'lucide-react';

// export function ToppingControls() {
//     const { selectedPart, toppings, addToppingToPart, removeToppingFromPart } = useCustomizationStore();

//     const toppingTypes = [
//         {
//             id: 'sprinkles',
//             name: 'Sprinkles',
//             icon: '🍬',
//             color: '#FF69B4'
//         },
//         {
//             id: 'chocolate-chips',
//             name: 'Chocolate Chips',
//             icon: '🍫',
//             color: '#8B4513'
//         },
//         {
//             id: 'nuts',
//             name: 'Nuts',
//             icon: '🥜',
//             color: '#DEB887'
//         }
//     ];

//     if (!selectedPart) return null;

//     const handleAddTopping = (type:any) => {
//         addToppingToPart(selectedPart, {
//             type: type.id,
//             density: 1,
//             size: 1,
//             color: type.color,
//             position: new THREE.Vector3(0, 0, 0)
//         });
//     };

//     return (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-100">
//                 <div className="flex items-center gap-2">
//                     <Cookie className="w-5 h-5 text-blue-500" />
//                     <h3 className="text-lg font-semibold text-gray-900">Toppings</h3>
//                 </div>
//             </div>

//             <div className="p-6 space-y-6">
//                 <div className="grid grid-cols-3 gap-3">
//                     {toppingTypes.map((type) => (
//                         <button
//                             key={type.id}
//                             onClick={() => handleAddTopping(type)}
//                             className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
//                         >
//                             <span className="text-2xl mb-2">{type.icon}</span>
//                             <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
//                                 {type.name}
//                             </span>
//                         </button>
//                     ))}
//                 </div>

//                 {toppings[selectedPart]?.length > 0 && (
//                     <div className="space-y-4">
//                         <div className="flex items-center gap-2">
//                             <Sprout className="w-4 h-4 text-gray-500" />
//                             <h4 className="text-sm font-medium text-gray-700">Applied Toppings</h4>
//                         </div>
//                         <div className="space-y-3">
//                             {toppings[selectedPart]?.map((topping, index) => (
//                                 <div
//                                     key={index}
//                                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
//                                 >
//                                     <div className="flex items-center gap-3">
//                                         <span className="text-xl">
//                                             {toppingTypes.find(t => t.id === topping.type)?.icon}
//                                         </span>
//                                         <span className="text-sm font-medium text-gray-700">
//                                             {toppingTypes.find(t => t.id === topping.type)?.name}
//                                         </span>
//                                     </div>
//                                     <div className="flex items-center gap-4">
//                                         <div className="flex items-center gap-2">
//                                             <Scale className="w-4 h-4 text-gray-400" />
//                                             <input
//                                                 type="range"
//                                                 min="0.1"
//                                                 max="2"
//                                                 step="0.1"
//                                                 value={topping.size}
//                                                 onChange={(e) => {
//                                                     const newToppings = [...toppings[selectedPart]];
//                                                     newToppings[index] = {
//                                                         ...topping,
//                                                         size: parseFloat(e.target.value)
//                                                     };
//                                                     addToppingToPart(selectedPart, newToppings[index]);
//                                                 }}
//                                                 className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
//                                             />
//                                             <span className="w-12 text-sm text-gray-600 tabular-nums">
//                                                 {topping.size.toFixed(1)}x
//                                             </span>
//                                         </div>
//                                         <button
//                                             onClick={() => removeToppingFromPart(selectedPart, index)}
//                                             className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
//                                             aria-label="Remove topping"
//                                         >
//                                             <Trash2 className="w-4 h-4" />
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default ToppingControls;