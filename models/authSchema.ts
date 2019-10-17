import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, default: null },
  confirmed: { type: Boolean, default: false },
  reset_pass_token: { type: String, default: null },
  saved_deals: [{ type: Schema.Types.ObjectId, ref: "deals" }],
  saved_places: [{ type: Schema.Types.ObjectId, ref: "businesses" }],
  used_deals: [{ type: Schema.Types.ObjectId, ref: "deals" }],
  google_user_id: { type: String, default: null },
  facebook_user_id: { type: String, default: null }
});

const authSchema = model("authentication", userSchema);

export default authSchema;
