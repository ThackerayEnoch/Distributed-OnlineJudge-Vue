import request from "@/common/utils/api";

export namespace CompileSpace {
    export interface CompileDTO {
        code: string;
        type: string;
        id?: number;
    }
}

export const compileCode = (data: CompileSpace.CompileDTO) => {
    return request.post<string>('/api/j/judge/compile', data);
}
