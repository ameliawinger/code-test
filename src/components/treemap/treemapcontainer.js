import React, { useEffect, useState, useMemo } from "react";
import Treemap from "./treemap";
import * as d3 from "d3";
import sampleData from "../../sample-data/sample-sp.json";
import portfolioA from "../../sample-data/portfolioA.json";
import portfolioB from "../../sample-data/portfolioB.json"; // optional
import TreemapTooltip from "./treemaptooltip";
import styles from './treemap.module.css'


const categoryColors = {
  "Technology": { color100: "#189196", color75: "#45A6AC", color50: "#edce87", color25: "#9ED1D8", color0: "#CAE6EE" }, // teal
  "Healthcare": { color100: "#E5A72C", color75: "#E8BD62", color50: "#B1C097", color25: "#F1DEAD", color0: "#F6EED2" }, // yellow
  "Communication Services": { color100: "#D1365E", color75: "#DA5E7D", color50: "#EAAB76 ", color25: "#ECAFBC", color0: "#F5D7DB" }, // pink
  "Financial Services": { color100: "#97668F", color75: "#AC84A5", color50: "#C1A3BC", color25: "#D6C1D3", color0: "#EBE0E9" }, // purple
  "Consumer Cyclical": { color100: "#676767", color75: "#909090", color50: "#d9d9d9", color25: "#E1E1E1", color0: "#E1E1E1" },  // gray
  "Industrials": { color100: "#DF7821", color75: "#E4914B", color50: "#724C6C", color25: "#F0C4A1", color0: "#F5DECB" }, // orange
  "Consumer Defensive": { color100: "#189196", color75: "#45A6AC", color50: "#edce87", color25: "#9ED1D8", color0: "#CAE6EE" }, // teal
  "Utilities": { color100: "#E5A72C", color75: "#E8BD62", color50: "#B1C097", color25: "#F1DEAD", color0: "#F6EED2" }, // yellow
  "Real Estate": { color100: "#D1365E", color75: "#DA5E7D", color50: "#EAAB76 ", color25: "#ECAFBC", color0: "#F5D7DB" }, // pink
  "Energy": { color100: "#97668F", color75: "#AC84A5", color50: "#C1A3BC", color25: "#D6C1D3", color0: "#EBE0E9" }, // purple
  "Basic Materials": { color100: "#676767", color75: "#909090", color50: "#d9d9d9", color25: "#E1E1E1", color0: "#E1E1E1" },  // gray
}

const formatDollar = (value) => {
        const num = value;

        if (isNaN(num)) return '';

        return num.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

        const parseDate = d3.utcParse("%Y-%m-%d")
        const formatDate = d3.utcFormat("%B %d, %Y");



const TreemapGraphic = ({ portfolio }) => {
  const [filtered, setFiltered] = useState([]);
  const [date, setDate] = useState("2018-02-07");
  const [hierarchy, setHierarchy] = useState();
  const [tooltipData, setTooltipData] = useState()

  // Load the selected portfolio JSON file
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

        // Combine filtered data with share information to compute value
        const combined = filteredData.map((item) => {
          const matching = portfolioData.portfolio.find(
            (p) => p.ticker === item.Name
          );

          const shares = matching ? matching.shares : 0;
          const close = item.close || 0;

          return {
            ...item,
            shares,
            value: shares * close,
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

  // Build D3 hierarchy when filtered data updates
  useEffect(() => {
    if (filtered.length === 0) return;

    // Build a custom hierarchy structure
    const root = {
      name: "root",
      children: [],
    };

    const sectorMap = new Map();

    filtered.forEach((item) => {
      const sector = item.sector || "Unknown";
      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, []);
      }
      sectorMap.get(sector).push(item);
    });

    let idCounter = 0;

    root.children = Array.from(sectorMap.entries()).map(([sector, stocks]) => ({
      name: sector,
      children: stocks.map((stock) => ({
        id: idCounter++,
        name: stock.Name,
        value: stock.value,
        sector: stock.sector, // important
        ...stock, // include everything else
      })),
    }));

    const hierarchyRoot = d3.hierarchy(root).sum((d) => d.value);

    setHierarchy(hierarchyRoot);
  }, [filtered]); 

  // Calculate total portfolio value
  const totalValue = useMemo(() => {
    if (!filtered || filtered.length === 0) return 0;

    return filtered.reduce((acc, item) => acc + (item.value || 0), 0);
  }, [filtered]);

  ////////////////////////

  const colors = useMemo(() => {
  if (!hierarchy) return {};

  const leafNodes = hierarchy.leaves?.() || [];
  const uniqueSectors = [...new Set(leafNodes.map((d) => d.data.sector))];

  const minColor = "#CFE0EF"; // light blue
  const maxColor = "#003166"; // dark teal

  const interpolator = d3.interpolateLab(minColor, maxColor);
  const n = uniqueSectors.length;

  return Object.fromEntries(
    uniqueSectors.map((sector, i) => {
      const color50 = interpolator(i / (n - 1));
      const lightness = d3.lab(color50).l; // Lightness is between 0 and 100

      const textcolor = lightness < 60 ? 'white' : 'black'; // tweak threshold if needed

      return [
        sector,
        { color50, textcolor },
      ];
    })
  );
}, [hierarchy]);

  //////////////////////////


  return (
    <div style={{marginBottom:'6rem', border:'1px solid black', width:'95%', margin:'1rem auto 6rem auto ', padding: '1rem'}}>
      <h2>Portfolio Composition</h2>

      <div className={styles.graphicWrapper}>
        <div className={styles.treemapContainer}>
          {hierarchy ? (
            <>
            {filtered && (
              <div>
              <div><strong>Total Portfolio Value:</strong> {formatDollar(totalValue)}</div>
              <div style={{fontSize:'12.5px', fontStyle:'italic'}}>As of market close on {formatDate(parseDate(date))}</div>
              </div>
            )}

            <Treemap data={filtered} hierarchy={hierarchy} h_max={500} colors={colors} setTooltipData={setTooltipData} />
            </>
          ) : (
            <p>Loading treemap...</p>
          )}
        </div>

        <div className={styles.tooltipWrapper}>
          {hierarchy &&<TreemapTooltip data={tooltipData} hierarchy={hierarchy} totalValue={totalValue} date={date} colors={colors} />}
        </div>
      </div>
    </div>
  );
};

export default TreemapGraphic;