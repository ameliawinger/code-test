import React, { useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import sampleData from "../../sample-data/sample-sp.json";
import portfolioA from "../../sample-data/portfolioA.json";
import Dumbbell from "./dumbbell";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import styles from './dumbbell.module.css'

const parseDate = d3.utcParse("%Y-%m-%d")
const formatDate = d3.utcFormat("%b. %d, %Y");

const DumbbellGraphic = () => {
    const portfolio = portfolioA.portfolio;
    const [fullData, setFullData] = useState([])

    // State: stores the two slider thumbs as indices into the date list
    const [rangeIdx, setRangeIdx] = useState([0, 0]);
    const [contributionData, setContributionData] = useState([]);
    const [totalReturn, setTotalReturn] = useState(null);

    // Memoize sorted unique dates
    const dates = useMemo(() => {
        const allDates = sampleData.map(d => d.date);
        const unique = Array.from(new Set(allDates));
        unique.sort();  // assumes date strings are in ISO yyyy‑mm‑dd; lexicographic sort works
        return unique;
    }, [sampleData]);

    // Initialize the slider to full range once dates are loaded
    useEffect(() => {
        if (dates.length > 0) {
            setRangeIdx([0, dates.length - 1]);
        }
    }, [dates]);

    function calculateContributionToReturn(spData, portfolio, startDateStr, endDateStr) {
        const parseDate = d3.timeParse("%Y-%m-%d");
        const startDate = parseDate(startDateStr);
        const endDate = parseDate(endDateStr);

        const portfolioMap = new Map();
        portfolio.forEach(stock => {
            portfolioMap.set(stock.ticker, stock.shares);
        });

        const filteredStart = spData.filter(d => parseDate(d.date)?.getTime() === startDate?.getTime());
        const filteredEnd = spData.filter(d => parseDate(d.date)?.getTime() === endDate?.getTime());

        const startPrices = new Map();
        const endPrices = new Map();

        filteredStart.forEach(d => {
            if (portfolioMap.has(d.Name)) {
                startPrices.set(d.Name, d.close);
            }
        });

        filteredEnd.forEach(d => {
            if (portfolioMap.has(d.Name)) {
                endPrices.set(d.Name, d.close);
            }
        });

        const results = [];
        let totalStartValue = 0;

        portfolio.forEach(stock => {
            const { ticker, shares } = stock;
            const startPrice = startPrices.get(ticker);
            const endPrice = endPrices.get(ticker);
            if (startPrice === undefined || endPrice === undefined) return;

            const startValue = shares * startPrice;
            const endValue = shares * endPrice;
            const returnPct = (endPrice - startPrice) / startPrice;
            totalStartValue += startValue;

            results.push({
                ticker,
                shares,
                startPrice,
                endPrice,
                startValue,
                endValue,
                returnPct
            });
        });

        const final = results.map(stock => {
            const weight = stock.startValue / totalStartValue;
            return {
                ...stock,
                contributionPct: weight * stock.returnPct
            };
        });

        const totalPortfolioReturn = final.reduce((acc, s) => acc + s.contributionPct, 0);

        return {
            data: final,
            totalPortfolioReturn
        };
    }

    // Recompute chart whenever the slider range changes (or portfolio, or dates)
    useEffect(() => {
        if (dates.length === 0) return;

        const [startIdx, endIdx] = rangeIdx;
        const startDate = dates[startIdx];
        const endDate = dates[endIdx];

        const { data: fullContributionData, totalPortfolioReturn } = calculateContributionToReturn(
            sampleData,
            portfolio,
            startDate,
            endDate
        );

        setFullData(fullContributionData)

        const transformedData = fullContributionData.flatMap(stock => {

            return [
                {
                    ticker: stock.ticker,
                    category: "Zero",
                    value: 0,
                    label: "hide",
                    offset: -2,
                    dataPointAccessibilityNote: `This point represents the 0% benchmark`
                },
                {
                    ticker: stock.ticker,
                    category: "CtR",
                    label: stock.contributionPct,
                    value: stock.contributionPct,
                    offset: 5,
                    dataPointAccessibilityNote: `Ticker ${stock.ticker} had a return of ${stock.contributionPct}%`
                }
            ];
        });

        setContributionData(transformedData);
        setTotalReturn(totalPortfolioReturn);
    }, [rangeIdx, dates, portfolio]);

    return (
        <div style={{width:'680px', margin:'auto auto 6rem auto', border:'1px solid black', padding:'0 30px 0 30px'}}>
            <div>

            {contributionData.length > 0 && (
                <Dumbbell
                    data={contributionData}
                    ordinalAccessor="ticker"
                    seriesAccessor="category"
                    valueAccessor="value"
                    elementDescriptionAccessor="dataPointAccessibilityNote"
                    dates={dates}
                    rangeIdx={rangeIdx}
                    totalReturn={totalReturn}
                />
            )}
            </div>
            {dates.length > 0 && (
                <div className={styles.sliderWrapper} style={{ margin: "20px 0" }}>
                    <div style={{display:'flex', flexDirection:'row', marginBottom:'1rem', fontSize:'13px'}}>
                        <div style={{textAlign:'right'}}>{formatDate(parseDate(dates[rangeIdx[0]]))}</div>

                    <div className={styles.sliderContainer}>
                        <RangeSlider
                            id="date-range-slider"
                            className={styles.customSlider}
                            min={0}
                            max={dates.length - 1}
                            step={1}
                            value={rangeIdx}
                            onInput={newRangeIdx => setRangeIdx(newRangeIdx)}
                        />
                    </div>
                    <div>
                        {formatDate(parseDate(dates[rangeIdx[1]]))}
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default DumbbellGraphic;