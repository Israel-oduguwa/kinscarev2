import React from 'react';
import {
  FacebookShareButton,
  InstapaperShareButton,
  EmailShareButton,
  FacebookIcon,
  InstagramIcon,
  EmailIcon,
} from 'next-share';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';


type ShareDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  platform: 'email' | 'facebook' | 'instagram';
};

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, platform }) => {
  const shareUrl = 'https://your-app.com/course-plan'; // Replace with the actual course plan URL
  const title = 'Check out this amazing course plan!';

  // API call to reward the user
  const handleRewardUser = async () => {
    try {
      const response = await fetch('/api/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          points: platform === 'email' ? 20 : 15, // Customize rewards based on platform
        }),
      });

      if (response.ok) {
        // console.log('User rewarded successfully');
      } else {
        console.error('Failed to reward the user');
      }
    } catch (error) {
      console.error('Error rewarding the user:', error);
    }
  };

  // Handle the share completion event and trigger reward
  const handleShareComplete = () => {
    handleRewardUser();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-xl font-semibold text-gray-800">Share Your Course Plan</h2>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Conditional rendering based on the platform */}
          {platform === 'facebook' && (
            <FacebookShareButton url={shareUrl} quote={title} onShareWindowClose={handleShareComplete}>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                <FacebookIcon size={40} round />
                <span className="text-lg font-medium text-gray-700">Share to Facebook</span>
              </div>
            </FacebookShareButton>
          )}

          {platform === 'instagram' && (
            <InstapaperShareButton url={shareUrl} title={title} onShareWindowClose={handleShareComplete}>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                <InstagramIcon size={40} round />
                <span className="text-lg font-medium text-gray-700">Share to Instagram</span>
              </div>
            </InstapaperShareButton>
          )}

          {platform === 'email' && (
            <EmailShareButton url={shareUrl} subject={title} body="Check out this course plan!" onClick={handleShareComplete}>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                <EmailIcon size={40} round />
                <span className="text-lg font-medium text-gray-700">Share via Email</span>
              </div>
            </EmailShareButton>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full mt-4">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
