export class Repository {

  model;
  modelUpdate;

  constructor(model, modelUpdate) {
    this.model = model;
    this.modelUpdate = modelUpdate;
  }

  async save(data) {
    return await new this.model(data).save();
  }

  async update(parent, data) {
    Object.keys(data)
      .filter(key => parent[key] === data[key])
      .map(key => {
        data[key] = undefined;
      });

    await Object.assign(parent, { dateUpdate: data.dateUpdate }).save();
    return await new this.modelUpdate({ ...data, parent }).save();
  }

  async checkForUpdate(id, dateUpdate) {
    const entity = await this.model.findOne({id});
    if (!entity) {
      return 'new';
    } else {
      if (!dateUpdate || (new Date(entity.dateUpdate).getTime() === new Date(dateUpdate).getTime())) {
        return undefined;
      } else {
        return entity;
      }
    }
  }


}