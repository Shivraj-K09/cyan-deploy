import React from "react";

const LogDisplay = ({ logs }) => {
  return (
    <div className="fixed bottom-80 left-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-60 overflow-y-auto z-50">
      <h3 className="text-lg font-semibold mb-2">Debug Logs:</h3>
      {logs.map((log, index) => (
        <div key={index} className="text-sm mb-1">
          <span className="font-medium">{log.type}: </span>
          <span>{log.message}</span>
        </div>
      ))}
    </div>
  );
};

export default LogDisplay;
