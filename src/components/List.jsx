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
    const topMargin = 40;
    const bottomMargin = 30;
    const columnWidth = (pageWidth - 2 * margin) / 4; // 4 columns
    const lineHeight = 12;

    doc.setFontSize(14);
    doc.text('Stock List', pageWidth / 2, margin, { align: 'center' });

    let xPosition = margin;
    let yPosition = topMargin;
    let columnCounter = 0;

    const addTextToPage = (text, isBold = false) => {
      if (yPosition > pageHeight - bottomMargin) {
        columnCounter++;
        if (columnCounter === 4) {
          doc.addPage();
          columnCounter = 0;
          xPosition = margin;
        } else {
          xPosition = margin + columnCounter * columnWidth;
        }
        yPosition = topMargin;
      }

      doc.setFontSize(10);
      if (isBold) doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');

      doc.text(text, xPosition, yPosition);
      yPosition += lineHeight;
    };

    filteredStock.forEach((company) => {
      let hasItems = false;

      company.items.forEach((item) => {
        if (typeof item === 'string') {
          const quantity = quantities[company.companyName]?.[item];
          if (quantity > 0) {
            if (!hasItems) {
              addTextToPage(company.companyName, true);
              hasItems = true;
            }
            addTextToPage(`${item} - ${quantity}`);
          }
        } else {
          const filteredItems = item.list.filter(
            (subItem) =>
              quantities[company.companyName]?.[`${item.type}_${subItem}`] > 0
          );
          if (filteredItems.length > 0) {
            if (!hasItems) {
              addTextToPage(company.companyName, true);
              hasItems = true;
            }
            addTextToPage(item.type, true);
            filteredItems.forEach((subItem) => {
              const quantity =
                quantities[company.companyName][`${item.type}_${subItem}`];
              addTextToPage(`  ${subItem} - ${quantity}`);
            });
          }
        }
      });

      if (hasItems) yPosition += lineHeight; // Add space after each company
    });

    doc.setFontSize(8);
    doc.text(
      `Generated on: ${currentDate}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );

    doc.save(`stock_list_${currentDate}.pdf`);
  };
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 m-2 sm:m-3 md:m-4 bg-gray-100 min-h-screen rounded-3xl">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 overflow-y-auto h-full">
        {filteredStock.length > 0 ? (
          filteredStock.map((company, index) => (
            <div
              key={index}
              className="bg-white p-3 sm:p-4 shadow rounded-lg mb-4 sm:mb-6"
            >
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
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center text-xl">
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
