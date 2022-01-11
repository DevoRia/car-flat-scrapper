import mongoose, {Schema} from 'mongoose'

export const providers = [
  'domria',
  'olx',
]

const definition = {
  id: String,
  provider: { type: String, enum: providers },
  title: String,
  viewTitle: String,
  link: String,
  dateUpdate: Date,
  dateCreate: Date,
  uah: Number,
  location: String,
  description: String
};

export const Flat = mongoose.model(process.env.FLAT_MODEL,
  new Schema(definition, {
    timestamps: true
  })
);
export const FlatUpdate = mongoose.model(process.env.FLAT_UPDATE_MODEL, new Schema(
  {...definition,
    parent: {
      type: Schema.Types.ObjectId,
      ref: process.env.FLAT_MODEL
    }
  }, {
    timestamps: true
  })
);


