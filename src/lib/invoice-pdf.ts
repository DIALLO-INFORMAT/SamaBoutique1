
// src/lib/invoice-pdf.ts
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import type { Order } from './types'; // Assuming your Order type is defined here
import type { TOptions } from 'i18next'; // For translation interpolation

// Helper function for translation within the PDF generation
const translate = (t: (key: string, options?: TOptions<string>) => string, key: string, options?: TOptions<string>): string => {
  try {
    return t(key, options) || key; // Fallback to key if translation not found
  } catch (error) {
    console.error(`Error translating key "${key}":`, error);
    return key; // Fallback to key on error
  }
};

// Function to generate the PDF
export const generateInvoicePDF = async (order: Order, t: (key: string, options?: TOptions<string>) => string): Promise<Blob> => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20; // Initial Y position

  // --- Header ---
  // TODO: Replace with actual store logo and info if available from settings
  // doc.addImage(logoBase64, 'PNG', 15, 15, 40, 15); // Example logo
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(translate(t, 'site_name'), 15, yPos);
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  // TODO: Add store address and contact info from settings if available
  doc.text('123 Rue de la Boutique, Dakar, Sénégal', 15, yPos);
  yPos += 5;
  doc.text(`Tel: +221 33 800 00 00 | Email: ${translate(t, 'admin_settings_form_support_email')}`, 15, yPos);
  yPos += 15;

  // --- Invoice Title & Info ---
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(translate(t, 'dashboard_my_invoices_page_title'), 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${translate(t, 'dashboard_my_invoices_table_invoice_no')}: ${order.orderNumber}`, 15, yPos);
  doc.text(`${translate(t, 'dashboard_my_invoices_table_order_date')}: ${order.createdAt.toLocaleDateString('fr-FR')}`, 120, yPos);
  yPos += 10;

  // --- Customer Info ---
  doc.setFont('helvetica', 'bold');
  doc.text(translate(t, 'checkout_customer_info_title'), 15, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerInfo.name, 15, yPos);
  yPos += 5;
  doc.text(order.customerInfo.address, 15, yPos);
  yPos += 5;
  doc.text(`${translate(t, 'checkout_form_phone')}: ${order.customerInfo.phone}`, 15, yPos);
  if (order.customerInfo.email) {
      yPos += 5;
      doc.text(`${translate(t, 'checkout_form_email')}: ${order.customerInfo.email}`, 15, yPos);
  }
  yPos += 15;

  // --- Items Table ---
  const tableColumn = [
      translate(t, 'cart_table_product'),
      translate(t, 'cart_table_quantity'),
      translate(t, 'cart_table_unit_price'),
      translate(t, 'cart_table_total')
    ];
  const tableRows: (string | number)[][] = [];

  order.items.forEach(item => {
    const itemData = [
      item.name,
      item.quantity,
      item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      (item.price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    startY: yPos,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [22, 160, 133] }, // Primary color approximation
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
        0: { cellWidth: 'auto' }, // Product Name
        1: { cellWidth: 20, halign: 'center' }, // Quantity
        2: { cellWidth: 35, halign: 'right' }, // Unit Price
        3: { cellWidth: 40, halign: 'right' }  // Total Price
    }
  });

  // Get Y position after table
  //@ts-ignore // Necessary because jsPDF-AutoTable types might not be perfectly aligned
  yPos = (doc as any).lastAutoTable.finalY + 15;


  // --- Totals ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${translate(t, 'checkout_order_summary_total')}:`, 140, yPos, { align: 'right' });
  doc.text(order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 }), 195, yPos, { align: 'right' });
  yPos += 10;

  // --- Payment Method ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${translate(t, 'checkout_payment_method_title')}:`, 15, yPos);
  doc.setFont('helvetica', 'normal');
  const paymentMethodText = order.paymentMethod === 'Paiement à la livraison' ? t('checkout_payment_cod') :
                            order.paymentMethod === 'Wave' ? t('checkout_payment_wave') :
                            order.paymentMethod === 'Orange Money' ? t('checkout_payment_orange_money') :
                            order.paymentMethod === 'Carte Bancaire' ? t('checkout_payment_card') :
                            order.paymentMethod;
  doc.text(paymentMethodText, 55, yPos);
  yPos += 10;

  // --- Footer ---
   // Ensure footer is always at the bottom
  yPos = pageHeight - 25 > yPos ? pageHeight - 25 : yPos + 10; // Position near bottom or after content
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(translate(t, 'footer_about_us'), 15, yPos);
   doc.text(`${translate(t, 'copyright')} © ${new Date().getFullYear()} ${translate(t, 'site_name')}`, 105, yPos, { align: 'center'}); // Centered copyright
  yPos += 5;
   doc.text(translate(t, 'developed_by'), 105, yPos, { align: 'center'});

  // Output the PDF as a blob
  return doc.output('blob');
};

    