import { TimePipe } from './time.pipe';

describe('TimePipe', () => {
  let timePipe: TimePipe;

  beforeEach(() => {
    timePipe = new TimePipe();
  });

  it('should transform date to localized time string', () => {
    const currentTime = new Date('2024-01-01T14:30:00');

    const result = timePipe.transform(currentTime);

    expect(result).toEqual('14:30');
  });

  it('should handle string time input', () => {
    const currentTime = new Date('2024-01-01T14:30:00').toString();
    const result = timePipe.transform(currentTime);

    expect(result).toEqual('14:30');
  });

  it('should handle null input', () => {
    const result = timePipe.transform(null);

    expect(result).toEqual('');
  });
});
