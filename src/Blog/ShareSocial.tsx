"use client";
import React from "react";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinShareButton,
  PinterestIcon,
  PinterestShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "next-share";
import { LinkedinIcon } from "lucide-react";

function ShareSocial({ slug, title }: any) {
  const currentURL = `https://kinscare.org/blog/${slug}`;
  return (
    <div className="mt-4">
      <p className="font-semibold text-gray-900 mb-1">Share this article</p>
      <div className="flex items-center gap-4">
        <FacebookShareButton title={title}  url={currentURL}>
          <FacebookIcon
            size={30}
            className="text-blue-600 rounded-full hover:text-blue-700 transition cursor-pointer"
          />
        </FacebookShareButton>

        <TwitterShareButton title={title}  url={currentURL}>
          <TwitterIcon
            size={30}
            className="text-blue-400 rounded-full hover:text-blue-500 transition cursor-pointer"
          />
        </TwitterShareButton>

        <WhatsappShareButton title={title}  url={currentURL}>
          <WhatsappIcon
            size={30}
            className="text-green-500 rounded-full hover:text-green-600 transition cursor-pointer"
          />
        </WhatsappShareButton>

        <LinkedinShareButton title={title} url={currentURL}>
          <LinkedinIcon
            size={30}
            className="text-blue-700 rounded-full hover:text-blue-800 transition cursor-pointer"
          />
        </LinkedinShareButton>

        <RedditShareButton title={title} url={currentURL}>
          <RedditIcon
            size={30}
            className="text-red-500 rounded-full hover:text-red-600 transition cursor-pointer"
          />
        </RedditShareButton>

        <TelegramShareButton title={title} url={currentURL}>
          <TelegramIcon
            size={30}
            className="text-blue-500 rounded-full hover:text-blue-600 transition cursor-pointer"
          />
        </TelegramShareButton>

        <PinterestShareButton url={currentURL} media={`${title} || Kinscare`}>
          <PinterestIcon
            size={30}
            className="text-red-600 rounded-full hover:text-red-700 transition cursor-pointer"
          />
        </PinterestShareButton>
      </div>
    </div>
  );
}

export default ShareSocial;
