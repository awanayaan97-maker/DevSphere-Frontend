

import "./FormInput.css";

function FormInput({ label, name, type = "text", placeholder, value, updateValue}) {    
    return (
        <div className="form-input">
            <label htmlFor={name}>{label}</label>

            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => updateValue(e)}
                 autoComplete="off"
            />
        </div>
    );
}

export default FormInput;