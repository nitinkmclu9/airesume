import ExcelJS from 'exceljs';
import { Response } from 'express';

export const generateExcelReport = async (res: Response, title: string, data: Record<string, unknown>): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ResumeIQ AI';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title.substring(0, 31));
  
  sheet.columns = [
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Details', key: 'details', width: 60 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FF6366F1' } };

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        sheet.addRow({
          category: i === 0 ? key : '',
          details: typeof item === 'object' ? JSON.stringify(item) : String(item),
        });
      });
    } else {
      sheet.addRow({ category: key, details: String(value) });
    }
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '-')}.xlsx"`);
  
  await workbook.xlsx.write(res);
  res.end();
};
