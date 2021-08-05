import InputRow from "../components/InputRow";
function Constraints(props){
    const saConstraintsData=[
        {id:"SAconstraint",name:"SA Constraint",required:"",pattern:"\\d+"},
        {id:"Aeq",name:"Aeq",required:"",pattern:"\\[[\\d ;.-]+\\]"},
        {id:"Beq",name:"Beq",required:"",pattern:"\\[[\\d ;.-]+\\]"}
    ];
    const hjConstraintsData=[
        {id:"HJconstraint",name:"HJ Constraint",required:"",pattern:"\\d+"},
        {id:"Aeq",name:"Aeq",required:"",pattern:"\\[[\\d ;.-]+\\]"},
        {id:"Beq",name:"Beq",required:"",pattern:"\\[[\\d ;.-]+\\]"}
    ];

    const hjConstraintsList=hjConstraintsData.map(data=>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} required={data.required} sendData={props.sendData}/>);
    const saConstraintsList=saConstraintsData.map(data=>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} required={data.required} sendData={props.sendData}/>);
    const saConstraints=(
        <div className="constraints section">
            {saConstraintsList}
        </div>
    );
    const hjConstraints=(
        <div className="constraints section">
            {hjConstraintsList}
        </div>
    );
    switch (props.method) {
        case "sa":
            return saConstraints;
        case "hj":
            return hjConstraints;
        default:
            break;
    }
}
export default Constraints;