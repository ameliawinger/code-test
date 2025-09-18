import React, { useEffect, useState } from "react";
import { DumbbellPlot } from "@visa/charts-react";
import styles from './dumbbell.module.css';
import * as d3 from "d3";


const parseDate = d3.utcParse("%Y-%m-%d")
const formatDate = d3.utcFormat("%b. %d, %Y");

const Dumbbell = ({ data, rangeIdx, dates, totalReturn }) => {

    const generateAnnotations = (sortedData) => {
        const ctrData = sortedData.filter(d => d.category === "CtR");

        const count = ctrData.length;
        const yStep = 100 / count;

        return ctrData.map((d, i) => {

            const isNegative = d.value < 0
            const yPercent = yStep * i + yStep / 12;

            return {
                className: styles.customAnnotation,
                note: {
                    label: `${(d.value * 100).toFixed(2)}%`,
                    align: isNegative ? "start" : "end",
                    wrap: 100,
                    lineType: "none",
                    bgPadding: 6
                },
                accessibilityDescription: `${d.ticker} contributed ${(d.value * 100).toFixed(2)}%`,
                data: {
                    ticker: d.ticker,
                    category: d.category,
                    value: d.value
                },
                disable: ["connector", "subject"],
                dx: isNegative ? "-12.5%" : "2%",
                y: `${yPercent}%`,
                color: "#428BCA",
                type: "annotationCallout",

            };
        });
    };

    const sortedData = [...data].sort((a, b) => b.value - a.value);
    //const annotations = generateAnnotations(sortedData);

    const [annotations, setAnnotations] = useState(generateAnnotations(sortedData));


    useEffect(() => {
        if (data && data.length > 0) {
            const sortedData = [...data].sort((a, b) => b.value - a.value);
            const newAnnotations = generateAnnotations(sortedData);
            setAnnotations(newAnnotations);
        }
    }, [data]);




    // Prepare dumbbell config
    const dumbbellConfig = {
        uniqueID: "dumbbell-plot",
        mainTitle: "Performance Analysis",
        subTitle: {
            text: `Your portfolio saw a ${(totalReturn * 100).toFixed(2)}% return from ${formatDate(parseDate(dates[rangeIdx[0]]))} to ${formatDate(parseDate(dates[rangeIdx[1]]))}. Explore how each holding contributed to your portfolio's overall return, and use the sliding scale to adjust the time period shown. The percentages shown represent each holding’s contribution to total return, not their portfolio weights, and therefore may not sum to 100%.`
        },
        accessibility: {
            title: "Performance Analysis",
            longDescription: `Explore how each holding contributed to your portfolio's overall return from ${dates[rangeIdx[0]]} to ${dates[rangeIdx[1]]}. Total contributions reflect return impact, not percentage weights.`,
            contextExplanation: "The values displayed in this chart are based on the filter selections made in the slider below. Users can see how each holding in their portfolio contributed to the portfolio's overall return for the specified time period.",
            statisticalNotes: "Percentages shown represent each holding’s contribution to total return, not their portfolio weights, and therefore may not sum to 100%.",
            structureNotes: "One reference line is present on the chart, indicating a 0% contribution to the total return.",
            hideDataTableButton: true,
            includeDataKeyNames: true,
            elementsAreInterface: false,
            disableValidation: true,
            hideStrokes: true,
            highestHeadingLevel: 'div'
        },
        showTooltip: false,
        width: 650,
        height: 350,
        ordinalAccessor: "ticker",
        seriesAccessor: "category",
        valueAccessor: "value",
        labelAccessor: "label",
        data,
        dataKeyNames: {
            ticker: "ticker",
            category: "category",
            value: "value",
            label: "label",
            offset: "offset",
            ClassName: "ClassName",
            dataPointAccessibilityNote: "dataPointAccessibilityNote"
        },
        dataLabel: {
            visible: false,
            placement: "ends",
            labelAccessor: "label",
            format: "0[.0]%"
        },
        colors: ["#d3d3d3", "#428BCA", "#d3d3d3"],
        hoverStyle: {
            strokeWidth: 2
        },
        clickStyle: {
            strokeWidth: 3
        },
        barStyle: {
            width: 4,
            opacity: 1,
            strokeWidth: 0
        },
        focusMarker: {
            key: "CtR",
            sizeFromBar: 3
        },
        referenceLines: [
            {
                value: 0,
                label: " ",
                labelPlacementHorizontal: "right",
                labelPlacementVertical: "top",
                accessibilityDescription: "Reference line at zero",
                accessibilityDecorationOnly: true
            }
        ],
        referenceStyle: {
            color: "black",
            strokeWidth: 2,
            dashed: "4,2",
            opacity: 0.8
        },
        marker: {
            visible: true,
            type: "dot",
            sizeFromBar: 1,
            style: {
                fill: "lime"
            }
        },
        legend: {
            visible: false
        },
        seriesLabel: {
            visible: false
        },
        layout: "horizontal",
        sortOrder: "desc",

        yAxis: {
            visible: true,
            gridVisible: false,
            label: " ",
            format: "",
            tickInterval: 1
        },
        xAxis: {
            visible: true,
            gridVisible: true,
            label: "Contribution to return",
            format: "0.0%",
            tickInterval: 2
        },
        padding: {
            top: 36,
            bottom: 36,
            left: 120,
            right: 36
        },
        margin: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        },
        annotations: annotations
    };

    return (
        <div className={styles.dumbbellContainer}>
            <DumbbellPlot {...dumbbellConfig} />
        </div>
    );
};

export default Dumbbell;