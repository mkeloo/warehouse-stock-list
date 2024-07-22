// import React, { useState, useEffect } from 'react';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { STOCK } from '../constants/stock.json';
// import { X } from 'lucide-react';

// const List = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [quantities, setQuantities] = useState({});
//   const [newStock, setNewStock] = useState({
//     companyName: '',
//     item: '',
//     quantity: 0,
//   });
//   const [stock, setStock] = useState(() => {
//     const savedStock = localStorage.getItem('stock');
//     return savedStock ? JSON.parse(savedStock) : STOCK;
//   });

//   useEffect(() => {
//     const savedQuantities = localStorage.getItem('quantities');
//     if (savedQuantities) {
//       setQuantities(JSON.parse(savedQuantities));
//     }
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('stock', JSON.stringify(stock));
//     localStorage.setItem('quantities', JSON.stringify(quantities));
//   }, [stock, quantities]);

//   const handleSearchChange = (event) => {
//     setSearchTerm(event.target.value);
//   };

//   const handleQuantityChange = (companyName, item, event) => {
//     setQuantities({
//       ...quantities,
//       [companyName]: {
//         ...quantities[companyName],
//         [item]: event.target.value,
//       },
//     });
//   };

//   const handleNewStockChange = (event) => {
//     const { name, value } = event.target;
//     setNewStock((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleAddNewStock = () => {
//     const { companyName, item, quantity } = newStock;
//     if (companyName && item && quantity > 0) {
//       const updatedStock = [...stock];
//       const companyIndex = updatedStock.findIndex(
//         (company) => company.companyName === companyName
//       );

//       if (companyIndex >= 0) {
//         updatedStock[companyIndex].items.push(item);
//       } else {
//         updatedStock.push({ companyName, items: [item] });
//       }

//       setStock(updatedStock);
//       setQuantities({
//         ...quantities,
//         [companyName]: {
//           ...quantities[companyName],
//           [item]: quantity,
//         },
//       });
//       setNewStock({ companyName: '', item: '', quantity: 0 });
//     }
//   };

//   const handleDeleteItem = (companyName, item) => {
//     const updatedStock = stock
//       .map((company) => {
//         if (company.companyName === companyName) {
//           return {
//             ...company,
//             items: company.items.filter((i) => i !== item),
//           };
//         }
//         return company;
//       })
//       .filter((company) => company.items.length > 0);

//     const updatedQuantities = { ...quantities };
//     if (updatedQuantities[companyName]) {
//       delete updatedQuantities[companyName][item];
//       if (Object.keys(updatedQuantities[companyName]).length === 0) {
//         delete updatedQuantities[companyName];
//       }
//     }

//     setStock(updatedStock);
//     setQuantities(updatedQuantities);
//   };

//   const handleClearAll = () => {
//     setStock(STOCK);
//     setQuantities({});
//     localStorage.removeItem('stock');
//     localStorage.removeItem('quantities');
//   };

//   const filteredStock = stock.filter(
//     (company) =>
//       company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       company.items.some((item) =>
//         typeof item === 'string'
//           ? item.toLowerCase().includes(searchTerm.toLowerCase())
//           : item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             item.list.some((subItem) =>
//               subItem.toLowerCase().includes(searchTerm.toLowerCase())
//             )
//       )
//   );

//   const generatePDF = () => {
//     const doc = new jsPDF('portrait', 'pt', 'letter');
//     const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 20;
//     const topMargin = 30;
//     const bottomMargin = 30;
//     const columnWidth = (pageWidth - 2 * margin) / 4; // Adjusted for 4 columns

//     // Add title at the top
//     doc.setFontSize(14);
//     doc.text('Stock List', pageWidth / 2, margin, { align: 'center' });

//     const addCompanyToPage = (company, xPosition, yPosition) => {
//       let hasValidItems = false;
//       let initialYPosition = yPosition;

