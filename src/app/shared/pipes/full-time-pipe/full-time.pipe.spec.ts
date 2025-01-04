import { FullTimePipe } from './full-time.pipe';

describe('FullTimePipe', () => {
  let timePipe: FullTimePipe;

  beforeEach(() => {
    timePipe = new FullTimePipe();
  });

  it('should transform date to localized time string', () => {
    const currentTime = new Date('2024-01-01T14:30:00');

    const result = timePipe.transform(currentTime);

    const expectedResult = currentTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }) +" " + currentTime.toLocaleTimeString().split(" ")[1];

    expect(result).toEqual(expectedResult);
  });

  it('should handle string time input', () => {
    const currentTime = new Date('2024-01-01T14:30:00').toString();
    const result = timePipe.transform(currentTime);

    const date = new Date(currentTime);

    const expectedResult = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }) +" " + date.toLocaleTimeString().split(" ")[1];

    expect(result).toEqual(expectedResult);
  });

  it('should handle null input', () => {
    const result = timePipe.transform(null);

    expect(result).toEqual('');
  });
});
