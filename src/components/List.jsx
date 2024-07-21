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
    const doc = new jsPDF('p', 'pt', 'a4');
    const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');

    doc.setFontSize(18);
    doc.text('Stock List', 40, 40);

    const columns = [['Company', 'Type', 'Item', 'Quantity']];
    const rows = [];

    filteredStock.forEach((company) => {
      if (company.items.length > 0) {
        company.items.forEach((item) => {
          if (typeof item === 'string') {
            const quantity = quantities[company.companyName]
              ? quantities[company.companyName][item] || 0
              : 0;
            rows.push([company.companyName, '', item, quantity]);
          } else {
            item.list.forEach((subItem) => {
              const quantity = quantities[company.companyName]
                ? quantities[company.companyName][subItem] || 0
                : 0;
              rows.push([company.companyName, item.type, subItem, quantity]);
            });
          }
        });
        rows.push(['', '', '', '']); // Add an empty row for the divider
      }
    });

    doc.autoTable({
      head: columns,
      body: rows,
      startY: 60,
      styles: { fontSize: 10 },
      theme: 'striped',
    });

    // Manually draw separators
    const startY = 60 + doc.autoTable.previous.finalY;
    let y = startY;
    rows.forEach((row) => {
      if (row[0] === '' && row[1] === '' && row[2] === '' && row[3] === '') {
        y += 10;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(40, y, doc.internal.pageSize.getWidth() - 40, y);
      }
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
