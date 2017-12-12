import { Angular2HotelPhpFrontendPage } from './app.po';

describe('angular2-hotel-php-frontend App', () => {
  let page: Angular2HotelPhpFrontendPage;

  beforeEach(() => {
    page = new Angular2HotelPhpFrontendPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
