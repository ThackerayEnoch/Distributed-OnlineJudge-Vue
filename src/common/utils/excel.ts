import ExcelJS from "exceljs";
import * as XLSX from "xlsx"; // 引入 xlsx 库
import globalMessage from "@/common/utils/toast";
import { saveAs } from "file-saver";

export interface ExcelUser {
  username: string;
  name: string;
  group: string;
  nickname: string;
  password?: string;
}

const COLUMN_INDEX = {
  USERNAME: 1, // B列
  NAME: 2, // C列
  GROUP: 3, // D列
};

// 允许的文件类型（包括 .xls 和 .xlsx）
const ALLOWED_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
];

// 最大文件大小（单位：MB）
const MAX_FILE_SIZE_MB = 5;

// 处理多个Excel文件
export async function parseExcelFiles(
  files: FileList | File[],
): Promise<{ users: ExcelUser[]; errors: string[] }> {
  const userDataList: ExcelUser[] = [];
  const errorMessages: string[] = [];

  for (const file of files) {
    // **文件校验**
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errorMessages.push(`文件 "${file.name}" 格式错误，仅支持 .xls 和 .xlsx`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      errorMessages.push(
        `文件 "${file.name}" 过大，最大允许 ${MAX_FILE_SIZE_MB}MB`,
      );
      continue;
    }

    let parsedUsers: ExcelUser[] = [];

    // **解析 .xlsx（使用 ExcelJS）**
    if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      parsedUsers = await parseXLSX(file);
    }

    // **解析 .xls（使用 xlsx 库）**
    else if (file.type === "application/vnd.ms-excel") {
      parsedUsers = await parseXLS(file);
    }

    userDataList.push(...parsedUsers);
  }

  return { users: userDataList, errors: errorMessages };
}

// 解析 .xlsx 文件（使用 ExcelJS）
async function parseXLSX(file: File): Promise<ExcelUser[]> {
  const userDataList: ExcelUser[] = [];
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet || worksheet.rowCount <= 5) {
    throw new Error(`Excel文件 "${file.name}" 行数不足，至少需要6行数据`);
  }

  for (let rowNumber = 5; rowNumber < worksheet.rowCount - 1; rowNumber++) {
    const row = worksheet.getRow(rowNumber + 1);
    if (row.actualCellCount === 0) continue;

    const userData: ExcelUser = {
      username: row.getCell(COLUMN_INDEX.USERNAME+1).text.trim(),
      name: row.getCell(COLUMN_INDEX.NAME+1).text.trim(),
      group: row.getCell(COLUMN_INDEX.GROUP+1).text.trim(),
      nickname:
        row.getCell(COLUMN_INDEX.GROUP+1).text.trim() +
        row.getCell(COLUMN_INDEX.NAME+1).text.trim(),
    };
    if (!userData.username) {
      globalMessage.error(
        "Excel解析",
        `Excel文件 "${file.name}" 第 ${rowNumber + 1} 行: 学号不能为空`,
      );
    }
    if (!userData.name) {
      globalMessage.error(
        "Excel解析",
        `Excel文件 "${file.name}" 第 ${rowNumber + 1} 行: 姓名不能为空`,
      );
    }

    userDataList.push(userData);
  }

  return userDataList;
}

export async function parseXLS(file: File): Promise<ExcelUser[]> {
  const userDataList: ExcelUser[] = [];
  // 使用 FileReader 来读取文件内容
  const arrayBuffer = await file.arrayBuffer();

  // 使用 xlsx 解析 Excel 文件
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Excel文件 "${file.name}" 没有可用的工作表`);
  }

  // 将 worksheet 转换为二维数组
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rows.length <= 5) {
    throw new Error(`Excel文件 "${file.name}" 行数不足，至少需要6行数据`);
  }

  // 从第6行开始解析
  for (let rowNumber = 5; rowNumber < rows.length; rowNumber++) {
    const row = rows[rowNumber] as any[];

    if (!row || row.length < 3) continue;
    const userData: ExcelUser = {
      username: (row[COLUMN_INDEX.USERNAME] || "").trim(),
      name: (row[COLUMN_INDEX.NAME] || "").trim(),
      group: (row[COLUMN_INDEX.GROUP] || "").trim(),
      nickname:
        (row[COLUMN_INDEX.GROUP] || "").trim() +
        (row[COLUMN_INDEX.NAME] || "").trim(),
    };

    // 基础数据验证
    if (!userData.username) {
      globalMessage.error(
        "Excel解析",
        `Excel文件 "${file.name}" 第 ${rowNumber + 1} 行: 学号不能为空`,
      );
    }
    if (!userData.name) {
      globalMessage.error(
        "Excel解析",
        `Excel文件 "${file.name}" 第 ${rowNumber + 1} 行: 姓名不能为空`,
      );
    }

    userDataList.push(userData);
  }

  return userDataList;
}

export interface ExportHeader {
  key: string; // 数据对象的属性名
  title: string; // Excel 中显示的表头名
  width?: number; // 可选，列宽
}

/**
 * 导出 Excel 文件
 * @param data 导出的数据数组
 * @param headers 表头映射 [{ key: 'name', title: '姓名' }]
 * @param filename 导出的文件名（默认：export.xlsx）
 * @param includeIndex 是否包含序号列（默认：false）
 */
export async function exportToExcel<T>(
  data: T[],
  headers: ExportHeader[],
  filename: string = "export",
  includeIndex: boolean = false,
) {
  if (data.length === 0) {
    console.warn("数据为空，无法导出");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");

  // 设置列
  const columns = headers.map((h) => ({
    header: h.title,
    key: h.key,
    width: h.width || 20,
  }));

  if (includeIndex) {
    columns.unshift({ header: "序号", key: "index", width: 10 });
  }

  worksheet.columns = columns;
  // 添加数据
  data.forEach((row, index) => {
    const rowData: Record<string, any> = {};
    headers.forEach((h) => {
      rowData[h.key] = row[h.key as keyof T] ?? ""; // 防止 undefined
    });
    if (includeIndex) {
      rowData["index"] = index + 1; // 添加序号
    }
    worksheet.addRow(rowData);
  });
  // 设置所有单元格的对齐方式
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.font = { name: "DengXian", size: 10 }; // 设置字体
        cell.alignment = { horizontal: "left" }; // 设置为左对齐
      });
    });
  // 设置表头样式
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFFFF" },
    };
  });

  // 添加网格线
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });
  // 生成 Blob 并保存
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}
