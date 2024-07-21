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
    const doc = new jsPDF('l', 'pt', 'a4');
    const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');

    doc.setFontSize(16);
    doc.text('Stock List', 40, 40);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const columnWidth = (pageWidth - 2 * margin) / 4;

    filteredStock.forEach((company, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const xPosition = margin + col * columnWidth;
      let yPosition = margin + row * (pageHeight / 2) + 60;

      if (row > 0 && col === 0) {
        doc.addPage();
        yPosition = margin + 60;
      }

      let rows = [
        [
          {
            content: company.companyName,
            colSpan: 2,
            styles: { fontStyle: 'bold', fillColor: [200, 220, 210] },
          },
        ],
      ];

      company.items.forEach((item) => {
        if (typeof item === 'string') {
          const quantity = quantities[company.companyName]?.[item] || 0;
          rows.push([item, quantity]);
        } else {
          rows.push([
            { content: item.type, colSpan: 2, styles: { fontStyle: 'bold' } },
          ]);
          item.list.forEach((subItem) => {
            const quantity = quantities[company.companyName]?.[subItem] || 0;
            rows.push([subItem, quantity]);
          });
        }
      });

      doc.autoTable({
        startY: yPosition,
        margin: { left: xPosition },
        body: rows,
        tableWidth: columnWidth - 10,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [200, 220, 210] },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 30, halign: 'right' },
        },
      });
    });

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
              <h2 className="text-2xl font-bold mb-2">{company.companyName}</h2>
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
                              ? quantities[company.companyName][subItem] || ''
                              : ''
                          }
                          onChange={(e) =>
                            handleQuantityChange(
                              company.companyName,
                              subItem,
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

const StockTable = ({ stock, quantities }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stock.map((company, index) => (
        <div key={index} className="mb-4">
          <h3 className="font-bold text-lg">{company.companyName}</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th className="text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {company.items.map((item, idx) =>
                typeof item === 'string' ? (
                  <tr key={idx}>
                    <td>{item}</td>
                    <td className="text-right">
                      {quantities[company.companyName]?.[item] || 0}
                    </td>
                  </tr>
                ) : (
                  <React.Fragment key={idx}>
                    <tr>
                      <td colSpan="2" className="font-bold">
                        {item.type}
                      </td>
                    </tr>
                    {item.list.map((subItem, subIdx) => (
                      <tr key={subIdx}>
                        <td>{subItem}</td>
                        <td className="text-right">
                          {quantities[company.companyName]?.[subItem] || 0}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
