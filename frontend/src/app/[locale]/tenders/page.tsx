import { NoticeListPage, noticeListMetadata } from "@/components/notices/notice-pages";

export const generateMetadata = () => noticeListMetadata("tender");

export default function TendersPage({ searchParams }: PageProps<"/[locale]/tenders">) {
  return <NoticeListPage kind="tender" searchParams={searchParams} />;
}
