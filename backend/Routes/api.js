const express = require('express');
const router = express.Router();

const getRatings = require('../ratings');
const syncsubmissions = require('../Submission');
const Userhandleschema = require('../Models/Userhandle');
const firstsolve = require('../Models/Firstsolve');
const Users = require('../Models/Users');


router.post('/sync', async (req, res) => {
    const { handle } = req.body;

    if (!handle || !handle.trim()) {
        return res.status(400).json({ success: false, type: 'MISSING_HANDLE', message: 'Handle is required' });
    }

    try {
        const ratingsResult = await getRatings(handle);
        if (!ratingsResult.success && ratingsResult.type === 'INVALID_HANDLE') {
            return res.status(404).json(ratingsResult);
        }

        const submissionsResult = await syncsubmissions(handle);
        if (!submissionsResult.success && submissionsResult.type === 'INVALID_HANDLE') {
            return res.status(404).json(submissionsResult);
        }

        return res.json({ success: true, type: 'SYNC_COMPLETE' });
    } catch (err) {
        return res.status(500).json({ success: false, type: 'SERVER_ERROR', message: err.message });
    }
});


router.get('/ratings/:handle', async (req, res) => {
    const { handle } = req.params;
    try {
        const ratings = await Userhandleschema.find({ handle }).sort({ Contestdate: 1 });

        if (!ratings.length) {
            return res.status(404).json({ success: false, type: 'NO_DATA', message: 'No rating data found. Try syncing first.' });
        }

        return res.json({ success: true, data: ratings });
    } catch (err) {
        return res.status(500).json({ success: false, type: 'SERVER_ERROR', message: err.message });
    }
});


router.get('/analysis/:handle', async (req, res) => {
    const { handle } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({ success: false, type: 'MISSING_PARAMS', message: 'from and to query params are required (unix seconds)' });
    }

    const fromTs = parseInt(from);
    const toTs = parseInt(to);

    if (isNaN(fromTs) || isNaN(toTs) || fromTs >= toTs) {
        return res.status(400).json({ success: false, type: 'INVALID_PARAMS', message: 'Invalid date range' });
    }

    try {
        const problems = await firstsolve.find({
            handle,
            first_solved_time: { $gte: fromTs, $lte: toTs }
        }).sort({ first_solved_time: 1 });

        if (!problems.length) {
            return res.json({ success: true, data: { problems: [], ratingDistribution: [], tagDistribution: [] } });
        }

        const ratingBuckets = {};
        for (const p of problems) {
            const r = p.rating ? String(p.rating) : 'Unrated';
            ratingBuckets[r] = (ratingBuckets[r] || 0) + 1;
        }
        const ratingDistribution = Object.entries(ratingBuckets)
            .map(([rating, count]) => ({ rating, count }))
            .sort((a, b) => (parseInt(a.rating) || 0) - (parseInt(b.rating) || 0));

        // Tag distribution for pie chart
        const tagBuckets = {};
        for (const p of problems) {
            for (const tag of (p.tags || [])) {
                tagBuckets[tag] = (tagBuckets[tag] || 0) + 1;
            }
        }
        const tagDistribution = Object.entries(tagBuckets)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);

        return res.json({
            success: true,
            data: {
                problems: problems.map(p => ({
                    problemkey: p.problemkey,
                    rating: p.rating,
                    tags: p.tags,
                    first_solved_time: p.first_solved_time,
                    url: buildProblemUrl(p.problemkey)
                })),
                ratingDistribution,
                tagDistribution
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, type: 'SERVER_ERROR', message: err.message });
    }
});

function buildProblemUrl(problemkey) {
    if (!problemkey) return null;
    const [contestId, index] = problemkey.split('-');
    if (!contestId || !index) return null;
    return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
}

module.exports = router;