//       company.items.forEach((item) => {
//         if (typeof item === 'string') {
//           const quantity = quantities[company.companyName]?.[item];
//           if (quantity > 0) {
//             if (!hasValidItems) {
//               doc.setFontSize(12);
//               doc.setFont('helvetica', 'bold');
//               doc.text(company.companyName, xPosition, yPosition);
//               yPosition += 14;
//               hasValidItems = true;
//               doc.setFont('helvetica', 'normal');
//             }
//             doc.setFontSize(10);
//             doc.text(`${item} - `, xPosition, yPosition);
//             doc.setFont('helvetica', 'bold');
//             doc.text(
//               `${quantity}`,
//               xPosition + doc.getTextWidth(`${item} - `),
//               yPosition
//             );
//             yPosition += 14; // Increased line height between items
//             doc.setFont('helvetica', 'normal');
//           }
//         } else {
//           const filteredItems = item.list.filter(
//             (subItem) =>
//               quantities[company.companyName]?.[`${item.type}_${subItem}`] > 0
//           );

//           if (filteredItems.length > 0) {
//             if (!hasValidItems) {
//               doc.setFontSize(12);
//               doc.setFont('helvetica', 'bold');
//               doc.text(company.companyName, xPosition, yPosition);
//               yPosition += 14;
//               hasValidItems = true;
//               doc.setFont('helvetica', 'normal');
//             }
//             yPosition += 6; // Add space above the type
//             doc.setFont('helvetica', 'bold');
//             doc.setFontSize(10);
//             doc.text(item.type, xPosition, yPosition);
//             yPosition += 14; // Increased line height between items
//             doc.setFont('helvetica', 'normal');

//             filteredItems.forEach((subItem) => {
//               const quantity =
//                 quantities[company.companyName][`${item.type}_${subItem}`];
//               doc.text(`${subItem} - `, xPosition, yPosition);
//               doc.setFont('helvetica', 'bold');
//               doc.text(
//                 `${quantity}`,
//                 xPosition + doc.getTextWidth(`${subItem} - `),
//                 yPosition
//               );
//               yPosition += 14; // Increased line height between items
//               doc.setFont('helvetica', 'normal');
//             });
//           }
//         }
//       });

//       if (hasValidItems) {
//         yPosition += 10; // Add gap after the last item of each company
//       } else {
//         // If no valid items, reset yPosition to initial to skip this company
//         yPosition = initialYPosition;
//       }

//       return yPosition;
//     };

//     let yPosition = margin + topMargin; // Adjusted for title
//     let columnCounter = 0;
//     let xPosition = margin;

//     filteredStock.forEach((company) => {
//       let newYPosition = addCompanyToPage(company, xPosition, yPosition);

//       if (newYPosition !== yPosition) {
//         yPosition = newYPosition;

//         if (yPosition + bottomMargin > pageHeight - margin) {
//           columnCounter++;
//           if (columnCounter === 4) {
//             // Move to the next page
//             doc.addPage();
//             columnCounter = 0;
//             xPosition = margin;
//           } else {
//             xPosition = margin + columnCounter * columnWidth;
//           }
//           yPosition = margin + topMargin; // Reset yPosition for new column or new page
//         }
//       }
//     });

//     // Footer
//     doc.setFontSize(8);
//     doc.text(
//       `Generated on: ${currentDate}`,
//       pageWidth - margin,
//       pageHeight - bottomMargin,
//       { align: 'right' }
//     );

