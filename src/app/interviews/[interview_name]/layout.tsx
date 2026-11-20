import React, {ReactNode} from "react";

export default function Layout({children,}: Readonly<{children: ReactNode}>) {
    return (
        <div className="container mx-auto p-4">
            {children}
        </div>
    );
}