import React, { useEffect, useState, useMemo } from "react";
import Treemap from "./treemap";
import * as d3 from "d3";
import sampleData from "../../sample-data/sample-sp.json";
import portfolioA from "../../sample-data/portfolioA.json";
import TreemapTooltip from "./treemaptooltip";
import styles from './treemap.module.css'


// Helpers for formatting
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
const formatDate = d3.utcFormat("%b %d, %Y");


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
        setFiltered([]);
      }
    };

    loadPortfolio();
  }, [portfolio, date]);

  // Build D3 hierarchy when filtered data updates
  useEffect(() => {
    if (filtered.length === 0) return;

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


  // Create color palette for visual
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


  return (
    <div style={{ marginBottom: '6rem', border: '1px solid black', width: '95%', margin: '1rem auto 6rem auto ', padding: '1rem' }}>
      <h2>Portfolio Composition</h2>
      <div style={{ margin: '0 auto 1rem auto', width: '90%' }}>Use the treemap below to explore the value of each holding in your portfolio, grouped by sector.
        Each shape represents a single holding, sized by its value as of market close.
        Hover over a holding for more details.</div>

      <div className={styles.graphicWrapper}>
        <div className={styles.treemapContainer}>
          {hierarchy ? (
            <>
              {filtered && (
                <div>
                  <div><strong>Total Portfolio Value:</strong> {formatDollar(totalValue)}</div>
                  <div style={{ fontSize: '12.5px', fontStyle: 'italic' }}>As of market close on {formatDate(parseDate(date))}</div>
                </div>
              )}

              <Treemap data={filtered} hierarchy={hierarchy} h_max={500} colors={colors} setTooltipData={setTooltipData} />
            </>
          ) : (
            <p>Loading treemap...</p>
          )}
        </div>

        <div className={styles.tooltipWrapper}>
          {hierarchy && <TreemapTooltip data={tooltipData} hierarchy={hierarchy} totalValue={totalValue} date={date} colors={colors} />}
        </div>
      </div>
    </div>
  );
};

export default TreemapGraphic;