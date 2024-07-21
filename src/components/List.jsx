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
    const columnWidth = (pageWidth - 2 * margin) / 4; // Adjusted for 4 columns

    // Add title at the top
    doc.setFontSize(14);
    doc.text('Stock List', pageWidth / 2, margin, { align: 'center' });

    const addCompanyToPage = (company, xPosition, yPosition) => {
      let rows = [
        [
          {
            content: company.companyName,
            styles: { fontStyle: 'bold', fillColor: [200, 220, 210] },
          },
        ],
      ];

      company.items.forEach((item) => {
        if (typeof item === 'string') {
          const quantity = quantities[company.companyName]?.[item];
          if (quantity > 0) {
            rows.push([`${item} - Qty: ${quantity}`]);
          }
        } else {
          const itemRows = item.list
            .filter(
              (subItem) =>
                quantities[company.companyName]?.[`${item.type}_${subItem}`] > 0
            )
            .map((subItem) => [
              `${subItem} - Qty: ${
                quantities[company.companyName][`${item.type}_${subItem}`]
              }`,
            ]);

          if (itemRows.length > 0) {
            rows.push([{ content: item.type, styles: { fontStyle: 'bold' } }]);
            rows = rows.concat(itemRows);
          }
        }
      });

      if (rows.length > 1) {
        // Ensure there's content to add
        doc.autoTable({
          startY: yPosition,
          margin: { left: xPosition },
          body: rows,
          tableWidth: columnWidth - 5,
          styles: { fontSize: 10, cellPadding: 2 }, // Increased font size
          headStyles: { fillColor: [200, 220, 210] },
          columnStyles: {
            0: { cellWidth: 'auto' },
          },
        });
      }
    };

    let yPosition = margin + 30; // Adjusted for title
    let columnCounter = 0;

    filteredStock.forEach((company, index) => {
      const xPosition = margin + columnCounter * columnWidth;

      addCompanyToPage(company, xPosition, yPosition);

      if (doc.lastAutoTable.finalY > yPosition) {
        yPosition = doc.lastAutoTable.finalY + 10;
      }

      columnCounter++;
      if (columnCounter === 4) {
        // Move to the next row
        columnCounter = 0;
        yPosition = doc.lastAutoTable.finalY + 10;
        if (yPosition + 10 > pageHeight - margin) {
          doc.addPage();
          yPosition = margin + 30; // Adjusted for title
        }
      }
    });

    // Footer
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
