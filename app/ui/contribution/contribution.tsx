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
      <div className="flex gap-6">
        <div className="grow">
          <header className="flex gap-3 items-center">
            <Image
              width={18}
              height={18}
              src={MergeIcon}
              alt="Merge Request"
            />
            <h4 className="text-2xl">
              {contribution.title}
            </h4>
          </header>
          <div className="flex mt-6 gap-6">
            <div className="bg-container-grey rounded-lg p-4">
              <div className="text-light text-center">
                2 authors, 3 backers
              </div>
              <div className="text-action text-center">
                3 sections edited
              </div>
              <div className="flex border border-light-grey rounded-lg h-[40px] items-center mt-3">
                <div className="flex gap-3 items-center px-6">
                  <div className="text-[#00CB39]">+{contribution.linesAdded}</div>
                  <div className="text-[#FF120F]">+{contribution.linesRemoved}</div>
                  <div className="flex gap-1 items-center">
                    <Image
                      width={14}
                      height={14}
                      src={FilesIcon}
                      alt="Files"
                    />
                    <span>{contribution.filesChanged} file{contribution.filesChanged > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <a
                  href={contribution.link}
                  target="_blank"
                  rel="nofollow noopener"
                  className="flex gap-1 items-center px-3"
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
        <div className="flex flex-col">
          <header className="flex gap-1 items-center justify-center mb-4">
            <Image
              width={24}
              height={24}
              src={CoinsIcon}
              alt="Backing"
            />
            <span className="text-light">The Backing</span>
          </header>
          <div className="grow bg-container-grey rounded-lg p-4 flex items-center">
            <span className="text-5xl font-medium text-focus">
              34 ꜩ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
