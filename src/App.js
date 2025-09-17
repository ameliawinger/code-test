import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useRef, useState, Fragment } from "react";
import { BarChart } from "@visa/charts-react";
import TreemapGraphic from "./components/treemap/treemapcontainer";
import DumbbellGraphic from "./components/dumbbell/dumbbellcontainer";

function App() {
  const [isClient, setIsClient] = useState();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      setIsClient(true);
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div style={{ position: "relative" }}>
        <div>
          <TreemapGraphic portfolio={"portfolioA"} />
        </div>
        <div>
          <DumbbellGraphic portfolio={"portfolioC"} />
        </div>
        <BarChart
          mainTitle="BarChart"
          subTitle="Vertical (default) bar chart example"
          data={[
            { month: "January", value: 10 },
            { month: "February", value: 15 },
            { month: "March", value: 20 },
            { month: "April", value: 25 },
            { month: "May", value: 30 },
            { month: "June", value: 35 },
          ]}
          ordinalAccessor="month"
          valueAccessor="value"
          height={400}
          width={600}
        />
      </div>
    </div>
  );
}

export default App;
