import {postJson} from "@/lib/api";
import {SetIgnore, SetIgnoreFail, SetIgnoreSuccess} from "@/lib/api/v1/InterviewFiles/types";
import {ApiError} from "next/dist/server/api-utils";

export async function postSetIgnore(props: SetIgnore) {
    const response = await postJson(`/api/v1/interview-files/set-ignore`, props);
    if (!response.ok) {
        const body = await response.json()
        const decode = await SetIgnoreFail.safeDecodeAsync(body);
        if (decode.success) {
            throw new ApiError(response.status, decode.data.error);
        } else {
            throw new ApiError(response.status, "An error occurred");
        }
    }
    return props;
}