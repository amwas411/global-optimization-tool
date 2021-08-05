import InputRow from "../components/InputRow";
function Options(props){
    const saOptionsData=[
        {id:"initialTemperature",name:"Начальная температура",required:"required",pattern:"\\d+"},
        {id:"maxTemperature",name:"Предельная температура",required:"required",pattern:"\\d+"}
    ];
    const hjOptionsData=[
        {id:"HJoption",name:"HJ option",required:"",pattern:"\\d+"}
    ];

    const hjOptionsList=hjOptionsData.map(data=>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} required={data.required} sendData={props.sendData}/>);
    const saOptionsList=saOptionsData.map(data=>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} required={data.required} sendData={props.sendData}/>);

    const saOptions=(
        <div className="options section">
           {saOptionsList}
        </div>
    );
    const hjOptions=(
        <div className="options section">
            {hjOptionsList}
        </div>
    );
    switch (props.method) {
        case "sa":
            return saOptions;
        case "hj":
            return hjOptions;
        default:
            break;
    }
}
export default Options;