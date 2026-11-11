import { NoticeDetailPage, noticeMetadata, noticeStaticParams } from "@/components/notices/notice-pages";

type Props = PageProps<"/[locale]/jobs/[slug]">;

/** Notices published after the build render on their first visit and are then cached. */
export const instant = false;

export const generateStaticParams = ({ params }: { params: { locale: string } }) => noticeStaticParams("job", params.locale);

export const generateMetadata = ({ params }: Props) => noticeMetadata("job", params);

export default function JobPage({ params }: Props) {
  return <NoticeDetailPage kind="job" params={params} />;
}
