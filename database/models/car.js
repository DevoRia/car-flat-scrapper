import mongoose, {Schema} from 'mongoose'

const definition = {
  id: String,
  title: String,
  viewTitle: String,
  link: String,
  dateUpdate: Date,
  dateCreate: Date,
  usd: Number,
  uah: Number,
  race: Number,
  location: String,
  fuel: String,
  transmission: String,
  description: String
};

const Car = mongoose.model('Car', new Schema(definition, {
  timestamps: true
}));
const CarUpdate = mongoose.model('CarUpdate', new Schema(
  {...definition,
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Car'
    }
  }, {
  timestamps: true
}));

export async function saveCar(data) {
  return await new Car(data).save();
}

export async function updateCar(parent, data) {
  Object.keys(data)
    .filter(key => parent[key] === data[key])
    .map(key => {
      data[key] = undefined;
    });

  await Object.assign(parent, { dateUpdate: data.dateUpdate }).save();
  return await new CarUpdate({...data, parent}).save();
}

export async function checkForUpdate(id, dateUpdate) {
  const car = await Car.findOne({id});
  if (!car) {
    return 'new';
  } else {
    if (new Date(car.dateUpdate).getTime() === new Date(dateUpdate).getTime()) {
      return undefined;
    } else {
      return car;
    }
  }

}


