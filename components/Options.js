import InputRow from "../components/InputRow";
function Options(props) {
    const saOptionsData = [
        { id: "startPoint", name: "Точка старта", required: "required", pattern: "[pie\\d .,;\\[\\]-]+" },
        { id: "maxIterations", name: "Количество итераций", required: "required", pattern: "[1-9]\\d*" },
        { id: "initialTemperature", name: "Начальная температура(>0)", required: "required", pattern: "[\\d .]+" },
        { id: "c", name: "Параметр распределения Больцмана (>0)", required: "required", pattern: "[\\d .]+" },
        { id: "beta", name: "Параметр уменьшения температуры [0.8;0.99]", required: "required", pattern: "[\\d .]+" }
    ];
    const hjOptionsData = [
        { id: "startPoint", name: "Точка старта", required: "required", pattern: "[pie\\d .,;\\[\\]-]+" },
        { id: "deltaVector", name: "Вектор длин шагов", required: "required", pattern: "[pie\\d .,;\\[\\]-]+" },
        { id: "lambda", name: "Лямбда (Множитель шага >0)", required: "required", pattern: "[\\d. ]+" },
        { id: "alpha", name: "Альфа (Коэф.уменьшения шага >1)", required: "required", pattern: "[\\d. ]+" },
        { id: "eps", name: "Эпсилон(для остановки алгоритма >0)", required: "required", pattern: "[\\d. ]+" }
    ];
    const geneticOptionsData = [
        { id: "maxIterations", name: "Количество итераций",type:"text", required: "required", pattern: "[1-9]\\d*" },
        { id: "m", name: "Объём популяции",type:"text", required: "required", pattern: "[1-9]\\d*" },
        { id: "li", name: "Длина кодирования гена(<15)",type:"text", required: "required", pattern: "[1-9]\\d*" }
    ];
    const swarmOptionsData = [
        { id: "maxIterations", name: "Количество итераций",type:"text", required: "required", pattern: "[1-9]\\d*" },
        { id: "np", name: "Количество частиц в стае",type:"text", required: "required", pattern: "[1-9]\\d*" },
        { id: "ni", name: "Мин. и макс. число соседей",type:"text", required: "required", pattern: "[\\d ,;\\[\\]]+" },
        { id: "omega", name: "Весовой коэф.(0.01;0.7)",type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "alpha", name: "Альфа(для вычисления скорости)",type:"text", required: "required", pattern: "[\\d. ]+" },
        { id: "beta", name: "Бета(для вычисления скорости)",type:"text", required: "required", pattern: "[\\d. ]+" }
    ];
    const tabuOptionsData = [
        { id: "M", name: "Количество попыток иссл. поиска M",type:"text", required: "required", pattern: "[1-9]\\d*" },
        { id: "N", name: "Количество попыток иссл.-пер. поиска N",type:"text", required: "required", pattern: "[1-9]\\d*" },
        { id: "L", name: "Количество записей в табу-листе L", type:"text", required: "required", pattern: "[1-9]\\d*" },
        { id: "mod", name: "С методом ИО", type:"checkbox", required: "", pattern: "" }
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