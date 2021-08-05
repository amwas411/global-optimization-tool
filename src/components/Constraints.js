import InputRow from "../components/InputRow";
function Constraints(props){
    const saConstraintsData=[
        {id:"SAconstraint",name:"SA Constraint",required:"",pattern:"\\d+"},
        {id:"Aeq",name:"Aeq",required:"",pattern:"\\[[\\d ;.-]+\\]"},
        {id:"Beq",name:"Beq",required:"",pattern:"\\[[\\d ;.-]+\\]"}
    ];
    const MultistartConstraintsData=[
        {id:"Multistartconstraint",name:"Multistart Constraint",required:"",pattern:"\\d+"},
        {id:"Aeq",name:"Aeq",required:"",pattern:"\\[[\\d ;.-]+\\]"},
        {id:"Beq",name:"Beq",required:"",pattern:"\\[[\\d ;.-]+\\]"}
    ];

    const MultistartConstraintsList=MultistartConstraintsData.map(data=>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} required={data.required} sendData={props.sendData}/>);
    const saConstraintsList=saConstraintsData.map(data=>
        <InputRow key={data.id} id={data.id} name={data.name} pattern={data.pattern} required={data.required} sendData={props.sendData}/>);
    const saConstraints=(
        <div className="constraints section">
            {saConstraintsList}
        </div>
    );
    const MultistartConstraints=(
        <div className="constraints section">
            {MultistartConstraintsList}
        </div>
    );
    switch (props.method) {
        case "SA":
            return saConstraints;
        case "Multistart":
            return MultistartConstraints;
        case "Genetic":
            return MultistartConstraints;
        default:
            break;
    }
}
export default Constraints;