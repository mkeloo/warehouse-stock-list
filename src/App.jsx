import React from 'react';
import List from './components/List';

function App() {
  return (
    <div className="max-w-7xl mx-auto w-full ">
      <div className="w-full flex justify-center items-center px-10 ">
        <h1 className="text-3xl md:text-5xl p-4 m-4">Warehouse Items</h1>
      </div>
      <div className=" flex flex-col items-center justify-center px-0 md:px-10">
        <List />
      </div>
    </div>
  );
}

export default App;
