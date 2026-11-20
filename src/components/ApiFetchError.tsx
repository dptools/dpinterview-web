import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {ReactElement} from "react";
import {z} from "zod";

export interface BaseApiErrorProps {
    statusCode?: number,
    error: Error,
    message: string,
}

export interface NotFoundProps extends BaseApiErrorProps {
    statusCode: 404,
}

export interface ZodErrorProps extends BaseApiErrorProps {
    statusCode: 200,
    errors: z.ZodError[],
}

export interface GenericErrorProps extends BaseApiErrorProps {
    statusCode: undefined,
}

type ApiFetchErrorProps = NotFoundProps | ZodErrorProps | GenericErrorProps;

export const NotFoundError = (props: NotFoundProps) => (
    <Alert>
        <AlertTitle>{props.message ? props.message : "Not Found"}</AlertTitle>
        <AlertDescription>
            No results were returned
        </AlertDescription>
    </Alert>
);

function ZodDecodeError(props: ZodErrorProps) {
    return (
        <Alert>
            <AlertTitle>{props.message ? props.message : "Error decoding API response"}</AlertTitle>
            <AlertDescription>
                {props.errors.map((err, idx)=>(
                    <div key={`error-${idx}`}>{err.message}</div>
                ))}
            </AlertDescription>
        </Alert>
    )
}

export default function ApiFetchError(props: ApiFetchErrorProps): ReactElement {
    if (props.statusCode === 404) {
        return <NotFoundError {...props}/>
    } else if (props.statusCode === 200) {
        return <ZodDecodeError {...props} />
    } else {
        return (
            <Alert>
                <AlertTitle>{props.message ? props.message : "An error occurred"}</AlertTitle>
                <AlertDescription>An error occurred fetching data</AlertDescription>
            </Alert>
        );
    }
}