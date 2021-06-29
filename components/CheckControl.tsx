import {ChangeEvent} from "react";

export default function CheckControl({value, onChange, label, id}: {
    value: boolean,
    onChange: (e: ChangeEvent<HTMLInputElement>) => any,
    label: string,
    id: string,
}) {
    return (
        <div>
            <label htmlFor={id}>
                <input type="checkbox" id={id} onChange={onChange} checked={value}/>
                {label}
            </label>
        </div>
    );
}