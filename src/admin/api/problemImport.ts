import request from "@/common/utils/api";

export namespace importSpace {
    // 题目导入结果VO
    export interface ProblemImportResultVO {
        title: string;
        result: boolean;
        message: string;
    }
}

// FPS格式题目导入接口
export const importFPSProblem = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return request.post<importSpace.ProblemImportResultVO[]>('/api/p/admin/problem/import-fps', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// QDUOJ格式题目导入接口（预留）
export const importQDUOJProblem = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return request.post<importSpace.ProblemImportResultVO[]>('/api/admin/problem/import-qduoj', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// Hydro格式题目导入接口（预留）
export const importHydroProblem = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return request.post<importSpace.ProblemImportResultVO[]>('/api/admin/problem/import-hydro', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}