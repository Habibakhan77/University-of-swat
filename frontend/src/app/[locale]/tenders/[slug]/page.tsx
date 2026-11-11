import { NoticeDetailPage, noticeMetadata, noticeStaticParams } from "@/components/notices/notice-pages";

type Props = PageProps<"/[locale]/tenders/[slug]">;

/** Notices published after the build render on their first visit and are then cached. */
export const instant = false;

export const generateStaticParams = ({ params }: { params: { locale: string } }) => noticeStaticParams("tender", params.locale);

export const generateMetadata = ({ params }: Props) => noticeMetadata("tender", params);

export default function TenderPage({ params }: Props) {
  return <NoticeDetailPage kind="tender" params={params} />;
}
