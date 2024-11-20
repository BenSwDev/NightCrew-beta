import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVenue extends Document {
  name: string;
}

const VenueSchema: Schema<IVenue> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Venue name is required"],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Venue: Model<IVenue> = mongoose.models.Venue || mongoose.model<IVenue>("Venue", VenueSchema);

export default Venue;
