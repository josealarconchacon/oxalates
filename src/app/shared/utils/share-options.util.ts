export interface ShareOption {
  label: string;
  icon: string;
  color: string;
  getShareUrl: (text: string) => string;
}

export const shareOptions = [
  {
    label: 'Facebook',
    icon: 'facebook',
    color: '#1877f2',
    getShareUrl: (text: string) => {
      const url = encodeURIComponent(window.location.href); // Current page URL
      const shareText = encodeURIComponent(text); // Shareable text
      return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${shareText}`;
    },
  },
  {
    label: 'Reddit',
    icon: 'reddit',
    color: '#ff4500',
    getShareUrl: (text: string) => {
      const url = encodeURIComponent(window.location.href); // Current page URL
      const shareText = encodeURIComponent(text); // Shareable text
      return `https://www.reddit.com/submit?url=${url}&title=${shareText}`;
    },
  },
];
