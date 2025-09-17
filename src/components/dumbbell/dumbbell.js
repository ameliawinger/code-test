import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import sampleData from "../../sample-data/sample-sp.json";
import portfolioA from "../../sample-data/portfolioA.json";
import { DumbbellPlot } from "@visa/charts-react";
import styles from './dumbbell.module.css'



const Dumbbell = ({ portfolio, data }) => {

    console.log('got your data', data)

    const dumbbellConfig =

    {
        "uniqueID": "dumbbell-plot-compare-trend-to-benchmark",
        "mainTitle": "Regional spending patterns",
        "subTitle": {
            "text": "Compare payment volume in your top 5 cities compared to the U.S. average."
        },
        "accessibility": {
            "title": "Regional spending patterns",
            "longDescription": "This chart visualizes monthly payment volume for this year compared to last year.",
            "contextExplanation": "The values displayed in this chart are based on the filter selections made in the dashboard filter bar.",
            "statisticalNotes": "Monthly payment volume has outpaced last year's growth rate in 8 of the last 12 months. The most significant growth can be observed in June.",
            "structureNotes": "One reference line is present on the chart, indicating that the average payment volume is 24.6k. An annotation is present on the chart indicating the region of below and above average payment volumes.",
            "elementDescriptionAccessor": "dataPointAccessibilityNote",
            "hideDataTableButton": false,
            "includeDataKeyNames": true,
            "elementsAreInterface": false,
            "disableValidation": true, 
            "hideStrokes": true,

        },
        "showTooltip": false,
        "tooltipLabel": {
            "labelAccessor": [
                "location",
                "category",
                "value"
            ],
            "labelTitle": [
                "Location",
                "Category",
                "Value"
            ],
            "format": [
                "",
                "",
                ""
            ]
        },
        "width": 650,
        "height": 320,
        "ordinalAccessor": "ticker",
        "seriesAccessor": "category",
        "valueAccessor": "value",
        "labelAccessor": "label",
        "data": data,

        "dataKeyNames": {
            "ticker": "ticker",
            "category": "category",
            "value": "value",
            "label": "label",
            "offset": "offset",
            "ClassName": "ClassName",
            "dataPointAccessibilityNote": "dataPointAccessibilityNote"
        },
        "dataLabel": {
            "visible": true,
            "placement": "ends",
            "labelAccessor": "label",
            "format": "0[.0]%"
        },
        "colors": [
            "white",
            "magenta",
            "#d3d3d3"
        ],




        "hoverStyle": {
            "strokeWidth": 2
        },
        "clickStyle": {
            "strokeWidth": 3
        },
        "barStyle": {
            "width": 4,
            "opacity": 1,
            "strokeWidth": 0
            //"colorRule": "focus"
        },
        "focusMarker": {
            "key": "Above Average",
            "sizeFromBar": 3
        },
        "referenceLines": [
            {
                "value": 0,
                "label": "Zero line",
                "labelPlacementHorizontal": "right",
                "labelPlacementVertical": "top",
                "accessibilityDescription": "Reference line at zero",
                "accessibilityDecorationOnly": true
            }
        ],

        "referenceStyle": {
            "color": "black",
            "strokeWidth": 2,
            "dashed": "4,2",   // example dash pattern
            "opacity": 0.8
        },
        "marker": {
            "visible": true,
            "type": "dot",
            "sizeFromBar": 1
        },
        "legend": {
            "visible": false
        },
        "seriesLabel": {
            "visible": false
        },
        "layout": "horizontal",
        "sortOrder": "desc",
        "xAxis": {
            //"gridVisible": true,
            "visible": false,
            "label": " "
        },
        "yAxis": {
            "visible": true,
            "gridVisible": false,
            "label": " ",
            "format": "",
            "tickInterval": 1
        },
        "padding": {
            "top": 36,
            "bottom": 36,
            "left": 120,
            "right": 36
        },
        "margin": {
            "top": 0,
            "left": 0,
            "right": 0,
            "bottom": 0
        },

        /*"data": [
            {
                "location": "Los Angeles, CA",
                "category": "Below average",
                "value": 22400,
                "offset": 8,
                "dataPointAccessibilityNote": "Los Angeles, CA payment volume is below average."
            },
            {
                "location": "Los Angeles, CA",
                "category": "Above average",
                "value": 24600,
                "offset": -2,
                "dataPointAccessibilityNote": "Decorative data point."
            },
            {
                "location": "Austin, TX",
                "category": "Below average",
                "value": 18500,
                "offset": 8,
                "dataPointAccessibilityNote": "Austin, TX payment volume is below average."
            },
            {
                "location": "San Francisco, CA",
                "category": "Above average",
                "value": 33200,
                "offset": -1.5,
                "dataPointAccessibilityNote": "San Francisco, CA payment volume is above average."
            },
            {
                "location": "San Francisco, CA",
                "category": "Below average",
                "value": 24600,
                "offset": 6,
                "dataPointAccessibilityNote": "Decorative data point"
            },
            {
                "location": "New York, NY",
                "category": "Above average",
                "value": 27900,
                "offset": -1.5,
                "dataPointAccessibilityNote": "New York, NY payment volume is above average."
            },
            {
                "location": "Chicago, IL",
                "category": "Above average",
                "value": 27200,
                "offset": -1.5,
                "dataPointAccessibilityNote": "Chicago, IL payment volume is above average."
            },
            {
                "location": "Austin, TX",
                "category": "Above average",
                "value": 24600,
                "offset": -2,
                "dataPointAccessibilityNote": "Decorative data point"
            },
            {
                "location": "New York, NY",
                "category": "Below average",
                "value": 24600,
                "offset": 6,
                "dataPointAccessibilityNote": "Decorative data point."
            },
            {
                "location": "Chicago, IL",
                "category": "Below average",
                "value": 24600,
                "offset": 6,
                "dataPointAccessibilityNote": "Decorative data point."
            }
        ]*/
    }


    return (
        <div>
            <DumbbellPlot {...dumbbellConfig} />
        </div>
    );
};

export default Dumbbell;