//     doc.save(`stock_list_${currentDate}.pdf`);
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-10 m-4 bg-gray-100 min-h-screen rounded-3xl">
//       <h1 className="text-3xl md:text-4xl text-center mb-6">Stock List</h1>
//       <input
//         type="text"
//         placeholder="Search..."
//         value={searchTerm}
//         onChange={handleSearchChange}
//         className="w-full p-2 mb-4 border rounded"
//       />
//       <div className="bg-white p-4 shadow rounded-lg mb-6">
//         <h2 className="text-lg md:text-2xl font-bold mb-2">Add New Stock</h2>
//         <div className="flex flex-col mb-4">
//           <label className="mb-2">Company Name</label>
//           <input
//             type="text"
//             name="companyName"
//             value={newStock.companyName}
//             onChange={handleNewStockChange}
//             className="border p-2"
//           />
//         </div>
//         <div className="flex flex-col mb-4">
//           <label className="mb-2">Item</label>
//           <input
//             type="text"
//             name="item"
//             value={newStock.item}
//             onChange={handleNewStockChange}
//             className="border p-2"
//           />
//         </div>
//         <div className="flex flex-col mb-4">
//           <label className="mb-2">Quantity</label>
//           <input
//             type="number"
//             name="quantity"
//             value={newStock.quantity}
//             onChange={handleNewStockChange}
//             className="border p-2"
//           />
//         </div>
//         <button
//           onClick={handleAddNewStock}
//           className="bg-blue-500 text-white p-2 rounded"
//         >
//           Add Stock
//         </button>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto h-full">
//         {filteredStock.length > 0 ? (
//           filteredStock.map((company, index) => (
//             <div key={index} className="bg-white p-4 shadow rounded-lg mb-6">
//               <h2 className="text-lg md:text-2xl font-bold mb-2">
//                 {company.companyName}
//               </h2>
//               {company.items.map((item, idx) =>
//                 typeof item === 'string' ? (
//                   <div
//                     key={idx}
//                     className="flex items-center justify-between mb-2"
//                   >
//                     <span>{item}</span>
//                     <input
//                       type="number"
//                       min="0"
//                       value={
//                         quantities[company.companyName]
//                           ? quantities[company.companyName][item] || ''
//                           : ''
//                       }
//                       onChange={(e) =>
//                         handleQuantityChange(company.companyName, item, e)
//                       }
//                       className="border p-1 w-20"
//                       placeholder="Qty"
//                     />
//                     <button
//                       onClick={() =>
//                         handleDeleteItem(company.companyName, item)
//                       }
//                       className="ml-2  text-black p-1 rounded border-2 border-gray-300"
//                     >
//                       <X size={16} />
//                     </button>
//                   </div>
//                 ) : (
//                   <div key={idx}>
//                     <h3 className="text-xl font-semibold mt-4">{item.type}</h3>
//                     {item.list.map((subItem, subIdx) => (
//                       <div
//                         key={subIdx}
//                         className="flex items-center justify-between mb-2"
//                       >
//                         <span>{subItem}</span>
//                         <input
//                           type="number"
//                           min="0"
//                           value={
//                             quantities[company.companyName]
//                               ? quantities[company.companyName][
//                                   `${item.type}_${subItem}`
//                                 ] || ''
//                               : ''
//                           }
//                           onChange={(e) =>
//                             handleQuantityChange(
//                               company.companyName,
//                               `${item.type}_${subItem}`,
//                               e
//                             )
//                           }
//                           className="border p-1 w-20"
//                           placeholder="Qty"
//                         />
//                         <button
//                           onClick={() =>
//                             handleDeleteItem(
//                               company.companyName,
//                               `${item.type}_${subItem}`
//                             )
//                           }
//                           className="ml-2  text-black p-1 rounded border-2 border-gray-300"
//                         >
//                           <X size={16} />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )
//               )}
//             </div>
//           ))
//         ) : (
//           <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center text-xl">
//             Couldn't find any results for "{searchTerm}"
//           </div>
//         )}
//       </div>
//       <div className="text-center mt-6">
//         <button
//           onClick={generatePDF}
//           className="bg-blue-500 text-white p-2 rounded"
//         >
//           Download List
//         </button>
//         <button
//           onClick={handleClearAll}
//           className="ml-4 bg-red-500 text-white p-2 rounded"
//         >
//           Clear All
//         </button>
//       </div>
//     </div>
//   );
// };

// export default List;

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { STOCK } from '../constants/stock.json';
import { X } from 'lucide-react';

