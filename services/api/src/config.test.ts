describe('config', () => {
  test('does not explode', () => {
    require('./config');
  });

  test('loads defaults without requiring production credentials', () => {
    const config = require('./config').default;
    expect(config.stores.defaults.store).toMatchObject({
      ENABLE_PAYMENT: false,
      PORT: 8081,
      SEQUELIZE_SSL: true,
      OAUTH2_CLIENT_ID: '',
    });
  });
});
