import { CdpNg2BoilerplatePage } from './app.po';

describe('cdp-ng2-boilerplate App', () => {
  let page: CdpNg2BoilerplatePage;

  beforeEach(() => {
    page = new CdpNg2BoilerplatePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
