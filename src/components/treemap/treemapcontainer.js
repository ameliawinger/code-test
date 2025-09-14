import React, { useEffect, useState } from "react";
import Treemap from "./treemap";
import * as d3 from "d3";
import sampleData from "../../sample-data/sample-sp.json";
import portfolioA from "../../sample-data/portfolioA.json";
import portfolioB from "../../sample-data/portfolioB.json"; // optional

const TreemapGraphic = ({ portfolio }) => {
  const [filtered, setFiltered] = useState([]);
  const [date, setDate] = useState("2018-02-07");

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const portfolioModule = await import(
          `../../sample-data/${portfolio}.json`
        );

        const portfolioData = portfolioModule.default;

        const portfolioTickers = portfolioData.portfolio.map(
          (item) => item.ticker
        );

        const filteredData = sampleData.filter(
          (entry) =>
            portfolioTickers.includes(entry.Name) && entry.date === date
        );

        // Combine filteredData with shares to calculate value
        const combined = filteredData.map((item) => {
          const matchingPortfolioItem = portfolioData.portfolio.find(
            (p) => p.ticker === item.Name
          );

          const shares = matchingPortfolioItem
            ? matchingPortfolioItem.shares
            : 0;
          const close = item.close || 0;

          return {
            ...item,
            shares,
            value: shares * close, // calculated value
          };
        });

        setFiltered(combined);
      } catch (err) {
        console.error("Failed to load portfolio JSON:", err);
        setFiltered([]);
      }
    };

    loadPortfolio();
  }, [portfolio, date]);

  useEffect(() => {
    console.log("filtered is", filtered);
    const nestedData = d3.group(filtered, (d) => d.sector);
    const hierarchy = d3.hierarchy(nestedData).sum((d) => d.value);

    console.log("hierarchy is ", hierarchy);
  }, [filtered]);

  return (
    <div>
      <h2>Filtered Treemap Data</h2>
      <Treemap data={filtered} />
    </div>
  );
};

export default TreemapGraphic;
