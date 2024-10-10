import { Schema, model } from 'mongoose';
import { IHistory } from '../../types/models.types';

const browsingHistorySchema = new Schema<IHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  favicon: {
    type: String,
    required: false,
  }
}, { timestamps: true });

const BrowsingHistory = model<IHistory>('BrowsingHistory', browsingHistorySchema);

export default BrowsingHistory;
