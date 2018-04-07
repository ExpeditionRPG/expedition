import * as Sequelize from 'sequelize'
import * as Bluebird from 'bluebird'

export interface EventAttributes {
  session: number;
  client: string;
  instance: string;
  timestamp: Date;
  id: number;
  type: string;
  json?: string|null;
}

export interface EventInstance extends Sequelize.Instance<EventAttributes> {
  dataValues: EventAttributes;
}

export type EventModel = Sequelize.Model<EventInstance, EventAttributes>;

export class Event {
  protected s: Sequelize.Sequelize;
  public model: EventModel;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = (this.s.define('events', {
      session: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        primaryKey: true,
      },
      client: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      instance: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      json: {
        type: Sequelize.TEXT(),
      },
    }, {
      timestamps: true,
      underscored: true,
    }) as EventModel);
  }

  public associate(models: any) {}

  public upsert(attrs: EventAttributes): Bluebird<void> {
    return this.model.upsert(attrs).then(()=>{});
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

