import {DonationFull} from "@/app/lib/definitions";
import config from "@/app/lib/config";
import UserAvatar from "@/app/ui/user-avatar";
import {useSession} from "next-auth/react";
import {UiButton} from "@/app/ui/button";
import {copyTextToClipboard} from "@/app/lib/helpers";
import ShareXIcon from "@/public/icons/share_x.svg";
import ShareLinkedinIcon from "@/public/icons/share_linkedin.svg";
import Image from "next/image";

function windowOpen(
  url: string,
  { height, width, ...configRest }: { height: number; width: number; [key: string]: any },
  onClose?: (dialog: Window | null) => void,
) {
  const config: { [key: string]: string | number } = {
    height,
    width,
    location: 'no',
    toolbar: 'no',
    status: 'no',
    directories: 'no',
    menubar: 'no',
    scrollbars: 'yes',
    resizable: 'no',
    centerscreen: 'yes',
    chrome: 'yes',
    ...configRest,
    ...getBoxPositionOnWindowCenter(width, height),
  };

  const shareDialog = window.open(
    url,
    '',
    Object.keys(config)
      .map(key => `${key}=${config[key]}`)
      .join(', '),
  );

  if (onClose) {
    const interval = window.setInterval(() => {
      try {
        if (shareDialog === null || shareDialog.closed) {
          window.clearInterval(interval);
          onClose(shareDialog);
        }
      } catch (e) {
        /* eslint-disable no-console */
        console.error(e);
        /* eslint-enable no-console */
      }
    }, 1000);
  }

  return shareDialog;
}

const getBoxPositionOnWindowCenter = (width: number, height: number) => ({
  left: window.outerWidth / 2 + (window.screenX || window.screenLeft || 0) - width / 2,
  top: window.outerHeight / 2 + (window.screenY || window.screenTop || 0) - height / 2,
});

function makeCollection(list: (string|null)[]) {
  const listFiltered = list.filter(a => !!a);

  if (1 === listFiltered.length) {
    return listFiltered[0];
  }

  return `${listFiltered.slice(0, listFiltered.length - 1).join(', ')} and ${listFiltered.slice(-1)}`;
}

export default function ShareReview({donation, review}: {donation: DonationFull, review: string}) {
  const {data: session} = useSession();
  const user = session?.user!;

  const linkToShare = config.webServerUrl;
  const textToShare = `I have donated ${donation.amount}${config.currency} to ${makeCollection(donation.mergeRequest.authors.map(author => author.author.name))} for "${donation.mergeRequest.title}"`;

  const shareDonation = () => {
    copyTextToClipboard(linkToShare);
  };

  const openLinkedinShare = () => {
    const url =  `https://linkedin.com/shareArticle?url=${encodeURIComponent(linkToShare)}&text=${textToShare}`;
    windowOpen(url, {
      width: 750,
      height: 600,
    });
  };

  const openTwitterShare = () => {
    const url = `https://x.com/intent/tweet?url=${encodeURIComponent(linkToShare)}&text=${textToShare}`;
    windowOpen(url, {
      width: 550,
      height: 400,
    });
  }

  return (
    <div>
      <h2 className="text-2xl md:text-4xl text-project-focus mb-6">
        Share your donation and review
      </h2>

      <div className="mt-4 relative">
        <div
          className="rounded-lg text-light w-full p-4 h-[100px] bg-container-grey break-words whitespace-pre-wrap"
        >
          {review}
        </div>
        <div
          className="border-solid border-t-container-grey border-t-[12px] border-x-transparent border-x-[12px] border-b-0 absolute bottom-[-12px] left-[13px]"
        ></div>
      </div>

      <div className="flex gap-3 items-center mt-3">
        <UserAvatar user={user} size={50}/>
        <div>
          <div className="text-2xl font-bold">
            {user.name}
          </div>
          <div className="text-action text-xl">
            {Number(donation.amount)}{config.currency}
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-center justify-center mt-8">
        <UiButton
          color="primary"
          className="w-full rounded-full bg-[#0F61FF] font-medium"
          onClick={openTwitterShare}
        >
          <Image
            width={24}
            height={24}
            src={ShareXIcon}
            alt="X"
          />
          <div>
            Share on X
          </div>
        </UiButton>

        <UiButton
          color="primary"
          className="w-full rounded-full bg-[#0F61FF] font-medium"
          onClick={openLinkedinShare}
        >
          <Image
            width={24}
            height={24}
            src={ShareLinkedinIcon}
            alt="Linkedin"
          />
          <div>
            Share on Linkedin
          </div>
        </UiButton>
      </div>
    </div>
  );
}
