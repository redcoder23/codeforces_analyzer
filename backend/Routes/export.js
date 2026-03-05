
const ExcelJS = require('exceljs');
const firstsolve = require('../Models/Firstsolve');


async function exportHandler(req, res) {
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
        }).sort({ first_solved_time: 1 });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'CF Analyzer';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Problems', {
            views: [{ state: 'frozen', ySplit: 1 }]
        });

        sheet.columns = [
            { header: 'Problem', key: 'problem', width: 16 },
            { header: 'Rating', key: 'rating', width: 10 },
            { header: 'Tags', key: 'tags', width: 50 },
            { header: 'Solved On', key: 'solved_on', width: 18 },
            { header: 'URL', key: 'url', width: 50 },
        ];

        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FF080C10' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FF88' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                bottom: { style: 'medium', color: { argb: 'FF00CC66' } }
            };
        });
        headerRow.height = 22;


        problems.forEach((p, idx) => {
            const [contestId, index] = (p.problemkey || '').split('-');
            const url = contestId && index
                ? `https://codeforces.com/problemset/problem/${contestId}/${index}`
                : '';

            const row = sheet.addRow({
                problem: p.problemkey,
                rating: p.rating || '',
                tags: (p.tags || []).join(', '),
                solved_on: new Date(p.first_solved_time * 1000).toLocaleDateString('en-GB'),
                url: url,
            });

            if (idx % 2 === 0) {
                row.eachCell((cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D1117' } };
                });
            }

        
            if (url) {
                const urlCell = row.getCell('url');
                urlCell.value = { text: url, hyperlink: url };
                urlCell.font = { color: { argb: 'FF00B4FF' }, underline: true };
            }

            const ratingCell = row.getCell('rating');
            if (p.rating) {
                const r = p.rating;
                let color = 'FF808080';
                if (r >= 3000) color = 'FFFF0000';
                else if (r >= 2400) color = 'FFFF4444';
                else if (r >= 2100) color = 'FFFF8C00';
                else if (r >= 1900) color = 'FFAA00AA';
                else if (r >= 1600) color = 'FF0000FF';
                else if (r >= 1400) color = 'FF03A89E';
                else if (r >= 1200) color = 'FF008000';
                ratingCell.font = { color: { argb: color }, bold: true };
            }

            row.eachCell((cell) => {
                cell.alignment = { vertical: 'middle' };
            });
        });

        sheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: 5 }
        };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${handle}_problems.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = exportHandler;
