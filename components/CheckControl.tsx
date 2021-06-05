import {ChangeEvent} from "react";

export default function CheckControl({onChange, label, id}: {
    onChange: (e: ChangeEvent<HTMLInputElement>) => any,
    label: string,
    id: string,
}) {
    return (
        <div>
            <label htmlFor={id}>
                <input type="checkbox" id={id} onChange={onChange}/>
                {label}
            </label>
        </div>
    );
}