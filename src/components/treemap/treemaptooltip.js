import React, { useEffect, useState, useRef, useMemo } from "react";
import * as d3 from "d3";

import styles from './treemap.module.css'
import sampleData from "../../sample-data/sample-sp.json";
//import * as ChartStyles from '../../styles/project-modules/voronoi.module.less'
//import Tooltip from './voronoiTooltip'
//import Legend from './legend'




const TreemapTooltip = ({ data, totalValue, hierarchy, date, colors }) => {




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

    ///////////////////////////////////////////////////


    // Extract sector-level data from hierarchy
    const sectorData = hierarchy.children.map((sectorNode) => {
        const sectorName = sectorNode.data.name;
        const sectorValue = sectorNode.value;
        const percent = ((sectorValue / totalValue) * 100).toFixed(2);

        return {
            name: sectorName,
            value: sectorValue,
            percent,
        };
    }).sort((a, b) => b.value - a.value);




    ///////////////////////////////////////////////////

    function getClosestEntry(stockHistory, targetDateStr) {
        const targetTime = new Date(targetDateStr).getTime();

        // Find the entry with minimum absolute difference in date
        let closestEntry = null;
        let minDiff = Infinity;

        for (const entry of stockHistory) {
            const entryTime = new Date(entry.date).getTime();
            const diff = Math.abs(entryTime - targetTime);

            if (diff < minDiff) {
                minDiff = diff;
                closestEntry = entry;
            }
        }

        return closestEntry;
    }

    function getClosePrice(date, stock, period) {
        const targetDate = new Date(date);
        const pastDate = new Date(targetDate);
        pastDate.setFullYear(pastDate.getFullYear() - period);

        const formatDate = (d) => d.toISOString().split("T")[0];
        const targetDateStr = formatDate(targetDate);
        const pastDateStr = formatDate(pastDate);

        // Filter historical data for the stock
        const stockHistory = sampleData
            .filter(entry => entry.Name === stock)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (!stockHistory.length) {
            return null;
        }

        // Find closest entries (before or after) for target and past dates
        const currentData = getClosestEntry(stockHistory, targetDateStr);
        const pastData = getClosestEntry(stockHistory, pastDateStr);

        if (!currentData || !pastData) {
            return null;
        }

        const returnPercent = ((currentData.close / pastData.close) - 1) * 100;

        return {
            symbol: stock,
            period: period + "Y",
            fromDate: pastData.date,
            toDate: currentData.date,
            returnPercent: returnPercent.toFixed(2) + "%",
        };
    }











    if (!data || Object.keys(data).length === 0) {
        return (
            <div className={styles.tooltipContainer}>
                <div style={{ backgroundColor: '#CFE0EF', padding: '.5rem', margin: 'auto' }}>
                    <div style={{ fontWeight: 'bold' }}>Total Portfolio Value: {formatDollar(totalValue)}</div>
                    <div style={{marginTop:'.25rem', fontSize:'13px', fontStyle:'italic'}}>{formatDate(parseDate(date))}</div>
                </div>
                <div style={{ marginTop: '.5rem' }}>
                <div style={{ padding: '0 .5rem 0 .5rem' }}>As of market close on {formatDate(parseDate(date))}, your portfolio was valued at {formatDollar(totalValue)}.</div>
            </div>

                <div>
                    <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                        Sector Allocation:
                    </div>

                    <div
                        style={{
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: 'auto auto',
                            columnGap: '0rem',
                            rowGap: '0rem',
                            fontSize: '12px',
                            width: '75%',
                            border: '1px solid black', // outer border
                        }}
                    >
                        {[
                            ['Sector', 'Value (% of Portfolio)'],
                            ...sectorData.map((sector) => {
                                return [
                                    sector.name,
                                    `$${sector.value.toLocaleString()} (${sector.percent}%)`,
                                ];
                            }),
                        ].map(([label, value], idx) => (
                            <React.Fragment key={idx}>
                                <div
                                    style={{
                                        border: '.5px solid #ccc',
                                        padding: '0.5rem',
                                        backgroundColor: idx === 0 ? '#CFE0EF' : '#EFF5FA',
                                        textAlign: idx === 0 ? 'center' : 'right',
                                        fontWeight: idx === 0 ? 'bold' : 'normal',
                                    }}
                                >
                                    {label}
                                </div>
                                <div
                                    style={{
                                        border: '.5px solid #ccc',
                                        padding: '0.5rem',
                                        textAlign: idx === 0 ? 'center' : 'right',
                                        backgroundColor: idx === 0 ? '#CFE0EF' : 'white',
                                        fontWeight: idx === 0 ? 'bold' : 'normal',
                                    }}
                                >
                                    {value}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>










                </div>
            </div>
        );
    }






    return (
        <div className={styles.tooltipContainer}>
            <div style={{ backgroundColor: colors?.[data.sector]?.color50, color: colors?.[data.sector]?.textcolor, padding: '.5rem', margin: 'auto' }}>
                <div style={{ fontWeight: 'bold' }}>{data.Name}</div>
                <div style={{ fontSize: '14px' }}>Sector: {data.sector}</div>

            </div>
            <div style={{ marginTop: '.5rem' }}>
                <div style={{ padding: '0 .5rem 0 .5rem' }}>As of market close on {formatDate(parseDate(data.date))}, your <b>{data.shares} {data.Name} shares</b> were valued at: <b>{formatDollar(data.value)}</b>.</div>
                <div style={{ margin: '.5rem auto 0 auto', backgroundColor: '#CFE0EF', fontWeight: 'bold', width: 'fit-content', padding: '.5rem', borderRadius: '4px' }}>Weight: {`${((data.value / totalValue) * 100).toFixed(2)}%`} of portfolio</div>
            </div>

            <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>Daily price fluctuation: </div>
            <div style={{
                margin: '0rem auto 0 auto',
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                columnGap: '0rem',
                rowGap: '0rem',
                fontSize: '12px',
                width: '50%',
                //maxWidth: '300px',
                border: '1px solid black', // outer border around the whole grid
            }}>
                {[
                    ['Open:', formatDollar(data.open)],
                    ['Close:', formatDollar(data.close)],
                    ['High', formatDollar(data.high)],
                    ['Low:', formatDollar(data.low)]
                ].map(([label, value], idx) => (
                    <React.Fragment key={idx}>
                        <div style={{ border: '.5px solid #ccc', padding: '0.25rem', backgroundColor: '#CFE0EF', textAlign: 'right' }}>{label}</div>
                        <div style={{ border: '.5px solid #ccc', padding: '0.25rem', backgroundColor: 'white' }}>{value}</div>
                    </React.Fragment>
                ))}
            </div>

            <div style={{ marginTop: '2rem', fontWeight: 'bold' }}>Return Price</div>
            <div
                style={{
                    margin: '0 auto 1rem auto',
                    display: 'grid',
                    gridTemplateColumns: 'auto auto',
                    columnGap: '0rem',
                    rowGap: '0rem',
                    fontSize: '12px',
                    width: '50%',
                    //maxWidth: '300px',
                    border: '1px solid black', // outer border around the whole grid
                }}
            >
                {[
                    ['1-Year Return:', getClosePrice(data.date, data.name, 1)?.returnPercent || 'N/A'],
                    ['3-Year Return:', getClosePrice(data.date, data.name, 3)?.returnPercent || 'N/A'],
                    ['5-Year Return:', getClosePrice(data.date, data.name, 5)?.returnPercent || 'N/A'],
                ].map(([label, value], idx) => (
                    <React.Fragment key={idx}>
                        <div style={{ border: '1px solid #ccc', padding: '0.25rem', backgroundColor: '#CFE0EF', textAlign: 'right' }}>{label}</div>
                        <div style={{ border: '1px solid #ccc', padding: '0.25rem', backgroundColor: 'white' }}>{value}</div>
                    </React.Fragment>
                ))}
            </div>







        </div>
    );
};

export default TreemapTooltip



