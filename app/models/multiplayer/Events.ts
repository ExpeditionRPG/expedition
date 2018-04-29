import * as Sequelize from 'sequelize'
import * as Bluebird from 'bluebird'
import {PLACEHOLDER_DATE} from 'expedition-qdl/lib/schema/SchemaBase'
import {Event as EventAttributes} from 'expedition-qdl/lib/schema/multiplayer/Events'
import {toSequelize, prepare} from '../Schema'

const EventSequelize = toSequelize(new EventAttributes({session: 0, timestamp: PLACEHOLDER_DATE, client: '', instance: '', id: 0, type: '', json: ''}));

export interface EventInstance extends Sequelize.Instance<Partial<EventAttributes>> {
  dataValues: EventAttributes;
}

export type EventModel = Sequelize.Model<EventInstance, Partial<EventAttributes>>;

export class Event {
  protected s: Sequelize.Sequelize;
  public model: EventModel;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = (this.s.define('events', EventSequelize, {
      timestamps: true,
      underscored: true,
    }) as EventModel);
  }

  public associate(models: any) {}

  public upsert(attrs: EventAttributes): Bluebird<void> {
    return this.model.upsert(prepare(attrs)).then(()=>{});
  }

  public getById(session: number, id: number): Bluebird<EventInstance|null> {
    return this.model.findOne({
      where: {session, id}
    });
  }

  public getLast(session: number): Bluebird<EventInstance|null> {
    return this.model.findOne({
      where: {session} as any,
      order: [['created_at', 'DESC']],
    });
  }

  public getCurrentQuestTitle(session: number): Bluebird<string|null> {
    return this.model.findOne({
      attributes: ['json'],
      where: {session, json: {$like: '%fetchQuestXML%'}} as any,
      order: [['created_at', 'DESC']],
    })
    .then((e: EventInstance) => {
      if (e === null) {
        return null;
      }

      try {
        const event = JSON.parse(e.get('json')).event;
        const args = JSON.parse(event.args);
        return args.title;
      } catch (e) {
        return null;
      }
    })
  }

  public getOrderedAfter(session: number, start: number): Bluebird<EventInstance[]> {
    return this.model.findAll({
      where: {session, id: {$gt: start}},
      order: [['created_at', 'ASC']],
    });
  }
}

