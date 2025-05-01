
// src/lib/invoice-pdf.d.ts
import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number }; // Add this line if you use lastAutoTable
  }
}

    