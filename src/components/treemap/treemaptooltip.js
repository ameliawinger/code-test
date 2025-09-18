import React, { useEffect, useState, useRef, useMemo } from "react";
import * as d3 from "d3";
import styles from './treemap.module.css'
import sampleData from "../../sample-data/sample-sp.json";

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
    const formatDate = d3.utcFormat("%b %d, %Y");

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

    // Function to find the closest date if we're looking at a date for which data doesn't exist
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


    // Function to find the close price
    // Period is used to help calculate the 1-year, 3-year and 5-year returns
    function getClosePrice(date, stock, period) {
        const targetDate = new Date(date);
        const pastDate = new Date(targetDate);
        pastDate.setFullYear(pastDate.getFullYear() - period);

        const formatDate = (d) => d.toISOString().split("T")[0];
        const targetDateStr = formatDate(targetDate);
        const pastDateStr = formatDate(pastDate);

        const stockHistory = sampleData
            .filter(entry => entry.Name === stock)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (!stockHistory.length) {
            return null;
        }

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


    // Build the tooltips
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className={styles.tooltipContainer}>
                <div className={styles.tooltipHeader}>
                    <div>{data?.Name || 'Total Portfolio Value: ' + formatDollar(totalValue)}</div>
                    {!data && <div className={styles.tooltipSubText}>{formatDate(parseDate(date))}</div>}
                </div>

                <div className={styles.tooltipDescription}>
                    As of market close on {formatDate(parseDate(data?.date || date))},
                    {data ? (
                        <> {' '}your <b>{data.shares} {data.Name} shares</b> were valued at: <b>{formatDollar(data.value)}</b>.</>
                    ) : (
                        <>{' '}your portfolio was valued at {formatDollar(totalValue)}.</>
                    )}
                </div>

                {data && (
                    <div className={styles.weightBadge}>
                        Weight: {`${((data.value / totalValue) * 100).toFixed(2)}%`} of portfolio
                    </div>
                )}

                {!data && (
                    <>
                        <div className={styles.sectorAllocationLabel}>Sector Allocation:</div>
                        <div className={styles.sectorGrid}>
                            {[
                                ['Sector', 'Value (% of Portfolio)'],
                                ...sectorData.map((sector) => [
                                    sector.name,
                                    `$${sector.value.toLocaleString()} (${sector.percent}%)`,
                                ]),
                            ].map(([label, value], idx) => (
                                <React.Fragment key={idx}>
                                    <div className={idx === 0 ? styles.gridHeaderCell : styles.gridDataLabel}>
                                        {label}
                                    </div>
                                    <div className={idx === 0 ? styles.gridHeaderCell : styles.gridDataValue}>
                                        {value}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </>
                )}

                {data && (
                    <>
                        <div className={styles.priceSectionLabel}>Daily price fluctuation:</div>
                        <div className={styles.priceGrid}>
                            {[
                                ['Open:', formatDollar(data.open)],
                                ['Close:', formatDollar(data.close)],
                                ['High:', formatDollar(data.high)],
                                ['Low:', formatDollar(data.low)],
                            ].map(([label, value], idx) => (
                                <React.Fragment key={idx}>
                                    <div className={styles.priceGridLabel}>{label}</div>
                                    <div className={styles.priceGridValue}>{value}</div>
                                </React.Fragment>
                            ))}
                        </div>

                        <div className={styles.priceSectionLabel}>Return Price</div>
                        <div className={styles.returnGrid}>
                            {[
                                ['1-Year Return:', getClosePrice(data.date, data.name, 1)?.returnPercent || 'N/A'],
                                ['3-Year Return:', getClosePrice(data.date, data.name, 3)?.returnPercent || 'N/A'],
                                ['5-Year Return:', getClosePrice(data.date, data.name, 5)?.returnPercent || 'N/A'],
                            ].map(([label, value], idx) => (
                                <React.Fragment key={idx}>
                                    <div className={styles.returnGridLabel}>{label}</div>
                                    <div className={styles.returnGridValue}>{value}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }


    return (
        <div className={styles.tooltipContainer}>
            <div
                className={styles.tooltipHeaderDynamic}
                style={{
                    backgroundColor: colors?.[data.sector]?.color50,
                    color: colors?.[data.sector]?.textcolor,
                }}
            >
                <div className={styles.tooltipTitle}>{data.Name}</div>
                <div className={styles.tooltipSector}>Sector: {data.sector}</div>
            </div>

            <div className={styles.tooltipDescription}>
                As of market close on {formatDate(parseDate(data.date))}, your{" "}
                <b>
                    {data.shares} {data.Name} shares
                </b>{" "}
                were valued at: <b>{formatDollar(data.value)}</b>.
            </div>

            <div className={styles.weightBadge}>
                Weight: {`${((data.value / totalValue) * 100).toFixed(2)}%`} of portfolio
            </div>

            <div className={styles.sectionLabel}>Daily price fluctuation:</div>
            <div className={styles.priceGrid}>
                {[
                    ["Open:", formatDollar(data.open)],
                    ["Close:", formatDollar(data.close)],
                    ["High:", formatDollar(data.high)],
                    ["Low:", formatDollar(data.low)],
                ].map(([label, value], idx) => (
                    <React.Fragment key={idx}>
                        <div className={styles.gridLabelCell}>{label}</div>
                        <div className={styles.gridValueCell}>{value}</div>
                    </React.Fragment>
                ))}
            </div>

            <div className={styles.sectionLabel}>Return:</div>
            <div className={styles.returnGrid}>
                {[
                    [
                        "1-Year Return:",
                        getClosePrice(data.date, data.name, 1)?.returnPercent || "N/A",
                    ],
                    [
                        "3-Year Return:",
                        getClosePrice(data.date, data.name, 3)?.returnPercent || "N/A",
                    ],
                    [
                        "5-Year Return:",
                        getClosePrice(data.date, data.name, 5)?.returnPercent || "N/A",
                    ],
                ].map(([label, value], idx) => (
                    <React.Fragment key={idx}>
                        <div className={styles.gridLabelCell}>{label}</div>
                        <div className={styles.gridValueCell}>{value}</div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default TreemapTooltip



