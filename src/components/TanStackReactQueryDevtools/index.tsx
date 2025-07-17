'use client';

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren } from "react";

export const TanStackReactQueryDevtools = ({
    children
}: PropsWithChildren) => {
    return (
        <>
            {children}
            <div dir="ltr">
                <ReactQueryDevtools />
            </div>
        </>
    )
}