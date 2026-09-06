from datetime import datetime
from io import BytesIO
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def generate_solar_pdf(data: Dict[str, Any]) -> bytes:
    city = data.get("city") or data.get("location") or "N/A"
    monthly_bill = data.get("monthlyBill")
    predicted_output = data.get("predictedOutput")
    monthly_savings = data.get("monthlySavings")
    annual_savings = data.get("annualSavings")
    payback_period = data.get("paybackPeriod")
    co2_saved = data.get("co2SavedKg")
    tree_equivalent = data.get("treeEquivalent")
    rooftop_area = data.get("rooftopArea")
    state = data.get("state", "N/A")

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)

    # Report title at the top of the page.
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 760, "SolisIQ — Personalized Report")

    # Input summary: what the user entered into the calculator.
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 730, "Input Summary")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, 712, f"City: {city}")
    pdf.drawString(
        50,
        696,
        f"Rooftop Area: {rooftop_area if rooftop_area is not None else 'N/A'} sq ft",
    )
    pdf.drawString(
        50, 680, f"Monthly Bill: ₹{monthly_bill if monthly_bill is not None else 'N/A'}"
    )
    pdf.drawString(50, 664, f"State: {state}")

    # Results summary table header.
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 630, "Results Summary")

    # Draw table outline
    table_x = 50
    table_y = 620
    row_height = 20
    table_width = 500
    pdf.setLineWidth(0.5)
    pdf.rect(
        table_x, table_y - row_height * 7, table_width, row_height * 7, stroke=1, fill=0
    )

    # Column separators
    pdf.line(table_x + 300, table_y - row_height * 7, table_x + 300, table_y)
    for row_number in range(1, 7):
        row_y = table_y - row_height * row_number
        pdf.line(table_x, row_y, table_x + table_width, row_y)

    # Table rows with labels and values.
    pdf.setFont("Helvetica", 11)
    pdf.drawString(table_x + 10, table_y - 16, "Metric")
    pdf.drawString(table_x + 310, table_y - 16, "Value")

    pdf.drawString(table_x + 10, table_y - row_height - 16, "Predicted Output")
    pdf.drawString(
        table_x + 310,
        table_y - row_height - 16,
        f"{predicted_output if predicted_output is not None else 'N/A'} kWh/day",
    )

    pdf.drawString(table_x + 10, table_y - row_height * 2 - 16, "Monthly Savings")
    pdf.drawString(
        table_x + 310,
        table_y - row_height * 2 - 16,
        f"₹{monthly_savings if monthly_savings is not None else 'N/A'}",
    )

    pdf.drawString(table_x + 10, table_y - row_height * 3 - 16, "Annual Savings")
    pdf.drawString(
        table_x + 310,
        table_y - row_height * 3 - 16,
        f"INR {annual_savings if annual_savings is not None else 'N/A'}",
    )

    pdf.drawString(table_x + 10, table_y - row_height * 4 - 16, "Payback Period")
    pdf.drawString(
        table_x + 310,
        table_y - row_height * 4 - 16,
        f"{payback_period if payback_period is not None else 'N/A'} years",
    )

    pdf.drawString(table_x + 10, table_y - row_height * 5 - 16, "CO2 Saved")
    pdf.drawString(
        table_x + 310,
        table_y - row_height * 5 - 16,
        f"{co2_saved if co2_saved is not None else 'N/A'} kg/year",
    )

    pdf.drawString(table_x + 10, table_y - row_height * 6 - 16, "Trees Equivalent")
    pdf.drawString(
        table_x + 310,
        table_y - row_height * 6 - 16,
        f"{tree_equivalent if tree_equivalent is not None else 'N/A'}",
    )

    # Footer with generation date
    pdf.setFont("Helvetica-Oblique", 9)
    pdf.drawString(50, 50, f"Generated on: {datetime.today().strftime('%Y-%m-%d')}")

    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer.getvalue()
