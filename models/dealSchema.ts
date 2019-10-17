import { Schema, model } from 'mongoose';

const Deal = new Schema({
  business_name: { type: String, required: true },
  business_id: { type: String, require: true },
  business_details: { type: Schema.Types.ObjectId, ref: 'businesses' },
  categories: { type: Array, required: true },
  deal_tag_line: { type: String, required: true },
  deal_description: { type: String, required: true },
  image: { type: String, required: true },
  featured: { type: Boolean, default: false },
  liked_by: [{ type: Schema.Types.ObjectId, ref: 'authentications' }]
});

export default model('deals', Deal);
