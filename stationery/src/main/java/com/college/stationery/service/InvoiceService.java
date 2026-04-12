package com.college.stationery.service;

import com.college.stationery.model.Order;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class InvoiceService {

    public ByteArrayInputStream generateInvoice(Order order) throws IOException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Title
            Paragraph title = new Paragraph("KIT'S STATIONERY STORE - INVOICE", headerFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Order Details
            document.add(new Paragraph("Order ID: #ORD-" + order.getId(), subHeaderFont));
            document.add(new Paragraph("Date: " + order.getOrderDate(), normalFont));
            document.add(new Paragraph("Status: " + order.getStatus(), normalFont));
            document.add(new Paragraph(" ", normalFont)); // Spacing

            // Table for Items
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{4, 1, 2, 2});

            // Table Header
            String[] headers = {"Item", "Qty", "Price", "Total"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, subHeaderFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                table.addCell(cell);
            }

            // Table Content (Using items string for simplicity as per model)
            // Note: Since items is a string in the model, we display it as a single row or try to parse
            String items = order.getItems();
            PdfPCell itemCell = new PdfPCell(new Phrase(items, normalFont));
            table.addCell(itemCell);
            
            table.addCell(new PdfPCell(new Phrase("1", normalFont))); // Qty Mock
            table.addCell(new PdfPCell(new Phrase("₹" + order.getTotalPrice(), normalFont)));
            table.addCell(new PdfPCell(new Phrase("₹" + order.getTotalPrice(), normalFont)));

            document.add(table);

            // Grand Total
            Paragraph total = new Paragraph("\nGrand Total: ₹" + order.getTotalPrice(), subHeaderFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            // Footer
            Paragraph footer = new Paragraph("\nThank you for shopping with KIT's Stationery!", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
