import * as Sequelize from 'sequelize'
import * as Bluebird from 'bluebird'

export interface RenderedQuestAttributes {
  partition: string;
  id: string;
  questversion: number;
  xml: string;
}

export interface RenderedQuestInstance extends Sequelize.Instance<Partial<RenderedQuestAttributes>> {}

export type RenderedQuestModel = Sequelize.Model<RenderedQuestInstance, Partial<RenderedQuestAttributes>>;

export class RenderedQuest {
  protected s: Sequelize.Sequelize;
  public model: RenderedQuestModel;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = this.s.define<RenderedQuestInstance, Partial<RenderedQuestAttributes>>('renderedquests', {
      partition: {
        type: Sequelize.STRING(32),
        allowNull: false,
        primaryKey: true,
      },
      id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      questversion: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        primaryKey: true,
      },
      xml: Sequelize.TEXT,
    }, {
      timestamps: true,
      // https://github.com/ExpeditionRPG/expedition-api/issues/39
      underscored: true,
    });
  }

  associate(models: any) {
  }

  get(partition: string, id: string, questversion: number): Bluebird<RenderedQuestInstance|null> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findOne({where: {partition, id, questversion} as any});
      });
  }
}
