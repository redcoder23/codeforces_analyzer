//this file basically handles all the ratings returned for a certain user from the api of the user   
const express = require('express');
const mongoose = require('mongoose');
const Userhandleschema = require('./Models/Userhandle');

const rankThresholds = [
    { min: 0, title: "Newbie" },
    { min: 1200, title: "Pupil" },
    { min: 1400, title: "Specialist" },
    { min: 1600, title: "Expert" },
    { min: 1900, title: "Candidate Master" },
    { min: 2100, title: "Master" },
    { min: 2300, title: "International Master" },
    { min: 2400, title: "GrandMaster" },
    { min: 2600, title: "International GrandMaster" },
    { min: 3000, title: "Legendary GrandMaster" }
];

function getRank(rating) {
    let low = 0, high = rankThresholds.length - 1;
    let index = 0;
    while (low <= high) {
        let mid = low + Math.floor((high - low) / 2);
        if (rankThresholds[mid].min <= rating) {
            index = mid;
            low = mid + 1;
        }
        else
            high = mid - 1;
    }
    return rankThresholds[index].title;
}


const getRatings = async (handle) => {
    try {

        const url = `https://codeforces.com/api/user.rating?handle=${handle}`;
        const response = await fetch(url);
        const data = await response.json();

        // if invalid handle 
        if (data.status === 'FAILED' && data.comment.includes("Not found")) {
            return {
                success: false,
                type: "INVALID_HANDLE",
                message: data.comment
            }
        }
        // user exists but with no contests
        if (data.status === 'OK' && data.result.length === 0) {
            return {
                success: false,
                message: "User exists but no contest history"
            }
        }
        if (data.status === "OK") {

            for (const contest of data.result) {

                const findrating = await Userhandleschema.findOne({
                    handle: handle,
                    contestId: contest.contestId
                });

                if (findrating) {
                    break;
                }

                await Userhandleschema.create({
                    handle: handle,
                    contestId: contest.contestId,
                    contestName: contest.contestName,
                    oldRating: contest.oldRating,
                    newRating: contest.newRating,
                    ratingChange: contest.newRating - contest.oldRating,
                    rank: contest.rank,
                    user_newrank: getRank(contest.newRating),
                    user_oldrank: getRank(contest.oldRating),
                    Contestdate: new Date(contest.ratingUpdateTimeSeconds * 1000)
                });

            }
            return {
                success: true,
                type: "RATINGS_STORED"
            }

        } else {
            return {
                success: false,
                type: "RATINGS_NOTSTORED"
            }
        }

    } catch (error) {
        console.log("Couldn't fetch ratings:", error);
        return {
            success: false,
            type: "SERVER_ERROR",
            message: error.message
        };
    }
};


module.exports = getRatings;