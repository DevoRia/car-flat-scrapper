import mongoose, {Schema} from 'mongoose'

const Car = mongoose.model('Car', new Schema({
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
}, {
  timestamps: true
}));

export async function saveCar(data) {
  return await new Car(data).save();
}

export async function updateCar(car) {
  return await car.save();
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


