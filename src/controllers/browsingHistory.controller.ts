import { Request, Response } from "express";
import moment from "moment";
import mongoose from "mongoose";
import { z } from "zod";
import BrowsingHistory from "../database/models/browsingHistory.model";
import { removeHistoryValidation, searchHistoryValidation } from "../lib/zod-validation/browsingHistory-validation";

export async function logHistory(req: Request, res: Response) {
  try {
    const parsedReqBody = searchHistoryValidation.parse(req.body);
    const createdHistoryLog = await BrowsingHistory.create({
      ...parsedReqBody,
      userId: req.userId,
    });

    return res.status(201).json({
      message: "History log created successfully",
      data: createdHistoryLog
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation errors",
        errors: error.issues.map(issue => issue.message)
      });
    }

    console.error("Error logging history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function removeHistoryById(req: Request, res: Response) {
  try {
    const { historyId } = removeHistoryValidation.parse(req.params);
    const removedHistory = await BrowsingHistory.findByIdAndDelete(historyId);

    if (!removedHistory) {
      return res.status(404).json({ message: "History log not found" });
    }

    return res.status(200).json({ message: "History log removed successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation errors",
        errors: error.issues.map(issue => issue.message)
      });
    }

    console.error("Error removing history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function clearAllHistory(req: Request, res: Response) {
  try {
    const userId = req.userId
    const result = await BrowsingHistory.deleteMany({ userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No history entries found for this user" });
    }
    return res.status(200).json({ message: `history has been cleared successfully` });
  } catch (error) {
    console.error("Error removing history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllHistory(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { limit = 10, page = 1, search = "", dateRange = "", start, end } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const pageSize = Math.max(1, parseInt(limit as string, 10));
    const pageNumber = Math.max(1, parseInt(page as string, 10));

    const searchCriteria = search
      ? {
        $and: [
          { userId: new mongoose.Types.ObjectId(userId) },
          {
            $or: [
              { url: { $regex: search, $options: 'i' } },
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ]
          }
        ]
      }
      : { userId: new mongoose.Types.ObjectId(userId) };

    let dateFilter: any = {};
    let startDate: moment.Moment | null = null;
    let endDate: moment.Moment | null = null;

    switch (dateRange) {
      case 'today':
        startDate = moment().startOf('day');
        endDate = moment().endOf('day');
        break;
      case 'yesterday':
        startDate = moment().subtract(1, 'days').startOf('day');
        endDate = moment().subtract(1, 'days').endOf('day');
        break;
      case 'this_week':
        startDate = moment().startOf('week');
        endDate = moment().endOf('week');
        break;
      case 'last_week':
        startDate = moment().subtract(1, 'weeks').startOf('week');
        endDate = moment().subtract(1, 'weeks').endOf('week');
        break;
      case 'this_month':
        startDate = moment().startOf('month');
        endDate = moment().endOf('month');
        break;
      case 'custom':
        if (start && end) {
          startDate = moment(start as string, 'YYYY-MM-DD');
          endDate = moment(end as string, 'YYYY-MM-DD').endOf('day');
        }
        break;
      default:
        break;
    }

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: startDate.toDate(),
          $lte: endDate.toDate()
        }
      };
    }
    const combinedCriteria = {
      $and: [searchCriteria, dateFilter]
    };

    const historyEntries = await BrowsingHistory.aggregate([
      { $match: combinedCriteria },
      { $sort: { createdAt: -1 } },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          entries: { $push: "$$ROOT" }
        }
      },
      { $project: { date: "$_id", entries: 1, _id: 0 } },
      { $sort: { date: -1 } }
    ]);

    const totalCount = await BrowsingHistory.countDocuments(combinedCriteria);

    const hasMoreData = (pageNumber * pageSize) < totalCount;

    return res.status(200).json({
      message: "History entries retrieved successfully",
      data: historyEntries,
      totalCount,
      hasMoreData
    });
  } catch (error) {
    console.error("Error retrieving history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}