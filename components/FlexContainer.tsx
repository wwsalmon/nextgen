import {ReactNode} from "react";

export default function FlexContainer({children}: { children: ReactNode }) {
    return (
        <div style={{display: "flex", marginLeft: -16, marginRight: -16}}>
            {children}
        </div>
    );
}