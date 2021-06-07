import {fieldType, valueType} from "../pages/model";
import FlexContainer from "./FlexContainer";
import FlexChild from "./FlexChild";
import {useEffect, useState} from "react";
import CheckControl from "./CheckControl";
import EndpointParams from "./EndpointParams";

type userParams = "userEmail" | "userId" | "userName" | "userUsername" | "userImage";
export type endpointFieldSetting = userParams | "default" | "param";
export type EndpointFieldObj = {
    [key: string]: {
        type: endpointFieldSetting,
        value: string,
    }
};

export default function EndpointGenerator({nameUppercase, fields}: { nameUppercase: string, fields: fieldType[] }) {
    const [allowPost, setAllowPost] = useState<boolean>(false);
    const [postRequireAuth, setPostRequireAuth] = useState<boolean>(true);
    const [allowGet, setAllowGet] = useState<boolean>(false);
    const [getRequireAuth, setGetRequireAuth] = useState<boolean>(true);
    const [getSingle, setGetSingle] = useState<boolean>(true);
    const [getPagination, setGetPagination] = useState<boolean>(false);
    const [paginationSkip, setPaginationSkip] = useState<number>(10);
    const [allowDelete, setAllowDelete] = useState<boolean>(false);
    const [postFields, setPostFields] = useState<EndpointFieldObj>({});
    const [getFields, setGetFields] = useState<EndpointFieldObj>({});
    const [deleteFields, setDeleteFields] = useState<EndpointFieldObj>({});

    useEffect(() => {
        const postFieldEntries = fields.map(field => [field.fieldName, {
            type: postFields[field.fieldName] ? postFields[field.fieldName].type : "param",
            value: postFields[field.fieldName] ? postFields[field.fieldName].value : "",
        }]);

        const getFieldEntries = fields.map(field => [field.fieldName, {
            type: getFields[field.fieldName] ? getFields[field.fieldName].type : "param",
            value: getFields[field.fieldName] ? getFields[field.fieldName].value : "",
        }]);

        const deleteFieldEntries = fields.map(field => [field.fieldName, {
            type: getFields[field.fieldName] ? getFields[field.fieldName].type : "param",
            value: getFields[field.fieldName] ? getFields[field.fieldName].value : "",
        }]);

        const newPostFields = Object.fromEntries(postFieldEntries);
        const newGetFields = Object.fromEntries(getFieldEntries);
        const newDeleteFields = Object.fromEntries(deleteFieldEntries);

        setPostFields(newPostFields);
        setGetFields(newGetFields);
        setDeleteFields(newDeleteFields);
    }, [fields]);

    const PostFieldsArr = Object.entries(postFields).map(([fieldName, fieldParam]) => (
        {fieldName: fieldName, fieldType: fieldParam.type, fieldValue: fieldParam.value}
    ));

    const GetFieldsArr = Object.entries(getFields).map(([fieldName, fieldParam]) => (
        {fieldName: fieldName, fieldType: fieldParam.type, fieldValue: fieldParam.value}
    ));

    const DeleteFieldsArr = Object.entries(deleteFields).map(([fieldName, fieldParam]) => (
        {fieldName: fieldName, fieldType: fieldParam.type, fieldValue: fieldParam.value}
    ));

    const authSnippet = `const session = await getSession({ req });
            if (!session) return res.status(403);`;

    function getSessionParam(type: userParams) {
        return {
            userId: "userId",
            userName: "user.name",
            userUsername: "username",
            userImage: "user.image",
            userEmail: "user.email",
        }[type];
    }

    function getFieldParam(fieldType: endpointFieldSetting, fieldValue: string, fieldName: string, isPost: boolean) {
        return {
            default: fieldValue,
            param: `req.${isPost ? "body" : "query"}.${fieldName}`,
            userId: "session.userId",
            userName: "session.user.name",
            userUsername: "session.username",
            userImage: "session.user.image",
            userEmail: "session.user.email",
        }[fieldType];
    }

    return (
        <FlexContainer>
            <FlexChild>
                <h2>Endpoint params</h2>
                <h3>Get</h3>
                <CheckControl
                    value={allowGet}
                    onChange={e => setAllowGet(e.target.checked)}
                    label="Allow?"
                    id="allowGet"
                />
                {allowGet && (
                    <>
                        <CheckControl
                            value={getRequireAuth}
                            onChange={e => setGetRequireAuth(e.target.checked)}
                            label="Require auth?"
                            id="getAuth"
                        />
                        <CheckControl
                            value={getSingle}
                            onChange={e => setGetSingle(e.target.checked)}
                            label="Get single document?"
                            id="getSingle"
                        />
                        {!getSingle && (
                            <>
                                <CheckControl
                                    value={getPagination}
                                    onChange={e => setGetPagination(e.target.checked)}
                                    label="Enable pagination?"
                                    id="getPagination"
                                />
                                {getPagination && (
                                    <input
                                        type="number"
                                        value={paginationSkip}
                                        onChange={e => setPaginationSkip(+e.target.value)}
                                    />
                                )}
                            </>
                        )}
                        <EndpointParams
                            endpointFields={getFields}
                            setEndpointFields={setGetFields}
                            requireAuth={getRequireAuth}
                        />
                    </>
                )}
                <h3>Post</h3>
                <CheckControl
                    value={allowPost}
                    onChange={e => setAllowPost(e.target.checked)}
                    label="Allow?"
                    id="allowPost"
                />
                {allowPost && (
                    <>
                        <CheckControl
                            value={postRequireAuth}
                            onChange={e => setPostRequireAuth(e.target.checked)}
                            label="Require auth?"
                            id="postAuth"
                        />
                        <EndpointParams
                            endpointFields={postFields}
                            setEndpointFields={setPostFields}
                            requireAuth={postRequireAuth}
                        />
                    </>
                )}
                <h3>Delete</h3>
                <CheckControl
                    value={allowDelete}
                    onChange={e => setAllowDelete(e.target.checked)}
                    label="Allow?"
                    id="allowDelete"
                />
            </FlexChild>
            <FlexChild>
                <h2>Code output</h2>
                <pre>
                    <code>
                        {`import {${nameUppercase}Model} from "../../../models/${nameUppercase}";
import dbConnect from "../../utils/dbConnect";
import {NextApiRequest, NextApiResponse} from "next";
${((allowPost && postRequireAuth) || (allowGet && getRequireAuth)) ? "import {getSession} from \"next-auth/client\";" : ""}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {    
        ${allowGet ? `case "GET": {
            ${getRequireAuth ? authSnippet : ""}
            if (!(${GetFieldsArr.filter(d => d.fieldType === "param").map(({fieldName}, i) => `${i === 0 ? "" : " || "}req.query.${fieldName}`).join("")})) {
                return res.status(406);                        
            }
            
            try {                
                let conditions = {};

                if (req.query.id) conditions["_id"] = req.query.id;
                ${GetFieldsArr.filter(d => d.fieldType !== "default").map(({fieldName, fieldType}) => `${fieldType.slice(0, 4) === "user" ? "" : `if (req.query.${fieldName}) `}conditions["${fieldName}"] = ${getFieldParam(fieldType, "", fieldName, false)};
                `).join("")}
                         
                await dbConnect();   
            
                const thisObject = await ${nameUppercase}Model.aggregate([
                    {$match: conditions},
                    ${getPagination ? `{$skip: (+req.query.page - 1) * ${paginationSkip}},
                    {$limit: ${paginationSkip}},` : ""}
                ]);
                
                if (!thisObject || !thisObject.length) return res.status(404);
                
                return res.status(200).json({data: ${getSingle ? "thisObject[0]" : "thisObject"}});
            } catch (e) {
                return res.status(500).json({message: e});                        
            }
        }
        ` : ""}    
        ${allowPost ? `case "POST": {
            ${postRequireAuth ? authSnippet : ""}
            try {
                await dbConnect();
                
                if (req.body.id) {
                    if (!(${PostFieldsArr.filter(d => d.fieldType === "param").map(({fieldName}, i) => `${i === 0 ? "" : " || "}req.body.${fieldName}`).join("")})) {
                        return res.status(406);            
                    }
                    const thisObject = await ${nameUppercase}Model.findById(req.body.id);
                    if (!thisObject) return res.status(404);
                    ${PostFieldsArr.filter(d => d.fieldType.slice(0, 4) === "user").map(({fieldName, fieldType}) =>
                            `thisObject.${fieldName} = session.${getSessionParam(fieldType as userParams)};`).join("")}
                    ${PostFieldsArr.filter(d => d.fieldType === "param").map(({fieldName, fieldValue}) =>
                            `thisObject.${fieldName} = req.body.${fieldName};
                    `).join("")}
                    await thisObject.save();
                    
                    return res.status(200).json({message: "Object updated"});                            
                } else {
                    if (!(${PostFieldsArr.filter(d => d.fieldType === "param").map(({fieldName}, i) => `${i === 0 ? "" : " && "}req.body.${fieldName}`).join("")})) {
                        return res.status(406);            
                    }
                    
                    const new${nameUppercase} = new ${nameUppercase}Model({
                        ${PostFieldsArr.map(({fieldName, fieldType, fieldValue}) =>
                        `${fieldName}: ${getFieldParam(fieldType, fieldValue, fieldName, true)},`).join("\n\t\t\t")}                             
                    });
                    
                    const saved${nameUppercase} = await new${nameUppercase}.save();
                    
                    return res.status(200).json({message: "Object created", id: saved${nameUppercase}._id.toString());
                }            
            } catch (e) {
                return res.status(500).json({message: e});            
            }
        }
        ` : ""}
        ${allowDelete ? `case "DELETE": {
            ${authSnippet}
            
            if (!req.body.id) return res.status(406);
            
            try {
                await dbConnect();
                               
                const thisObject = await ${nameUppercase}Model.findById(req.body.id);
                
                if (!thisObject) return res.status(404);
                if (thisObject.userId.toString() !== session.userId) return res.status(403);
                
                await ${nameUppercase}Model.deleteOne({_id: req.body.id});
                
                return res.status(200).json({message: "Object deleted"});
            } catch (e) {
                return res.status(500).json({message: e});
            }
        }
        ` : ""}
        default:
            return res.status(405);
    }
}`}
                    </code>
                </pre>
            </FlexChild>
        </FlexContainer>
    );
}