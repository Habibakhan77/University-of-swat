import { NoticeListPage, noticeListMetadata } from "@/components/notices/notice-pages";

export const generateMetadata = () => noticeListMetadata("job");

export default function JobsPage({ searchParams }: PageProps<"/[locale]/jobs">) {
  return <NoticeListPage kind="job" searchParams={searchParams} />;
}
