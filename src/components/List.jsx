import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { STOCK } from '../constants/stock.json';

const List = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});

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

  const filteredStock = STOCK.filter(
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
      <div className="text-center">
        <button
          onClick={generatePDF}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Download List
        </button>
      </div>
    </div>
  );
};

export default List;
