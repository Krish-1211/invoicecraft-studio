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
    const finalY = Math.max(doc.lastAutoTable.finalY || 0, 100) + 10;
    const totalAmount = parseFloat(invoiceData.total_amount || invoiceData.amount || '0');

    const taxRate = parseFloat(invoiceData.tax_rate || '0');
    const taxName = invoiceData.tax_name && invoiceData.tax_name.trim() ? invoiceData.tax_name : 'Tax';

    let taxes = [];
    if (invoiceData.taxes && Array.isArray(invoiceData.taxes) && invoiceData.taxes.length > 0) {
        taxes = invoiceData.taxes;
    } else if (taxRate > 0) {
        taxes = [{ name: taxName, rate: taxRate }];
    }

    let subtotal = totalAmount;
    let computedTaxAmounts: { name: string, rate: number, amount: number }[] = [];

    if (taxes.length > 0) {
        // Backwards compute subtotal: total = subtotal + sum(subtotal * rate/100) -> total = subtotal * (1 + sum(rate/100))
        const totalRatePercent = taxes.reduce((s, t) => s + parseFloat(t.rate || '0'), 0);
        subtotal = totalAmount / (1 + (totalRatePercent / 100));

        computedTaxAmounts = taxes.map(t => {
            const rate = parseFloat(t.rate || '0');
            return { name: t.name || 'Tax', rate, amount: subtotal * (rate / 100) };
        });
    }

    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", pageWidth - 50, finalY);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });

    let totalsCurrentY = finalY;
    if (computedTaxAmounts.length > 0) {
        computedTaxAmounts.forEach(tax => {
            totalsCurrentY += 6;
            doc.text(`${tax.name} (${tax.rate}%):`, pageWidth - 50, totalsCurrentY);
            doc.text(`$${tax.amount.toFixed(2)}`, pageWidth - 14, totalsCurrentY, { align: "right" });
        });
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const totalY = totalsCurrentY + 8;
    doc.text("Total:", pageWidth - 50, totalY);
    doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - 14, totalY, { align: "right" });

    // -- FOOTER --
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });

    // Automatically trigger the download
    const rawName = String(invoiceData.invoice_number || invoiceData.invoiceNumber || invoiceData.id || 'Invoice').trim();
    const safeName = rawName.includes('Invoice') ? rawName : `Invoice-${rawName}`;
    doc.save(`${safeName}.pdf`);
};
