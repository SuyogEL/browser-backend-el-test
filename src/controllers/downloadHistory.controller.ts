import { Request, Response } from "express";
import moment from "moment";
import mongoose from "mongoose";
import { z } from "zod";
import DownloadHistory from "../database/models/downloadHistory.model";
import { logDownloadHistoryValidation, removeDownloadHistoryValidation } from "../lib/zod-validation/downloadHistory-validation";


export async function logDownloadHistory(req: Request, res: Response) {
  try {
    const parsedReqBody = logDownloadHistoryValidation.parse(req.body);
    const createdDownloadLog = await DownloadHistory.create({
      ...parsedReqBody,
      userId: req.userId,
    });

    return res.status(201).json({
      message: "Download history logged successfully",
      data: createdDownloadLog
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation errors",
        errors: error.issues.map(issue => issue.message)
      });
    }
    console.error("Error logging download history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function removeDownloadHistoryById(req: Request, res: Response) {
  try {
    const { historyId } = removeDownloadHistoryValidation.parse(req.params);

    const removedDownloadHistory = await DownloadHistory.findByIdAndDelete(historyId);

    if (!removedDownloadHistory) {
      return res.status(404).json({ message: "Download history log not found" });
    }
    return res.status(200).json({ message: "Download history log removed successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation errors",
        errors: error.issues.map(issue => issue.message)
      });
    }
    console.error("Error removing download history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function clearAllDownloadHistory(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const result = await DownloadHistory.deleteMany({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No download history entries found for this user" });
    }
    return res.status(200).json({ message: "All download history has been cleared successfully" });
  } catch (error) {
    console.error("Error clearing download history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllDownloadHistory(req: Request, res: Response) {
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
              { fileName: { $regex: search, $options: 'i' } }
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

    const historyEntries = await DownloadHistory.aggregate([
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

    const totalCount = await DownloadHistory.countDocuments(combinedCriteria);

    const hasMoreData = (pageNumber * pageSize) < totalCount;

    return res.status(200).json({
      message: "Download History entries retrieved successfully",
      data: historyEntries,
      totalCount,
      hasMoreData
    });
  } catch (error) {
    console.error("Error retrieving history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
