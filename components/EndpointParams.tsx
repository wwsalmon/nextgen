import {EndpointFieldObj, endpointFieldSetting} from "./EndpointGenerator";
import {Dispatch, SetStateAction} from "react";

export default function EndpointParams({endpointFields, setEndpointFields, requireAuth}: {
    endpointFields: EndpointFieldObj,
    setEndpointFields: Dispatch<SetStateAction<EndpointFieldObj>>,
    requireAuth: boolean,
}) {
    return (
        <>
            {Object.entries(endpointFields).map(([fieldName, fieldParam]) => (
                <div key={fieldName}>
                    <h4>{fieldName}</h4>
                    <select value={fieldParam.type} onChange={e => {
                        let newPostFields = {...endpointFields};
                        newPostFields[fieldName].type = e.target.value as endpointFieldSetting;
                        setEndpointFields(newPostFields);
                    }}>
                        {requireAuth && (
                            <>
                                <option value="userEmail">userEmail</option>
                                <option value="userId">userId</option>
                                <option value="userName">userName</option>
                                <option value="userUsername">userUsername</option>
                                <option value="userImage">userImage</option>
                            </>
                        )}
                        <option value="default">default</option>
                        <option value="param">param</option>
                    </select>
                    {fieldParam.type === "default" && (
                        <input type="text" value={fieldParam.value} onChange={e => {
                            let newPostFields = {...endpointFields};
                            newPostFields[fieldName].value = e.target.value;
                            setEndpointFields(newPostFields);
                        }}/>
                    )}
                </div>
            ))}
        </>
    );
}