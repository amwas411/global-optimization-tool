import "../styles/InputRow.css";

function InputRow (props) {
    function handleChange(e) {
        props.sendData(props.id,e.target.value);
    }
    const divId=props.id+"-container";
    return (
        <div id={divId}>
            <label className="row-label" htmlFor={props.id}>{props.name}</label>
            <input className="row-input" id={props.id} required={props.required} pattern={props.pattern} 
            autoComplete="off" onChange={handleChange}/>
        </div>
    );
}
export default InputRow;