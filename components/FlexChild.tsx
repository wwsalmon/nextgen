import {ReactNode} from "react";

export default function FlexChild({children}: { children: ReactNode }) {
    return (
        <div style={{marginLeft: 16, marginRight: 16, width: "50%"}}>
            {children}
        </div>
    );
}