const List = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState(() => {
    const savedQuantities = localStorage.getItem('quantities');
    return savedQuantities ? JSON.parse(savedQuantities) : {};
  });
  const [newStock, setNewStock] = useState({
    companyName: '',
    item: '',
    quantity: 0,
  });
  const [stock, setStock] = useState(() => {
    const savedStock = localStorage.getItem('stock');
    return savedStock ? JSON.parse(savedStock) : STOCK;
  });

  useEffect(() => {
    localStorage.setItem('stock', JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem('quantities', JSON.stringify(quantities));
  }, [quantities]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleQuantityChange = (companyName, item, event) => {
    setQuantities({
      ...quantities,
      [companyName]: {
        ...quantities[companyName],
        [item]: event.target.value,
      },
    });
  };

  const handleNewStockChange = (event) => {
    const { name, value } = event.target;
    setNewStock((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddNewStock = () => {
    const { companyName, item, quantity } = newStock;
    if (companyName && item && quantity > 0) {
      const updatedStock = [...stock];
      const companyIndex = updatedStock.findIndex(
        (company) => company.companyName === companyName
      );

      if (companyIndex >= 0) {
        updatedStock[companyIndex].items.push(item);
      } else {
        updatedStock.push({ companyName, items: [item] });
      }

      setStock(updatedStock);
      setQuantities({
        ...quantities,
        [companyName]: {
          ...quantities[companyName],
          [item]: quantity,
        },
      });
      setNewStock({ companyName: '', item: '', quantity: 0 });
    }
  };

  const handleDeleteItem = (companyName, item) => {
    const updatedStock = stock
      .map((company) => {
        if (company.companyName === companyName) {
          return {
            ...company,
            items: company.items.filter((i) => i !== item),
          };
        }
        return company;
      })
      .filter((company) => company.items.length > 0);

    const updatedQuantities = { ...quantities };
    if (updatedQuantities[companyName]) {
      delete updatedQuantities[companyName][item];
      if (Object.keys(updatedQuantities[companyName]).length === 0) {
        delete updatedQuantities[companyName];
      }
    }

    setStock(updatedStock);
    setQuantities(updatedQuantities);
  };

  const handleClearAll = () => {
    setStock(STOCK);
    setQuantities({});
    localStorage.removeItem('stock');
    localStorage.removeItem('quantities');
  };

  const filteredStock = stock.filter(
    (company) =>
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.items.some((item) =>
        typeof item === 'string'
          ? item.toLowerCase().includes(searchTerm.toLowerCase())
          : item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.list.some((subItem) =>
              subItem.toLowerCase().includes(searchTerm.toLowerCase())
            )
      )
  );

  const generatePDF = () => {
    const doc = new jsPDF('portrait', 'pt', 'letter');
    const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const topMargin = 30;
    const bottomMargin = 30;
    const columnWidth = (pageWidth - 2 * margin) / 4; // Adjusted for 4 columns

    // Add title at the top
    doc.setFontSize(14);
    doc.text('Stock List', pageWidth / 2, margin, { align: 'center' });

    const addCompanyToPage = (company, xPosition, yPosition) => {
      let hasValidItems = false;
      let initialYPosition = yPosition;

      company.items.forEach((item) => {
        if (typeof item === 'string') {
          const quantity = quantities[company.companyName]?.[item];
          if (quantity > 0) {
            if (!hasValidItems) {
              doc.setFontSize(12);
              doc.setFont('helvetica', 'bold');
              doc.text(company.companyName, xPosition, yPosition);
              yPosition += 14;
              hasValidItems = true;
              doc.setFont('helvetica', 'normal');
            }
            doc.setFontSize(10);
            doc.text(`${item} - `, xPosition, yPosition);
            doc.setFont('helvetica', 'bold');
            doc.text(
              `${quantity}`,
              xPosition + doc.getTextWidth(`${item} - `),
              yPosition
            );
            yPosition += 14; // Increased line height between items
            doc.setFont('helvetica', 'normal');
          }
        } else {
          const filteredItems = item.list.filter(
            (subItem) =>
              quantities[company.companyName]?.[`${item.type}_${subItem}`] > 0
          );

          if (filteredItems.length > 0) {
            if (!hasValidItems) {
              doc.setFontSize(12);
              doc.setFont('helvetica', 'bold');
              doc.text(company.companyName, xPosition, yPosition);
              yPosition += 14;
              hasValidItems = true;
              doc.setFont('helvetica', 'normal');
            }
            yPosition += 6; // Add space above the type
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(item.type, xPosition, yPosition);
            yPosition += 14; // Increased line height between items
            doc.setFont('helvetica', 'normal');

            filteredItems.forEach((subItem) => {
              const quantity =
                quantities[company.companyName][`${item.type}_${subItem}`];
              doc.text(`${subItem} - `, xPosition, yPosition);
              doc.setFont('helvetica', 'bold');
              doc.text(
                `${quantity}`,
                xPosition + doc.getTextWidth(`${subItem} - `),
                yPosition
              );
              yPosition += 14; // Increased line height between items
              doc.setFont('helvetica', 'normal');
            });
          }
        }
      });

      if (hasValidItems) {
        yPosition += 10; // Add gap after the last item of each company
      } else {
        // If no valid items, reset yPosition to initial to skip this company
        yPosition = initialYPosition;
      }

      return yPosition;
    };

    let yPosition = margin + topMargin; // Adjusted for title
    let columnCounter = 0;
    let xPosition = margin;

    filteredStock.forEach((company) => {
      let newYPosition = addCompanyToPage(company, xPosition, yPosition);

      if (newYPosition !== yPosition) {
        yPosition = newYPosition;

        if (yPosition + bottomMargin > pageHeight - margin) {
          columnCounter++;
          if (columnCounter === 4) {
            // Move to the next page
            doc.addPage();
            columnCounter = 0;
            xPosition = margin;
          } else {
            xPosition = margin + columnCounter * columnWidth;
          }
          yPosition = margin + topMargin; // Reset yPosition for new column or new page
        }
      }
    });

    // Footer
    doc.setFontSize(8);
    doc.text(
      `Generated on: ${currentDate}`,
      pageWidth - margin,
      pageHeight - bottomMargin,
      { align: 'right' }
    );

    doc.save(`stock_list_${currentDate}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto p-10 m-4 bg-gray-100 min-h-screen rounded-3xl">
      <h1 className="text-3xl md:text-4xl text-center mb-6">Stock List</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <h2 className="text-lg md:text-2xl font-bold mb-2">Add New Stock</h2>
        <div className="flex flex-col mb-4">
          <label className="mb-2">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={newStock.companyName}
            onChange={handleNewStockChange}
            className="border p-2"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-2">Item</label>
          <input
            type="text"
            name="item"
            value={newStock.item}
            onChange={handleNewStockChange}
            className="border p-2"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-2">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={newStock.quantity}
            onChange={handleNewStockChange}
            className="border p-2"
          />
        </div>
        <button
          onClick={handleAddNewStock}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add Stock
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto h-full">
        {filteredStock.length > 0 ? (
          filteredStock.map((company, index) => (
            <div key={index} className="bg-white p-4 shadow rounded-lg mb-6">
              <h2 className="text-lg md:text-2xl font-bold mb-2">
                {company.companyName}
              </h2>
              {company.items.map((item, idx) =>
                typeof item === 'string' ? (
                  <div
                    key={idx}
                    className="flex items-center justify-between mb-2"
                  >
                    <span>{item}</span>
                    <input
                      type="number"
                      min="0"
                      value={
                        quantities[company.companyName]
                          ? quantities[company.companyName][item] || ''
                          : ''
                      }
                      onChange={(e) =>
                        handleQuantityChange(company.companyName, item, e)
                      }
                      className="border p-1 w-20"
                      placeholder="Qty"
                    />
                    <button
                      onClick={() =>
                        handleDeleteItem(company.companyName, item)
                      }
                      className="ml-2  text-black p-1 rounded border-2 border-gray-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div key={idx}>
                    <h3 className="text-xl font-semibold mt-4">{item.type}</h3>
                    {item.list.map((subItem, subIdx) => (
                      <div
                        key={subIdx}
                        className="flex items-center justify-between mb-2"
                      >
                        <span>{subItem}</span>
                        <input
                          type="number"
                          min="0"
                          value={
                            quantities[company.companyName]
                              ? quantities[company.companyName][
                                  `${item.type}_${subItem}`
                                ] || ''
                              : ''
                          }
                          onChange={(e) =>
                            handleQuantityChange(
                              company.companyName,
                              `${item.type}_${subItem}`,
                              e
                            )
                          }
                          className="border p-1 w-20"
                          placeholder="Qty"
                        />
                        <button
                          onClick={() =>
                            handleDeleteItem(
                              company.companyName,
                              `${item.type}_${subItem}`
                            )
                          }
                          className="ml-2  text-black p-1 rounded border-2 border-gray-300"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center text-xl">
            Couldn't find any results for "{searchTerm}"
          </div>
        )}
      </div>
      <div className="text-center mt-6">
        <button
          onClick={generatePDF}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Download List
        </button>
        <button
          onClick={handleClearAll}
          className="ml-4 bg-red-500 text-white p-2 rounded"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default List;
