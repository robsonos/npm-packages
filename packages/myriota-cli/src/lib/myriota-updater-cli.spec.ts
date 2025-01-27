import { myriotaUpdaterCli } from './myriota-cli';

describe('myriotaUpdaterCli', () => {
  it('should work', () => {
    expect(myriotaUpdaterCli()).toEqual('myriota-cli');
  });
});
