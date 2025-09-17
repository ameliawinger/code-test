import React from "react";
//import Styles from "./your-style.module.css"; // Optional, for styling

const Slider = ({ fullData, currentRange, setCurrentRange }) => {
  const allDates = fullData.map(d => d.date);
  const uniqueSortedDates = Array.from(new Set(allDates)).sort();

  const startIndex = uniqueSortedDates.indexOf(currentRange[0]);
  const endIndex = uniqueSortedDates.indexOf(currentRange[1]);

  const handleStartChange = (e) => {
    const newStartIndex = +e.target.value;
    if (newStartIndex < endIndex) {
      setCurrentRange([uniqueSortedDates[newStartIndex], currentRange[1]]);
    }
  };

  const handleEndChange = (e) => {
    const newEndIndex = +e.target.value;
    if (newEndIndex > startIndex) {
      setCurrentRange([currentRange[0], uniqueSortedDates[newEndIndex]]);
    }
  };

  return (
    <div >
      <label>
        Start Date: {currentRange[0]}
        <input
          type="range"
          min="0"
          max={uniqueSortedDates.length - 1}
          value={startIndex}
          onChange={handleStartChange}
        />
      </label>

      <label>
        End Date: {currentRange[1]}
        <input
          type="range"
          min="0"
          max={uniqueSortedDates.length - 1}
          value={endIndex}
          onChange={handleEndChange}
        />
      </label>
    </div>
  );
};

export default Slider;