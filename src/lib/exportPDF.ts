import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (
  data: Record<string, any>[],
  filename: string,
  title: string = 'AttendEase Report'
) => {
  if (data.length === 0) return;

  const doc = new jsPDF();
  const headers = Object.keys(data[0]);

  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

  // Table
  autoTable(doc, {
    startY: 36,
    head: [headers],
    body: data.map(row => headers.map(h => String(row[h] ?? ''))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [99, 69, 237] },
    alternateRowStyles: { fillColor: [245, 245, 250] },
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};
