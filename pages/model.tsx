import {Dispatch, SetStateAction, useEffect, useState} from "react";
import FlexContainer from "../components/FlexContainer";
import FlexChild from "../components/FlexChild";
import Link from "next/link";
import EndpointGenerator from "../components/EndpointGenerator";

export type valueType = "string" | "number" | "ObjectId" | "boolean";

export interface fieldType {
    fieldName: string,
    type: valueType,
    typeIsArray: boolean,
    required: boolean,
}

function addNewField(fields: fieldType[], setFields: Dispatch<SetStateAction<fieldType[]>>) {
    const newFields: fieldType[] = [
        ...fields,
        {
            fieldName: "",
            type: "string",
            typeIsArray: false,
            required: true,
        },
    ];

    setFields(newFields);
}

export default function Model() {
    const [fields, setFields] = useState<fieldType[]>([]);
    const [name, setName] = useState<string>("");

    const nameUppercase = name.slice(0, 1).toUpperCase() + name.slice(1);

    useEffect(() => {
        function addNewFieldShortcutHandler(e: KeyboardEvent) {
            if (e.key === "n" && document.activeElement.tagName !== "INPUT") {
                addNewField(fields, setFields);
            }
        }

        window.addEventListener("keydown", addNewFieldShortcutHandler);

        return () => window.removeEventListener("keydown", addNewFieldShortcutHandler);
    }, [fields]);

    useEffect(() => {
        if (fields.length) {
            localStorage.setItem("nextgenModelFields", JSON.stringify(fields));
        }
    }, [fields]);

    useEffect(() => {
        if (name) {
            localStorage.setItem("nextgenModelName", name);
        }
    }, [name]);

    useEffect(() => {
        const savedFields = localStorage.getItem("nextgenModelFields");
        const savedName = localStorage.getItem("nextgenModelName");
        if (savedFields) {
            const savedFieldsParsed = JSON.parse(savedFields);
            setFields(savedFieldsParsed);
        }
        if (savedName) setName(savedName);
    }, []);

    return (
        <>
            <Link href="/"><a>🠐 Back home</a></Link>
            <h1>Mongoose/Typescript/Next Model & API Code Generator</h1>
            <hr/>
            <h2>Model name</h2>
            <input type="text" value={name} onChange={e => {
                setName(e.target.value.toLowerCase());
            }}/>
            <hr/>
            <FlexContainer>
                <FlexChild>
                    <h2>Schema</h2>
                    <button onClick={() => addNewField(fields, setFields)}>Add new field (n)</button>
                    {fields.map((field, i) => (
                        <div key={i} style={{padding: 16, border: "1px solid #efefef", borderRadius: 16, marginBottom: 16, marginTop: 16}}>
                            <p>Field Name</p>
                            <input
                                type="text"
                                value={field.fieldName}
                                onChange={e => {
                                    let newFields = [...fields];
                                    fields[i].fieldName = e.target.value;
                                    setFields(newFields);
                                }}
                            />
                            <FlexContainer>
                                <FlexChild>
                                    <p>Field type</p>
                                    <select
                                        value={field.type + (field.typeIsArray ? "[]" : "")}
                                        onChange={e => {
                                            let newFields = [...fields];
                                            if (e.target.value.slice(-2) === "[]") {
                                                fields[i].typeIsArray = true;
                                                fields[i].type = e.target.value.slice(0, -2) as "string" | "number" | "ObjectId" | "boolean";
                                            } else {
                                                fields[i].typeIsArray = false;
                                                fields[i].type = e.target.value as "string" | "number" | "ObjectId" | "boolean";
                                            }
                                            setFields(newFields);
                                        }}
                                    >
                                        <option value="string">String</option>
                                        <option value="string[]">String array</option>
                                        <option value="number">Number</option>
                                        <option value="number[]">Number array</option>
                                        <option value="ObjectId">ObjectId</option>
                                        <option value="ObjectId[]">ObjectId array</option>
                                        <option value="boolean">Boolean</option>
                                    </select>
                                </FlexChild>
                                <FlexChild>
                                    <p>Field required?</p>
                                    <div>
                                        <label htmlFor={"fieldRequired" + i}>
                                            <input
                                                type="checkbox" id={"fieldRequired" + i} checked={fields[i].required} onChange={e => {
                                                let newFields = [...fields];
                                                fields[i].required = e.target.checked;
                                                setFields(newFields);
                                            }}
                                            />
                                            Required
                                        </label>
                                    </div>
                                </FlexChild>
                            </FlexContainer>
                            <button onClick={() => {
                                let newFields = [...fields];
                                newFields.splice(i, 1);
                                setFields(newFields);
                            }}>Delete field</button>
                        </div>
                    ))}
                </FlexChild>
                <FlexChild>
                    <h2>Code output</h2>
                    <h3>utils/types.ts</h3>
                    <pre>
                        <code>
                            export interface {nameUppercase}Obj &#123;<br/>
                            {fields.map(field => `\t ${field.fieldName}${field.required ? "" : "?"}: ${field.type === "ObjectId" ? "string" : field.type}${field.typeIsArray ? "[]" : ""}; \n`)}
                            &#125;
                        </code>
                    </pre>
                    <h3>models/{nameUppercase}.ts</h3>
                    <pre>
                        <code>
                            import mongoose, &#123;Document, Model&#125; from "mongoose";<br/>
                            import &#123;{nameUppercase}Obj&#125; from "../utils/types";<br/>
                            <br/>
                            interface {nameUppercase}Doc extends {nameUppercase}Obj, Document &#123;&#125;<br/>
                            <br/>
                            const {nameUppercase}Schema = new mongoose.Schema(&#123;<br/>
                            {fields.map(field => `\t${field.fieldName}: { required: ${field.required.toString()}, type: ${(field.typeIsArray ? "[" : "") + {
                                string: "String",
                                number: "Number",
                                boolean: "Boolean",
                                ObjectId: "mongoose.Schema.Types.ObjectId",
                            }[field.type] + (field.typeIsArray ? "]" : "")} }, \n`)}
                            &#125;, &#123;<br/>
                            {"\t"}timestamps: true,<br/>
                            &#125;);<br/>
                            <br/>
                            export const {nameUppercase}Model = mongoose.models.{name} || mongoose.model&lt;{nameUppercase}Doc&gt;("{name}", {nameUppercase}Schema);
                        </code>
                    </pre>
                </FlexChild>
            </FlexContainer>
            <hr/>
            <EndpointGenerator fields={fields} nameUppercase={nameUppercase}/>
        </>
    )
}