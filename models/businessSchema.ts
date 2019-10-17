import { Schema, model } from "mongoose";

const PointSchema = new Schema({
  coordinates: { type: [Number], index: "2dsphere" },
  type: { type: String, default: "Point" }
});

const Business = new Schema({
  name: { type: String, required: true },
  image_url: { type: String, required: true },
  is_closed: Boolean,
  review_count: { type: Number, required: true },
  categories: Array,
  rating: Number,
  coordinates: Object,
  geometry: PointSchema,
  price: { type: String, required: true },
  location: Object,
  phone: String
});

export default model("businesses", Business);
