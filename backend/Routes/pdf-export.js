const PDFDocument = require('pdfkit');
const firstsolve = require('../Models/Firstsolve');

async function pdfExportHandler(req, res) {
    const { handle } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({ success: false, message: 'from and to are required' });
    }

    const fromTs = parseInt(from);
    const toTs = parseInt(to);

    try {
        const problems = await firstsolve.find({
            handle,
            first_solved_time: { $gte: fromTs, $lte: toTs }
        }).sort({ rating: -1 });

    
        const sortedProblems = problems.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        const doc = new PDFDocument({
            size: 'A4',
            margin: 40,
            bufferPages: true
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${handle}_problems_${from}_${to}.pdf"`);

        doc.pipe(res);

        
        doc.fontSize(24).font('Helvetica-Bold').text(`Codeforces Problems - ${handle}`, { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(`Date Range: ${new Date(fromTs * 1000).toLocaleDateString()} - ${new Date(toTs * 1000).toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(0.5);

    
        doc.fontSize(11).font('Helvetica-Bold').text(`Total Problems: ${problems.length}`, { align: 'left' });
        doc.moveDown(0.3);

        
        const pageWidth = doc.page.width - 80;
        const col1Width = 100;
        const col2Width = 80;  
        const col3Width = pageWidth - col1Width - col2Width; 

        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Problem', 40, doc.y, { width: col1Width });
        doc.text('Rating', 40 + col1Width, doc.y - 14, { width: col2Width });
        doc.text('Tags', 40 + col1Width + col2Width, doc.y - 14, { width: col3Width });

        
        doc.moveTo(40, doc.y + 2).lineTo(pageWidth + 40, doc.y + 2).stroke();
        doc.moveDown(0.5);

        sortedProblems.forEach((p, idx) => {
            const [contestId, index] = (p.problemkey || '').split('-');
            const url = contestId && index ? `https://codeforces.com/problemset/problem/${contestId}/${index}` : '';
            const tags = (p.tags || []).join(', ');

            const startY = doc.y;
            doc.fontSize(8).font('Helvetica');

            if (url) {
                doc.fillColor('#0066CC').text(p.problemkey, 40, startY, { 
                    width: col1Width,
                    link: url,
                    underline: true
                }).fillColor('#000000');
            } else {
                doc.text(p.problemkey, 40, startY, { width: col1Width });
            }

           
            const ratingColor = getRatingColor(p.rating);
            doc.fillColor(ratingColor);
            doc.text(p.rating || 'Unrated', 40 + col1Width, startY, { width: col2Width, align: 'center' });
            doc.fillColor('#000000');

            
            doc.text(tags, 40 + col1Width + col2Width, startY, { 
                width: col3Width,
                continued: false
            });

            const rowHeight = Math.max(14, doc.y - startY);
            doc.moveTo(40, doc.y + 2).lineTo(pageWidth + 40, doc.y + 2).stroke();
            doc.moveDown(0.3);

            if (doc.y > doc.page.height - 60) {
                doc.addPage();

                doc.fontSize(9).font('Helvetica-Bold');
                doc.text('Problem', 40, doc.y, { width: col1Width });
                doc.text('Rating', 40 + col1Width, doc.y - 14, { width: col2Width });
                doc.text('Tags', 40 + col1Width + col2Width, doc.y - 14, { width: col3Width });
                doc.moveTo(40, doc.y + 2).lineTo(pageWidth + 40, doc.y + 2).stroke();
                doc.moveDown(0.5);
            }
        });

        doc.moveTo(40, doc.page.height - 60).lineTo(pageWidth + 40, doc.page.height - 60).stroke();
        doc.fontSize(8).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, 40, doc.page.height - 50);

        doc.end();

    } catch (err) {
        console.error('PDF Export error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}

function getRatingColor(rating) {
    if (!rating) return '#808080';
    if (rating >= 3000) return '#FF0000';
    if (rating >= 2400) return '#FF4444';
    if (rating >= 2100) return '#FF8C00';
    if (rating >= 1900) return '#AA00AA';
    if (rating >= 1600) return '#0000FF';
    if (rating >= 1400) return '#03A89E';
    if (rating >= 1200) return '#008000';
    return '#808080';
}

module.exports = pdfExportHandler;
