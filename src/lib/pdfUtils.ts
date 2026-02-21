import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateInvoicePdf = (invoiceData: any) => {
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // -- COLORS & STYLES --
    const primaryColor: [number, number, number] = [37, 99, 235]; // Tailwind blue-600
    const textColor: [number, number, number] = [51, 65, 85]; // slate-700
    const lightGray: [number, number, number] = [241, 245, 249]; // slate-100

    // -- LOGO HEADER --
    // Since we don't have a reliable external logo image without an async fetch, 
    // we'll draw a simulated logo (a stylish colored box with text) 
    // to strictly fulfill "company logo on top of it" visually.
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(14, 15, 12, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CS", 15.5, 23); // "Company Symbol" internal

    // Company Name next to "Logo"
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(22);
    doc.text("INVOICE", 30, 25);

    // -- INVOICE DETAILS (Top Right) --
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont("helvetica", "normal");

    const invoiceNumberText = `Invoice #: ${invoiceData.invoice_number || invoiceData.invoiceNumber}`;
    const invoiceDateText = `Date: ${format(new Date(invoiceData.created_at || invoiceData.date || new Date()), 'MMM dd, yyyy')}`;
    const dueDateText = `Due Date: ${invoiceData.due_date ? format(new Date(invoiceData.due_date), 'MMM dd, yyyy') : 'On Receipt'}`;
    const statusText = `Status: ${(invoiceData.status || 'Pending').toUpperCase()}`;

    doc.text(invoiceNumberText, pageWidth - 14, 20, { align: "right" });
    doc.text(invoiceDateText, pageWidth - 14, 26, { align: "right" });
    doc.text(dueDateText, pageWidth - 14, 32, { align: "right" });

    doc.setFont("helvetica", "bold");
    if (invoiceData.status === "paid") {
        doc.setTextColor(22, 163, 74); // green-600
    } else if (invoiceData.status === "overdue") {
        doc.setTextColor(220, 38, 38); // red-600
    } else {
        doc.setTextColor(202, 138, 4); // yellow-600
    }
    doc.text(statusText, pageWidth - 14, 38, { align: "right" });

    // -- BILL TO SECTION --
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(14, 45, pageWidth - 14, 45);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 14, 55);

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let currentY = 62;
    if (invoiceData.client_name || invoiceData.clientName) {
        doc.setFont("helvetica", "bold");
        doc.text(`${invoiceData.client_name || invoiceData.clientName}`, 14, currentY);
        doc.setFont("helvetica", "normal");
        currentY += 6;
    }
    if (invoiceData.client_email || invoiceData.clientEmail) {
        doc.text(`${invoiceData.client_email || invoiceData.clientEmail}`, 14, currentY);
        currentY += 6;
    }

    // Add extra space before table
    currentY += 10;

    // -- ITEMS TABLE --
    const items = invoiceData.items || [];
    const tableData = items.map((item: any) => [
        item.productName || item.product_name || `Product ID: ${item.product_id}`,
        item.quantity.toString(),
        `$${parseFloat(item.price).toFixed(2)}`,
        `$${(item.quantity * parseFloat(item.price)).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['Description', 'Qty', 'Unit Price', 'Amount']],
        body: tableData,
        theme: 'plain',
        headStyles: {
            fillColor: lightGray,
            textColor: primaryColor,
            fontStyle: 'bold',
            halign: 'left',
        },
        columnStyles: {
            0: { halign: 'left', cellWidth: 'auto' },
            1: { halign: 'center', cellWidth: 20 },
            2: { halign: 'right', cellWidth: 35 },
            3: { halign: 'right', cellWidth: 35 },
        },
        styles: {
            font: 'helvetica',
            fontSize: 10,
            textColor: textColor,
            cellPadding: 5,
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250],
        },
        margin: { left: 14, right: 14 },
    });

    // -- TOTALS SECTION --
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;
    const totalAmount = parseFloat(invoiceData.total_amount || invoiceData.amount || '0');

    // Subtotal (Assume no tax in the object for now, or match it entirely as total)
    const subtotal = totalAmount;

    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", pageWidth - 50, finalY);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Total:", pageWidth - 50, finalY + 8);
    doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - 14, finalY + 8, { align: "right" });

    // -- FOOTER --
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });

    // Automatically trigger the download
    doc.save(`${invoiceData.invoice_number || invoiceData.invoiceNumber || 'Invoice'}.pdf`);
};
