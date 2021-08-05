import { useState } from "react";
import Options from "./components/Options"
import Constraints from "./components/Constraints"
import InputRow from "./components/InputRow";
import StartOptimization from "./modules/main";
import GetResults from "./modules/plot"
import createPlotlyComponent from 'react-plotly.js/factory'
import Plotly from 'plotly.js-cartesian-dist'
import {BrowserView} from 'react-device-detect';
import "./App.css"
var parametersList=[];
const Plot = createPlotlyComponent(Plotly);
const rowsData=[
  { id:"objectiveFunction", name:"Целевая функция",required:"required",pattern:"[a-zA-Z0-9 +/.*^()-]+" },
  { id:"startPoint", name:"Точка старта",required:"required",pattern:"\\[[\\d .-]+\\]" },
  { id:"maxIterations", name:"Количество итераций",required:"required",pattern:"[1-9]\\d*" },
  { id:"lowerBound", name:"Нижняя граница",required:"required",pattern:"\\[[infpe\\d .-]+\\]" }, 
  { id:"upperBound", name:"Верхняя граница",required:"required",pattern:"\\[[infpe\\d .-]+\\]" },

];

function App() {
  var [plotState,setPlotState]=useState({
    data:[],
    layout:{}
  });
  var [results,setResults]=useState('');
  var [method,setMethod]=useState("hj");
  const inputRowList=rowsData.map(row => 
    <InputRow key={row.id} id={row.id} name={row.name} pattern={row.pattern} sendData={sendData} required={row.required}/>);

  function sendData(id,value) {
    parametersList[id]=value;
  }
  function CheckParameters(){
    try {
      let startPoint=parametersList.startPoint;
      let re=/[\d.]+/g;
      let r=startPoint.match(re);
      if (r === null) {throw "Пустая строка";}
      re=/^\d+$|^\d+\.\d+$/;
      r.forEach(element => {
        if (element.match(re) === null) { throw "Слишком много точек";}
      });
      let lowerBound=parametersList.lowerBound;
      let upperBound=parametersList.upperBound;
      re=/\w+/g;
      let rl=lowerBound.match(re);
      let ru=upperBound.match(re);
      if (rl === null || ru === null ) { throw "Пустая строка"; }
      
      
    }
    catch (error) {
      return error;
    }
    return 0;
  }
  function onSubmit(e){
    e.preventDefault();
    /*var chk=CheckParameters();
    if (chk !== 0) {
      alert(chk); return;
    }*/
    var t = StartOptimization(method,parametersList);
    if (t === -1){
      alert("Ошибка ввода данных");
      return;
    }
    var returned = GetResults(t);
    var newPlotState={
      data:returned[0],
      layout:returned[1]
    };
    let nMethodIterations=returned[3];
    let nFunctionIterations=returned[4];
    let fMin=returned[5];
    let xMin=returned[6];
    let checkedPoints=returned[7];
    let s="";
    for (let i = 0; i < checkedPoints.length; i++) {
      s = s + '(';
      for (const item of checkedPoints[i]) {
        s=s+item.toPrecision(4)+',';
      }
      s=s+')\n';
    }
    let xmins='';
    for (const item of xMin) {
      xmins=xmins+item.toPrecision(4)+',';
    }
    let newResults=`${results}\n${s}f(${xmins})=${fMin.toPrecision(4)}\nИтераций метода ${nMethodIterations}, вычислений целевой функции ${nFunctionIterations}\n------`;
    setPlotState(newPlotState);    
    setResults(newResults);
  }
  
  return (
    <div className="App">
      <div className="main section">
        <form onSubmit={onSubmit}>
        <div className="solver section">
          <label htmlFor="solver">Выберите метод:</label>
          <select id="solver">
            <option value="hj" onClick={()=>setMethod("hj")}>HJ</option>
            <option value="sa" onClick={()=>setMethod("sa")}>SA</option>
          </select>
        </div>
        <div className="problem section">
          {inputRowList}
        </div>
        <div className="constraint section">
          <Constraints method={method} sendData={sendData}/>
        </div>
        <div className="btn-submit section">
        <button id="btn-submit">Старт</button>
        </div>
        <BrowserView>
        <div className="plot section">
        <Plot data={plotState.data} layout={plotState.layout}
            onInitialized={(figure) => setPlotState(figure)}
            onUpdate={(figure) => setPlotState(figure)}/>
        </div>
        </BrowserView>
        
        </form>
      </div>
      
      <div className="results section">
        <div className="options section">
          <Options method={method} sendData={sendData}/>
        </div>
          <textarea className="tbox" readOnly value={results}>
          </textarea>
        </div>
    </div>  
  );
}

export default App;
