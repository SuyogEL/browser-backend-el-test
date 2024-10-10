import { Schema, model } from 'mongoose';
import { IDownloadHistory, IHistory } from '../../types/models.types';

const downloadHistorySchema = new Schema<IDownloadHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  url: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: false,
  },
}, { timestamps: true });

const DownloadHistory = model<IDownloadHistory>('DownloadHistory', downloadHistorySchema);

export default DownloadHistory;
