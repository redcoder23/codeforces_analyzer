const mongoose = require('mongoose');
const express = require('express');

const firstsolve = require("./Models/Firstsolve");
const Users = require("./Models/Users");

const syncsubmissions = async (handle) => {
  try {

    const checkRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1`);
    const checkData = await checkRes.json();

    if (checkData.status === "FAILED") {
      if (checkData.comment?.toLowerCase().includes("not found")) {
        return {
          success: false,
          type: "INVALID_HANDLE",
          message: checkData.comment
        };
      }
    }

    if (checkData.status === "OK" && checkData.result.length === 0) {
      return {
        success: true,
        type: "NO_SUBMISSIONS",
        message: "User exists but has no submissions"
      };
    }

    let user = await Users.findOne({ handle: handle, isDeleted: false });

    if (!user) {
      user = await Users.create({
        handle: handle,
        lastsyncedsubmissionid: 0
      });
    }

    const lastsyncedsubmissionid = user.lastsyncedsubmissionid;

    let start = 1;
    const count = 500;

    let current_id = 0;
    let shouldbreak = false;

    while (true) {

      const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=${start}&count=${count}`);
      const data = await res.json();

      if (data.status !== "OK") {
        return {
          success: false,
          message: data.comment
        };
      }

      const submissions = data.result;

      if (submissions.length === 0) break;

      if (start === 1) {
        current_id = submissions[0].id;
      }

      for (const submission of submissions) {

        if (submission.id <= lastsyncedsubmissionid) {
          shouldbreak = true;
          break;
        }

        if (submission.verdict !== "OK") continue;

        if (!submission.problem.contestId) continue;

        const problemkey = `${submission.problem.contestId}-${submission.problem.index}`;

        await firstsolve.updateOne(
          { handle: handle, problemkey },
          {
            $min: { first_solved_time: submission.creationTimeSeconds },
            $setOnInsert: {
              rating: submission.problem.rating || null,
              tags: submission.problem.tags || []
            }
          },
          { upsert: true }
        );

      }

      if (shouldbreak) break;

      start += count;
    }

    if (current_id > lastsyncedsubmissionid) {
      user.lastsyncedsubmissionid = current_id;
      await user.save();
    }

    console.log("Submissions synced successfully");

    return {
      success: true,
      type: "SYNC_COMPLETE"
    };

  }
  catch (error) {
    console.log("Couldn't sync submissions:", error);

    return {
      success: false,
      type: "SERVER_ERROR",
      message: error.message
    };
  }
};

module.exports = syncsubmissions;