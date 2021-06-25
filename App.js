import { useState } from "react";
import Options from "./components/Options"
import InputRow from "./components/InputRow";
import { startOptimization, CheckStringVector } from "./modules/main";
import getPlot from "./modules/plot"
import createPlotlyComponent from 'react-plotly.js/factory'
import Plotly from 'plotly.js-cartesian-dist'
import { BrowserView } from 'react-device-detect';
import "./App.css"
var parametersList = [];

const Plot = createPlotlyComponent(Plotly);
const rowsData = [
  { id: "objectiveFunction", name: "Целевая функция", required: "required", pattern: "[a-zA-Z0-9 +/.*^()-]+" },
  { id: "lowerBound", name: "Нижняя граница", required: "required", pattern: "[pie\\d .,;\\[\\]-]+" },
  { id: "upperBound", name: "Верхняя граница", required: "required", pattern: "[pie\\d .,;\\[\\]-]+" }
];

const methodFullName=[];
methodFullName["HJ"]="Метод Хука-Дживса";
methodFullName["Swarm"]="Метод частиц в стае";
methodFullName["SA"]="Метод имитации отжига";
methodFullName["Genetic"]="Генетический алгоритм";
methodFullName["Tabu"]="Метод табу-поиска";
function App() {
  var [plotState, setPlotState] = useState({
    data: [],
    layout: {}
  });
  var [results, setResults] = useState('');
  var [method, setMethod] = useState("HJ");
  const inputRowList = rowsData.map(row =>
    <InputRow key={row.id} id={row.id} name={row.name} pattern={row.pattern} sendData={sendData} required={row.required} />);

  function sendData(id, value) {
    parametersList[id] = value;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (CheckStringVector(parametersList["lowerBound"])!==0){
      alert("Error while parsing the lower bound");
      return;
    }
    if (CheckStringVector(parametersList["upperBound"])!==0){
      alert("Error while parsing the upper bound");
        return;
    }
    var returnedFromMethod = startOptimization(method, parametersList);
    if (returnedFromMethod === -1){
      alert("Error while parsing the function");
      return;
    }
    else{
      if (returnedFromMethod===-2){
        alert("Error while parsing the start point");
        return;
      }
    }
    let checkedPoints = returnedFromMethod[0],
      functionIterations = returnedFromMethod[1],
      xMin = returnedFromMethod[2],
      fMin = returnedFromMethod[3],
      DIM = returnedFromMethod[4];
    let functionValues = returnedFromMethod[5];
    let methodTime = returnedFromMethod[6]/1000;
    if (DIM <= 2) {
      let X = returnedFromMethod[7],
        Y = returnedFromMethod[8],
        checkedPointsT = returnedFromMethod[9],
        labelsList = returnedFromMethod[10];
      let plotData = getPlot(X, Y, labelsList, checkedPointsT, xMin, fMin, DIM);
      var newPlotState = {
        data: plotData[0],
        layout: plotData[1]
      };
    }
    else {
      var newPlotState = {
        data: [],
        layout: {}
      };
    }
    //<textarea> filling
    let s = "";
    for (let i = 0; i < checkedPoints.length; i++) {
      let stringVector = "";
      for (const item of checkedPoints[i]) {
        stringVector += item.toFixed(4) + ',';
      }
      stringVector = stringVector.slice(0, -2);//remove the last comma
      s = s + i + ': (' + stringVector + '). ' + 'f=' + functionValues[i].toFixed(4) + '\n';
    }
    let stringMinVector = "";
    let j = 1;
    for (const i in xMin) {
      stringMinVector += xMin[i].toFixed(4) + ',';
      if (j === DIM) {
        break;
      }
      j++;
    }
    stringMinVector = stringMinVector.slice(0, -2);
    let newResults = `${results}\n${methodFullName[method]}\n${s}x*=(${stringMinVector}), f(x*)=${fMin.toFixed(4)}\nВычислений целевой функции ${functionIterations}. Время: ${methodTime} сек.\n------`;
    
    setPlotState(newPlotState);
    setResults(newResults);
  }

  return (
    <div className="App">
      <div className="main section">
        <div className="solver section">
          <label htmlFor="solver">Выберите метод:</label>
          <select id="solver">
            <option onClick={() => setMethod("HJ")}>{methodFullName["HJ"]}</option>
            <option onClick={() => setMethod("SA")}>{methodFullName["SA"]}</option>
            <option onClick={() => setMethod("Genetic")}>{methodFullName["Genetic"]}</option>
            <option onClick={() => setMethod("Swarm")}>{methodFullName["Swarm"]}</option>
            <option onClick={() => setMethod("Tabu")}>{methodFullName["Tabu"]}</option>
          </select>
        </div>
        <form onSubmit={onSubmit}>
        <div className="problem section">
          {inputRowList}
        </div>
        <Options method={method} sendData={sendData} />
        
          <div className="btn-submit section">
            <button id="btn-submit">Старт</button>
          </div>
        </form>
        <BrowserView>
          <div className="plot section">
            <Plot data={plotState.data} layout={plotState.layout}
              onInitialized={(figure) => setPlotState(figure)}
              onUpdate={(figure) => setPlotState(figure)} />
          </div>
        </BrowserView>

      </div>

      <div className="results section">
        <textarea className="tbox" readOnly value={results}>
        </textarea>
      </div>
    </div>
  );
}

export default App;
