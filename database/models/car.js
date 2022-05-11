import mongoose, {Schema} from 'mongoose'

export const providers = [
  'autoria',
  'rst',
]

const definition = {
  id: String,
  provider: { type: String, enum: providers },
  title: String,
  viewTitle: String,
  link: String,
  dateUpdate: Date,
  dateCreate: Date,
  usd: Number,
  photo: String,
  uah: Number,
  race: Number,
  location: String,
  fuel: String,
  transmission: String,
  description: String
};

export const Car = mongoose.model(process.env.CAR_MODEL, new Schema(definition, {
  timestamps: true
}));

export const CarUpdate = mongoose.model(process.env.CAR_UPDATE_MODEL, new Schema(
  {...definition,
    parent: {
      type: Schema.Types.ObjectId,
      ref: process.env.CAR_MODEL
    }
  }, {
  timestamps: true
}));


