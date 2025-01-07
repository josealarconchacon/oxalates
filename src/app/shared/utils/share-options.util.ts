export interface ShareOption {
  label: string;
  icon: string;
  color: string;
  getShareUrl: (text: string) => string;
}

export const shareOptions: ShareOption[] = [
  {
    label: 'Share on Facebook',
    icon: 'facebook',
    color: '#1877F2',
    getShareUrl: (text: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}&quote=${encodeURIComponent(text)}`,
  },
  {
    label: 'Share on Reddit',
    icon: 'reddit',
    color: '#FF4500',
    getShareUrl: (text: string) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(
        window.location.href
      )}&summary=${encodeURIComponent(text)}`,
  },
];
