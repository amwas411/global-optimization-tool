import InputRow from "../components/InputRow";
function Options(props) {
    const saOptionsData = [
        { id: "startPoint", name: "Точка старта", required: "required", pattern: "[pie\\d .,;\\[\\]-]+" },
        { id: "maxIterations", name: "Количество итераций", required: "required", pattern: "[\\d. ]+" },
        { id: "initialTemperature", name: "Начальная температура (>0)", required: "required", pattern: "[\\d .]+" },
        { id: "c", name: "Пар-р распределения Больцмана (>0)", required: "required", pattern: "[\\d .]+" },
        { id: "beta", name: "Пар-р уменьшения температуры [0.8;0.99]", required: "required", pattern: "[\\d .]+" }
    ];
    const hjOptionsData = [
        { id: "startPoint", name: "Точка старта", required: "required", pattern: "[pie\\d .,;\\[\\]-]+" },
        { id: "deltaVector", name: "Вектор длин шагов", required: "required", pattern: "[pie\\d .,;\\[\\]-]+" },
        { id: "lambda", name: "Множитель шага (>0)", required: "required", pattern: "[\\d. ]+" },
        { id: "alpha", name: "Коэф.уменьшения шага (>1)", required: "required", pattern: "[\\d. ]+" },
        { id: "eps", name: "Значение для остановки алгоритма (>0)", required: "required", pattern: "[\\d. ]+" },
        { id: "mod", name: "Применить метод мультистарта", type:"checkbox", required: "", pattern: "" }
    ];
    const geneticOptionsData = [
        { id: "maxIterations", name: "Количество итераций",type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "m", name: "Объём популяции",type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "li", name: "Длина кодирования гена (<15)",type:"text", required: "required", pattern: "[\\d. ]+" }
    ];
    const swarmOptionsData = [
        { id: "maxIterations", name: "Количество итераций",type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "np", name: "Количество частиц в стае",type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "ni", name: "Мин. и макс. число соседей",type:"text", required: "required", pattern: "[\\d ,;\\[\\]]+" },
        { id: "omega", name: "Весовой коэф. (0.01;0.7)",type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "alpha", name: "Альфа (для вычисления скорости)",type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "beta", name: "Бета (для вычисления скорости)",type:"text", required: "required", pattern: "[\\d. ]+" }
    ];
    const tabuOptionsData = [
        { id: "M", name: "Количество попыток иссл. поиска",type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "N", name: "Количество попыток иссл.-пер. поиска",type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "L", name: "Количество записей в табу-листе", type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "mod", name: "Использовать метод имитации отжига", type:"checkbox", required: "", pattern: "" }
    ];

    const hjOptionsList = hjOptionsData.map(data =>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} type={data.type} required={data.required} sendData={props.sendData} />);
    const saOptionsList = saOptionsData.map(data =>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} type={data.type} required={data.required} sendData={props.sendData} />);
    const geneticOptionsList = geneticOptionsData.map(data =>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} type={data.type} required={data.required} sendData={props.sendData} />);
    const swarmOptionsList = swarmOptionsData.map(data =>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} type={data.type} required={data.required} sendData={props.sendData} />);
    const tabuOptionsList = tabuOptionsData.map(data =>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} type={data.type} required={data.required} sendData={props.sendData} />);
    const saOptions = (
        <div className="options section">
            {saOptionsList}
        </div>
    );
    const hjOptions = (
        <div className="options section">
            {hjOptionsList}
        </div>
    );
    const geneticOptions = (
        <div className="options section">
            {geneticOptionsList}
        </div>
    );
    const swarmOptions = (
        <div className="options section">
            {swarmOptionsList}
        </div>
    );
    const tabuOptions = (
        <div className="options section">
            {tabuOptionsList}
        </div>
    );
    switch (props.method) {
        case "SA":
            return saOptions;
        case "HJ":
            return hjOptions;
        case "Genetic":
            return geneticOptions;
        case "Swarm":
            return swarmOptions;
        case "Tabu":
            return tabuOptions;
        default:
            break;
    }
}
export default Options;