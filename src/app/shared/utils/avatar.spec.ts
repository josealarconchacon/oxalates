import { DEFAULT_AVATAR, showDefaultAvatar } from './avatar';

describe('showDefaultAvatar', () => {
  const failedLoad = (src: string) => {
    const image = document.createElement('img');
    image.setAttribute('src', src);
    return { image, event: { target: image } as unknown as Event };
  };

  it('replaces a photo that failed to load with the default avatar', () => {
    const { image, event } = failedLoad('https://example.com/photo.HEIC');

    showDefaultAvatar(event);

    expect(image.src.endsWith(DEFAULT_AVATAR)).toBeTrue();
  });

  it('leaves the default avatar alone if that is what failed, so it cannot loop', () => {
    const { image, event } = failedLoad(DEFAULT_AVATAR);
    const before = image.src;

    showDefaultAvatar(event);

    expect(image.src).toBe(before);
  });
});
