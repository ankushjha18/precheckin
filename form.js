// Assumes jsPDF is loaded via CDN in form.html
// Handles form submission, PDF generation, and download

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.checkin-form');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const bookingId = document.getElementById('bookingId').value.trim();
        const date = document.getElementById('date').value;
        const mobile = document.getElementById('mobile').value.trim();
        const idPhotoInput = document.getElementById('idPhoto');
        const idPhotoFile = idPhotoInput.files[0];

        // Format date for filename
        const dateForFile = date ? date.replace(/-/g, '') : 'nodate';
        const pdfName = `${firstName}_${dateForFile}.pdf`;

        // Prepare jsPDF
        const doc = new window.jspdf.jsPDF();
        let y = 20;
        doc.setFontSize(18);
        doc.text('Check-In Form Submission', 105, y, { align: 'center' });
        y += 16;
        doc.setFontSize(12);
        doc.text(`First Name: ${firstName}`, 20, y); y += 10;
        doc.text(`Last Name: ${lastName}`, 20, y); y += 10;
        doc.text(`Booking ID: ${bookingId}`, 20, y); y += 10;
        doc.text(`Date: ${date}`, 20, y); y += 10;
        doc.text(`Mobile Number: ${mobile}`, 20, y); y += 14;

        // Handle image
        if (idPhotoFile) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imgData = event.target.result;
                doc.text('ID Photo:', 20, y);
                doc.addImage(imgData, 'JPEG', 60, y, 60, 40);
                y += 50;
                // Save PDF as blob and upload
                const pdfBlob = doc.output('blob');
                uploadPDF(pdfBlob, pdfName);
            };
            reader.readAsDataURL(idPhotoFile);
        } else {
            const pdfBlob = doc.output('blob');
            uploadPDF(pdfBlob, pdfName);
        }

    });

    function uploadPDF(pdfBlob, pdfName) {
        const formData = new FormData();
        formData.append('pdf', pdfBlob, pdfName);
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Form submitted and PDF sent to admin!');
            } else {
                alert('Failed to upload PDF.');
            }
        })
        .catch(() => alert('Error uploading PDF.'));
    }
}); 