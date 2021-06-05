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
    const [postRequireAuth, setPostRequireAuth] = useState<boolean>(false);
    const [allowGet, setAllowGet] = useState<boolean>(false);
    const [getRequireAuth, setGetRequireAuth] = useState<boolean>(false);
    const [postFields, setPostFields] = useState<EndpointFieldObj>({});
    const [getFields, setGetFields] = useState<EndpointFieldObj>({});

    useEffect(() => {
        const postFieldEntries = fields.map(field => [field.fieldName, {
            type: postFields[field.fieldName] ? postFields[field.fieldName].type : "param",
            value: postFields[field.fieldName] ? postFields[field.fieldName].value : "",
        }]);

        const getFieldEntries = fields.map(field => [field.fieldName, {
            type: getFields[field.fieldName] ? getFields[field.fieldName].type : "param",
            value: getFields[field.fieldName] ? getFields[field.fieldName].value : "",
        }]);

        const newPostFields = Object.fromEntries(postFieldEntries);
        const newGetFields = Object.fromEntries(getFieldEntries);

        setPostFields(newPostFields);
        setGetFields(newGetFields);
    }, [fields]);

    const PostFieldsArr = Object.entries(postFields).map(([fieldName, fieldParam]) => (
        {fieldName: fieldName, fieldType: fieldParam.type, fieldValue: fieldParam.value}
    ));

    const GetFieldsArr = Object.entries(getFields).map(([fieldName, fieldParam]) => (
        {fieldName: fieldName, fieldType: fieldParam.type, fieldValue: fieldParam.value}
    ));

    function getSessionParam(type: userParams) {
        return {
            userId: "userId",
            userName: "user.name",
            userUsername: "username",
            userImage: "user.image",
            userEmail: "user.email",
        }[type];
    }

    return (
        <FlexContainer>
            <FlexChild>
                <h2>Endpoint params</h2>
                <h3>Get</h3>
                <CheckControl onChange={e => setAllowGet(e.target.checked)} label="Allow?" id="allowGet"/>
                <CheckControl onChange={e => setGetRequireAuth(e.target.checked)} label="Require auth?" id="getAuth"/>
                {allowGet && (
                    <EndpointParams
                        endpointFields={getFields}
                        setEndpointFields={setGetFields}
                        requireAuth={getRequireAuth}
                    />
                )}
                <h3>Post</h3>
                <CheckControl onChange={e => setAllowPost(e.target.checked)} label="Allow?" id="allowPost"/>
                <CheckControl onChange={e => setPostRequireAuth(e.target.checked)} label="Require auth?" id="postAuth"/>
                {allowPost && (
                    <EndpointParams
                        endpointFields={postFields}
                        setEndpointFields={setPostFields}
                        requireAuth={postRequireAuth}
                    />
                )}
            </FlexChild>
            <FlexChild>
                <h2>Code output</h2>
                <pre>
                    <code>
                        {`import {${nameUppercase}Obj} from "../../../utils/types";
import {${nameUppercase} from "../../../models/${nameUppercase.toLowerCase()}";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        ${allowPost ? `case "POST":
            ${postRequireAuth ?
            `const session = await getSession({ req });
            if (!session) return res.status(403);` : ""}
            try {
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
                    
                    await ${nameUppercase}Model.create({
                        ${PostFieldsArr.map(({fieldName, fieldType, fieldValue}) =>
                        `${fieldName}: ${{
                            default: fieldValue,
                            param: `req.body.${fieldName}`,
                            userId: "session.userId",
                            userName: "session.user.name",
                            userUsername: "session.username",
                            userImage: "session.user.image",
                            userEmail: "session.user.email",                            
                        }[fieldType]};`).join("\n\t\t\t")}                    
                    });
                    
                    return res.status(200).json({message: "Object created"});
                }            
            } catch (e) {
                return res.status(500).json({message: e});            
            }
        ` : ""}    
        ${allowGet ? `case "GET":
            ${getRequireAuth ? "const session = await getSession({ req });" : ""}
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