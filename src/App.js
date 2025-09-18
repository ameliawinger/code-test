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
      <header>
        
      </header>
      <h1>Amelia Winger - Data Visualization Engineer Coding Exercise</h1>
      <div style={{ position: "relative" }}>
        <div>
          <TreemapGraphic portfolio={"portfolioA"} />
        </div>
        <div>
          <DumbbellGraphic portfolio={"portfolioC"} />
        </div>
        
      </div>
    </div>
  );
}

export default App;
