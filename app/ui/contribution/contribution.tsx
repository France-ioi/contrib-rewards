import {MergeRequest} from "@/app/lib/definitions";
import MergeIcon from '@/public/icons/merge.svg';
import CoinsIcon from '@/public/icons/coins.svg';
import FilesIcon from '@/public/icons/files.svg';
import GitlabIcon from '@/public/icons/gitlab.svg';
import Image from "next/image";

interface ContributionProps {
  contribution: MergeRequest,
}

export default function Contribution({contribution}: ContributionProps) {
  return (
    <div className="rounded-lg shadow-card w-full p-4 bg-white">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="grow">
          <header className="flex gap-3 items-start">
            <Image
              width={24}
              height={24}
              src={MergeIcon}
              alt="Merge Request"
              className="mt-1"
            />
            <h4 className="text-2xl">
              {contribution.title}
            </h4>
          </header>
          <div className="flex flex-col md:flex-row mt-6 gap-6">
            <div className="bg-container-grey rounded-lg p-4">
              <div className="text-light text-center">
                2 authors, 3 backers
              </div>
              <div className="text-action text-center">
                3 sections edited
              </div>
              <div className="flex flex-col md:flex-row border border-light-grey rounded-lg items-center mt-3">
                <div className="flex gap-3 items-center px-6 h-[40px]">
                  <div className="text-[#00CB39]">+{contribution.linesAdded}</div>
                  <div className="text-[#FF120F]">+{contribution.linesRemoved}</div>
                  <div className="flex gap-1 items-center">
                    <Image
                      width={14}
                      height={14}
                      src={FilesIcon}
                      alt="Files"
                    />
                    <span className="text-nowrap">{contribution.filesChanged} file{contribution.filesChanged > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <a
                  href={contribution.link}
                  target="_blank"
                  rel="nofollow noopener"
                  className="flex gap-1 items-center px-3 h-[40px] border-t border-t-light-grey md:border-t-0 w-full justify-center"
                >
                  <span className="text-light">View at Gitlab</span>
                  <Image
                    width={16}
                    height={16}
                    src={GitlabIcon}
                    alt="Gitlab"
                  />
                </a>
              </div>
            </div>
            <div>
              top donor
            </div>
            <div>
              give
            </div>
          </div>
        </div>
        <div className="flex flex-row md:flex-col items-center justify-center gap-4">
          <header className="flex gap-1 items-center justify-center grow md:grow-0">
            <Image
              width={24}
              height={24}
              src={CoinsIcon}
              alt="Backing"
            />
            <span className="text-light">The Backing</span>
          </header>
          <div className="grow bg-container-grey rounded-lg p-4 flex items-center justify-center">
            <span className="text-5xl font-medium text-focus">
              34 ꜩ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
